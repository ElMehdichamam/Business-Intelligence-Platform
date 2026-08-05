const pool = require('../config/db');

/**
 * Create a new user. Expects an already-hashed password.
 */
async function createUser({ username, email, password, role }) {
  const [result] = await pool.query(
    `INSERT INTO users (username, email, password, role)
     VALUES (?, ?, ?, ?)`,
    [username, email, password, role || 'employee']
  );

  return findUserById(result.insertId);
}

/**
 * Find a user by email, including the password hash.
 * Used internally for login — never return this row directly to a client.
 */
async function findUserByEmail(email) {
  const [rows] = await pool.query(
    `SELECT user_id, username, email, password, role, created_at
     FROM users WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
}

/**
 * Find a user by id, excluding the password hash.
 */
async function findUserById(userId) {
  const [rows] = await pool.query(
    `SELECT user_id, username, email, role, created_at
     FROM users WHERE user_id = ?`,
    [userId]
  );
  return rows[0] || null;
}

/**
 * Fetch all users, excluding password hashes.
 */
async function findAllUsers() {
  const [rows] = await pool.query(
    `SELECT user_id, username, email, role, created_at
     FROM users ORDER BY user_id ASC`
  );
  return rows;
}

/**
 * Update a user's mutable fields (username, email, role).
 * Only fields provided in `fields` are updated.
 */
async function updateUser(userId, fields) {
  const allowed = ['username', 'email', 'role'];
  const keys = Object.keys(fields).filter((key) => allowed.includes(key));

  if (keys.length === 0) {
    return findUserById(userId);
  }

  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  const values = keys.map((key) => fields[key]);

  await pool.query(
    `UPDATE users SET ${setClause} WHERE user_id = ?`,
    [...values, userId]
  );

  return findUserById(userId);
}

/**
 * Delete a user by id. Returns true if a row was deleted.
 */
async function deleteUser(userId) {
  const [result] = await pool.query(
    `DELETE FROM users WHERE user_id = ?`,
    [userId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findAllUsers,
  updateUser,
  deleteUser
};
