const sql = require('mssql/msnodesqlv8');

// Database connection configuration
const config = {
    user: 'Latha', // The new user's username
    password: 'Hackathon2024!', // The new user's password
    server: 'localhost\\SQLEXPRESS', // The server name (or IP address)
    database: 'HostelManagementDB', // The database you want to connect to
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
