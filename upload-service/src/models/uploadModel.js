/**
 * src/models/uploadModel.js
 * -----------------------------------------------------------------------
 * The ONLY file that talks to MySQL. Each insert* function receives
 * already-validated rows and is responsible for:
 *   - resolving foreign keys (category_name -> category_id,
 *     customer_email -> customer_id)
 *   - inserting rows inside a transaction (all-or-nothing)
 *   - returning a summary of what was inserted
 *
 * Every function takes a `connection` that the caller (uploadModel's own
 * transactional wrapper, invoked from the controller) has already
 * obtained from the pool via pool.getConnection() + beginTransaction().
 * This keeps commit/rollback in one place instead of duplicated per
 * entity.
 * -----------------------------------------------------------------------
 */

const { pool } = require('../config/db');

// ------------------------------------------------------------------
// Foreign-key resolution helpers
// ------------------------------------------------------------------

/**
 * Find or create a category by name, returning its id.
 * Used to resolve products.category_id from a human-friendly
 * "category_name" column in the uploaded file.
 */
async function resolveCategoryId(connection, categoryName) {
  const [rows] = await connection.query(
    'SELECT id FROM categories WHERE name = ? LIMIT 1',
    [categoryName]
  );

  if (rows.length > 0) return rows[0].id;

  const [result] = await connection.query(
    'INSERT INTO categories (name) VALUES (?)',
    [categoryName]
  );
  return result.insertId;
}

/**
 * Look up a customer's id by email. Unlike categories, we do NOT
 * auto-create customers from an orders import — an order for an unknown
 * customer is treated as a data error, not something to silently patch
 * over.
 */
async function findCustomerIdByEmail(connection, email) {
  const [rows] = await connection.query(
    'SELECT id FROM customers WHERE email = ? LIMIT 1',
    [email]
  );
  return rows.length > 0 ? rows[0].id : null;
}

// ------------------------------------------------------------------
// Entity inserters — each runs inside the transaction the caller started
// ------------------------------------------------------------------

async function insertCategories(connection, rows) {
  let inserted = 0;
  for (const row of rows) {
    // INSERT ... ON DUPLICATE KEY UPDATE lets re-uploading the same
    // category update its description instead of failing the whole batch.
    await connection.query(
      `INSERT INTO categories (name, description)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE description = VALUES(description)`,
      [row.name, row.description || null]
    );
    inserted += 1;
  }
  return inserted;
}

async function insertProducts(connection, rows) {
  let inserted = 0;
  for (const row of rows) {
    const categoryId = await resolveCategoryId(connection, row.category_name);

    await connection.query(
      `INSERT INTO products (name, sku, category_id, price, stock_quantity)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         category_id = VALUES(category_id),
         price = VALUES(price),
         stock_quantity = VALUES(stock_quantity)`,
      [
        row.name,
        row.sku || null,
        categoryId,
        Number(row.price),
        row.stock_quantity !== undefined && row.stock_quantity !== ''
          ? Number(row.stock_quantity)
          : 0
      ]
    );
    inserted += 1;
  }
  return inserted;
}

async function insertCustomers(connection, rows) {
  let inserted = 0;
  for (const row of rows) {
    await connection.query(
      `INSERT INTO customers (name, email, phone, address)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         phone = VALUES(phone),
         address = VALUES(address)`,
      [row.name, row.email, row.phone || null, row.address || null]
    );
    inserted += 1;
  }
  return inserted;
}

async function insertOrders(connection, rows) {
  let inserted = 0;
  const unresolvedCustomers = [];

  for (const row of rows) {
    const customerId = await findCustomerIdByEmail(connection, row.customer_email);

    if (!customerId) {
      // Collected and thrown after the loop so the caller gets ALL
      // problem rows in one error instead of failing on the first one.
      unresolvedCustomers.push(row.customer_email);
      continue;
    }

    await connection.query(
      `INSERT INTO orders (customer_id, order_date, total_amount, status)
       VALUES (?, ?, ?, ?)`,
      [customerId, row.order_date, Number(row.total_amount), row.status || 'pending']
    );
    inserted += 1;
  }

  if (unresolvedCustomers.length > 0) {
    const err = new Error(
      `No matching customer found for email(s): ${[...new Set(unresolvedCustomers)].join(', ')}. ` +
        `Import customers first or fix the customer_email column.`
    );
    err.statusCode = 422;
    throw err;
  }

  return inserted;
}

const INSERTERS = {
  categories: insertCategories,
  products: insertProducts,
  customers: insertCustomers,
  orders: insertOrders
};

/**
 * Insert validated rows for a given entity type, wrapped in a single
 * transaction. Rolls back entirely if any row fails.
 *
 * @param {string} entityType
 * @param {Array<Object>} rows - already-validated rows
 * @returns {Promise<number>} number of rows inserted
 */
async function insertEntityRows(entityType, rows) {
  const inserter = INSERTERS[entityType];
  if (!inserter) {
    throw new Error(`No inserter defined for entityType "${entityType}"`);
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const insertedCount = await inserter(connection, rows);
    await connection.commit();
    return insertedCount;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// ------------------------------------------------------------------
// upload_history (used by the optional GET/DELETE history endpoints)
// ------------------------------------------------------------------

async function logUploadHistory({
  fileName,
  entityType,
  fileType,
  totalRows,
  insertedRows,
  status,
  errorMessage
}) {
  await pool.query(
    `INSERT INTO upload_history
       (file_name, entity_type, file_type, total_rows, inserted_rows, status, error_message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [fileName, entityType, fileType, totalRows, insertedRows, status, errorMessage || null]
  );
}

async function getUploadHistory() {
  const [rows] = await pool.query(
    'SELECT * FROM upload_history ORDER BY created_at DESC'
  );
  return rows;
}

async function deleteUploadHistoryRecord(id) {
  const [result] = await pool.query('DELETE FROM upload_history WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  insertEntityRows,
  logUploadHistory,
  getUploadHistory,
  deleteUploadHistoryRecord
};
