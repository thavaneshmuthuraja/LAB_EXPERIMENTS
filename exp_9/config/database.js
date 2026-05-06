const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log(`PostgreSQL Connected: ${client.database}`);
        console.log(`Host: ${client.host}`);
        console.log(`Port: ${client.port}`);
        client.release();
        
        // Handle connection errors
        pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
        
        // Graceful shutdown
        process.on('SIGINT', async () => {
            await pool.end();
            console.log('PostgreSQL connection pool closed');
            process.exit(0);
        });
        
    } catch (error) {
        console.error('Error connecting to PostgreSQL:', error.message);
        process.exit(1);
    }
};

module.exports = { pool, connectDB };
