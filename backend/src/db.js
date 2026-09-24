const { Pool } = require('pg');

const requiredVariables = [
  'PGHOST',
  'PGPORT',
  'PGDATABASE',
  'PGUSER',
  'PGPASSWORD',
];

for (const name of requiredVariables) {
  if (!process.env[name]) {
    throw new Error(`Missing environment variable: ${name}`);
  }
}

const pool = new Pool({
  connectionTimeoutMillis: 5000,
});

pool.on('error', (error) => {
  console.error('Unexpected idle database connection error:', error);
});

module.exports = pool;