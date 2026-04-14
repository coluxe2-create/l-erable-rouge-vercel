import pg from 'pg';

const { Pool } = pg;

let connectionString = process.env.DATABASE_URL;

if (connectionString === 'undefined') {
  connectionString = undefined;
}

if (!connectionString) {
  console.error('CRITICAL ERROR: DATABASE_URL environment variable is missing or "undefined".');
  console.error('Please set DATABASE_URL in the Settings menu (e.g., postgresql://user:pass@host/dbname?sslmode=require)');
}

const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1') ? false : {
    rejectUnauthorized: false,
  },
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
