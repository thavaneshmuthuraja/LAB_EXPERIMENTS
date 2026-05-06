const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/database');
const employeeRoutes = require('./routes/employees');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to PostgreSQL
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/employees', employeeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Employee Management API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        database: 'PostgreSQL'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // PostgreSQL specific errors
    if (err.code === '23505') {
        return res.status(400).json({
            success: false,
            error: 'Duplicate entry. This record already exists.'
        });
    }
    
    if (err.code === '23503') {
        return res.status(400).json({
            success: false,
            error: 'Foreign key constraint violation. Referenced record does not exist.'
        });
    }
    
    if (err.code === '23502') {
        return res.status(400).json({
            success: false,
            error: 'Null value not allowed for required field.'
        });
    }
    
    // Default error
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Something went wrong!'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Employee Management API server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`API Documentation: http://localhost:${PORT}/api/employees`);
});

module.exports = app;
