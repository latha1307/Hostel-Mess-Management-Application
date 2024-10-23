const sql = require('mssql');

// Configuration object for the new user connection
const config = {
    user: 'Latha', // The new user's username
    password: 'Hackathon2024!', // The new user's password
    server: 'localhost\\SQLEXPRESS', // The server name (or IP address)
    database: 'HostelManagementDB', // The database you want to connect to
    options: {
        encrypt: false,
        trustServerCertificate: true // Trust server certificate if required
    }
};

// Connect to the database
sql.connect(config)
    .then(pool => {
        console.log('Connected to SQL Server as Latha');
        // Your SQL query logic here
    })
    .catch(err => {
        console.error('Connection failed:', err);
    });
