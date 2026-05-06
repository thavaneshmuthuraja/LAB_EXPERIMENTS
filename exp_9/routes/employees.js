const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Joi = require('joi');

// Validation schemas
const employeeCreateSchema = Joi.object({
    employee_id: Joi.string().required().pattern(/^[A-Z0-9-]+$/),
    first_name: Joi.string().required().min(2).max(50),
    last_name: Joi.string().required().min(2).max(50),
    email: Joi.string().required().email(),
    phone: Joi.string().optional().max(20),
    date_of_birth: Joi.date().optional().max('now'),
    hire_date: Joi.date().required().max('now'),
    job_title: Joi.string().required().min(2).max(100),
    department_id: Joi.number().integer().positive().optional(),
    salary: Joi.number().positive().required(),
    address: Joi.string().optional().max(500),
    city: Joi.string().optional().max(50),
    state: Joi.string().optional().max(50),
    postal_code: Joi.string().optional().max(20),
    country: Joi.string().optional().max(50),
    emergency_contact_name: Joi.string().optional().max(100),
    emergency_contact_phone: Joi.string().optional().max(20),
    status: Joi.string().optional().valid('active', 'inactive', 'terminated', 'on_leave'),
    employment_type: Joi.string().optional().valid('full_time', 'part_time', 'contract', 'intern')
});

const employeeUpdateSchema = Joi.object({
    first_name: Joi.string().optional().min(2).max(50),
    last_name: Joi.string().optional().min(2).max(50),
    email: Joi.string().optional().email(),
    phone: Joi.string().optional().max(20),
    date_of_birth: Joi.date().optional().max('now'),
    job_title: Joi.string().optional().min(2).max(100),
    department_id: Joi.number().integer().positive().optional(),
    salary: Joi.number().positive().optional(),
    address: Joi.string().optional().max(500),
    city: Joi.string().optional().max(50),
    state: Joi.string().optional().max(50),
    postal_code: Joi.string().optional().max(20),
    country: Joi.string().optional().max(50),
    emergency_contact_name: Joi.string().optional().max(100),
    emergency_contact_phone: Joi.string().optional().max(20),
    status: Joi.string().optional().valid('active', 'inactive', 'terminated', 'on_leave'),
    employment_type: Joi.string().optional().valid('full_time', 'part_time', 'contract', 'intern')
});

// Middleware for validation
const validateEmployee = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: error.details.map(detail => detail.message)
            });
        }
        next();
    };
};

// GET all employees with filtering and pagination
router.get('/', async (req, res) => {
    try {
        const filters = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            department_id: req.query.department_id,
            status: req.query.status,
            employment_type: req.query.employment_type,
            search: req.query.search,
            sortBy: req.query.sortBy || 'created_at',
            sortOrder: req.query.sortOrder || 'desc'
        };

        const result = await Employee.getAll(filters);
        
        res.json({
            success: true,
            data: result.employees,
            pagination: result.pagination
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET single employee by ID
router.get('/:id', async (req, res) => {
    try {
        const employee = await Employee.getById(req.params.id);
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET employee by employee_id
router.get('/employee-id/:employeeId', async (req, res) => {
    try {
        const employee = await Employee.getByEmployeeId(req.params.employeeId);
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST create new employee
router.post('/', validateEmployee(employeeCreateSchema), async (req, res) => {
    try {
        const employee = await Employee.create(req.body);
        
        res.status(201).json({
            success: true,
            data: employee,
            message: 'Employee created successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// PUT update employee
router.put('/:id', validateEmployee(employeeUpdateSchema), async (req, res) => {
    try {
        const employee = await Employee.update(req.params.id, req.body);
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: employee,
            message: 'Employee updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// PATCH partially update employee
router.patch('/:id', validateEmployee(employeeUpdateSchema), async (req, res) => {
    try {
        const employee = await Employee.update(req.params.id, req.body);
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: employee,
            message: 'Employee updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// DELETE employee (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const employee = await Employee.delete(req.params.id);
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: employee,
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET employee statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = await Employee.getStatistics();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET upcoming birthdays
router.get('/birthdays/upcoming', async (req, res) => {
    try {
        const birthdays = await Employee.getUpcomingBirthdays();
        
        res.json({
            success: true,
            data: birthdays,
            count: birthdays.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
