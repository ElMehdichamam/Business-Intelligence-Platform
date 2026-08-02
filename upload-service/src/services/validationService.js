/**
 * src/services/validationService.js
 * -----------------------------------------------------------------------
 * Validates parsed rows (from csvService/excelService) before anything
 * touches the database. Checks performed, per row:
 *   1. Required fields are present
 *   2. No empty values in required fields
 *   3. Numeric fields actually contain valid numbers
 *   4. No duplicate rows within the uploaded file itself
 *      (duplicate = same value(s) on the entity's natural key)
 *
 * The service is data-driven: ENTITY_RULES describes what "valid" means
 * for each of the four supported entities, so validateRows() itself
 * stays generic and easy to extend (e.g. adding a 5th entity later is a
 * config change, not new branching logic).
 * -----------------------------------------------------------------------
 */

const ENTITY_RULES = {
  categories: {
    requiredFields: ['name'],
    numericFields: [],
    // Rows are considered duplicates if they share the same "name"
    // (case-insensitive) within this one uploaded file.
    duplicateKey: (row) => (row.name || '').toLowerCase()
  },
  products: {
    requiredFields: ['name', 'category_name', 'price'],
    numericFields: ['price', 'stock_quantity'],
    duplicateKey: (row) => {
      // Prefer SKU when present (it's the real natural key); otherwise
      // fall back to name+category so plain "name" clashes across
      // different categories aren't false positives.
      if (row.sku) return `sku:${String(row.sku).toLowerCase()}`;
      return `name:${(row.name || '').toLowerCase()}|${(row.category_name || '').toLowerCase()}`;
    }
  },
  customers: {
    requiredFields: ['name', 'email'],
    numericFields: [],
    duplicateKey: (row) => (row.email || '').toLowerCase()
  },
  orders: {
    requiredFields: ['customer_email', 'order_date', 'total_amount'],
    numericFields: ['total_amount'],
    duplicateKey: (row) =>
      `${(row.customer_email || '').toLowerCase()}|${row.order_date}|${row.total_amount}`
  }
};

const SUPPORTED_ENTITIES = Object.keys(ENTITY_RULES);

/**
 * @param {string} value
 * @returns {boolean} true if the value is a valid finite number
 */
function isValidNumber(value) {
  if (value === null || value === undefined || value === '') return false;
  const num = Number(value);
  return Number.isFinite(num);
}

/**
 * Validate all parsed rows for a given entity type.
 *
 * @param {string} entityType - one of 'categories' | 'products' | 'customers' | 'orders'
 * @param {Array<Object>} rows - rows parsed from the uploaded file
 * @returns {{ isValid: boolean, errors: Array<Object>, validRows: Array<Object> }}
 */
function validateRows(entityType, rows) {
  const rules = ENTITY_RULES[entityType];

  if (!rules) {
    throw new Error(
      `Unsupported entityType "${entityType}". Expected one of: ${SUPPORTED_ENTITIES.join(', ')}`
    );
  }

  const errors = [];
  const validRows = [];
  const seenKeys = new Map(); // duplicateKey -> first row number that used it

  if (!Array.isArray(rows) || rows.length === 0) {
    errors.push({ row: null, field: null, message: 'Uploaded file contains no data rows' });
    return { isValid: false, errors, validRows: [] };
  }

  rows.forEach((row, index) => {
    // Row numbers are 1-based and account for the header row, so they
    // match what the user sees if they open the file in Excel.
    const rowNumber = index + 2;
    const rowErrors = [];

    // 1 & 2. Required fields present and non-empty
    for (const field of rules.requiredFields) {
      const value = row[field];
      if (value === undefined || value === null || String(value).trim() === '') {
        rowErrors.push({
          row: rowNumber,
          field,
          message: `Missing or empty required field "${field}"`
        });
      }
    }

    // 3. Numeric fields must be valid numbers (only checked if present,
    // since "required" is already enforced separately above)
    for (const field of rules.numericFields) {
      const value = row[field];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        if (!isValidNumber(value)) {
          rowErrors.push({
            row: rowNumber,
            field,
            message: `Field "${field}" must be a valid number, got "${value}"`
          });
        }
      }
    }

    // 4. Duplicate rows within this file
    const key = rules.duplicateKey(row);
    if (key && seenKeys.has(key)) {
      rowErrors.push({
        row: rowNumber,
        field: null,
        message: `Duplicate row — matches row ${seenKeys.get(key)} already in this file`
      });
    } else if (key) {
      seenKeys.set(key, rowNumber);
    }

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else {
      validRows.push(row);
    }
  });

  return { isValid: errors.length === 0, errors, validRows };
}

module.exports = { validateRows, SUPPORTED_ENTITIES, ENTITY_RULES };
