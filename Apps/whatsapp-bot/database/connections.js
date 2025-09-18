const { Pool } = require('pg');
require('dotenv').config();

// Primary (legacy) pool for backward compatibility if needed
const defaultPool = new Pool({
  user: process.env.DB_USER || process.env.DEFAULT_DB_USER || 'postgres',
  host: process.env.DB_HOST || process.env.DEFAULT_DB_HOST || 'localhost',
  database: process.env.DB_NAME || process.env.DEFAULT_DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || process.env.DEFAULT_DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || process.env.DEFAULT_DB_PORT || '5432'),
});

// Dedicated pool for auth service database
const authPool = new Pool({
  user: process.env.AUTH_DB_USER || process.env.DB_USER || 'postgres',
  host: process.env.AUTH_DB_HOST || process.env.DB_HOST || 'localhost',
  database: process.env.AUTH_DB_NAME || process.env.AUTH_DB || 'auth_db',
  password: process.env.AUTH_DB_PASSWORD || process.env.DB_PASSWORD,
  port: parseInt(process.env.AUTH_DB_PORT || process.env.DB_PORT || '5432'),
});

// Dedicated pool for doctor service database
const doctorPool = new Pool({
  user: process.env.DOCTOR_DB_USER || process.env.DB_USER || 'postgres',
  host: process.env.DOCTOR_DB_HOST || process.env.DB_HOST || 'localhost',
  database: process.env.DOCTOR_DB_NAME || process.env.DOCTOR_DB || 'doctor_db',
  password: process.env.DOCTOR_DB_PASSWORD || process.env.DB_PASSWORD,
  port: parseInt(process.env.DOCTOR_DB_PORT || process.env.DB_PORT || '5432'),
});

// Log connections for visibility
defaultPool.on('connect', () => {
  console.log(`[DB] Connected default pool to ${process.env.DB_HOST || 'localhost'}/${process.env.DB_NAME || process.env.DEFAULT_DB_NAME || 'postgres'}`);
});
authPool.on('connect', () => {
  console.log(`[DB] Connected auth pool to ${process.env.AUTH_DB_HOST || process.env.DB_HOST || 'localhost'}/${process.env.AUTH_DB_NAME || 'auth_db'}`);
});
doctorPool.on('connect', () => {
  console.log(`[DB] Connected doctor pool to ${process.env.DOCTOR_DB_HOST || process.env.DB_HOST || 'localhost'}/${process.env.DOCTOR_DB_NAME || 'doctor_db'}`);
});

defaultPool.on('error', (err) => console.error('[DB] Default pool error:', err));
authPool.on('error', (err) => console.error('[DB] Auth pool error:', err));
doctorPool.on('error', (err) => console.error('[DB] Doctor pool error:', err));

// Helper to select a pool by name
function getPool(name) {
  switch ((name || '').toLowerCase()) {
    case 'auth':
    case 'auth_db':
      return authPool;
    case 'doctor':
    case 'doctor_db':
      return doctorPool;
    default:
      return defaultPool;
  }
}

module.exports = {
  // Legacy single-query interface (default)
  query: (text, params) => defaultPool.query(text, params),
  pool: defaultPool,

  // Named pools
  authDb: {
    query: (text, params) => authPool.query(text, params),
    pool: authPool,
  },
  doctorDb: {
    query: (text, params) => doctorPool.query(text, params),
    pool: doctorPool,
  },

  // Generic accessor
  getPool,
};