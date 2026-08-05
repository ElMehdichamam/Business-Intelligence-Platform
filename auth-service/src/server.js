require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Fail fast if the DB is unreachable
    const conn = await pool.getConnection();
    conn.release();
    console.log('Connected to MySQL database');

    app.listen(PORT, () => {
      console.log(`auth-service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start auth-service:', err.message);
    process.exit(1);
  }
}

start();
