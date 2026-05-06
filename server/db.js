const { Pool } = require('pg');
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Create connection pool


// Aiven PostgreSQL usually provides a connection string. If provided, use it, else fallback to individual vars.
const poolConfig = process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
} : {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gersalud_db',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
};

const pool = new Pool(poolConfig);

module.exports = pool;
