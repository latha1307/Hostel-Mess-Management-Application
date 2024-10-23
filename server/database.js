const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

// Database connection configuration
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true // Trust server certificate if required
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

async function openPool() {
    try {
        const pool = await sql.connect(config);
        console.log('Database connected!');
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
}

module.exports = { openPool };
