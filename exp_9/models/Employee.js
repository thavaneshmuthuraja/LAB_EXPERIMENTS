const { pool } = require('../config/database');

class Employee {
    // Get all employees with pagination and filtering
    static async getAll(filters = {}) {
        const {
            page = 1,
            limit = 10,
            department_id,
            status,
            employment_type,
            search,
            sortBy = 'created_at',
            sortOrder = 'desc'
        } = filters;

        let query = `
            SELECT e.*, d.name as department_name 
            FROM employees e 
            LEFT JOIN departments d ON e.department_id = d.id 
            WHERE 1=1
        `;
        
        const params = [];
        let paramIndex = 1;

        // Add filters
        if (department_id) {
            query += ` AND e.department_id = $${paramIndex}`;
            params.push(department_id);
            paramIndex++;
        }

        if (status) {
            query += ` AND e.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (employment_type) {
            query += ` AND e.employment_type = $${paramIndex}`;
            params.push(employment_type);
            paramIndex++;
        }

        if (search) {
            query += ` AND (
                e.first_name ILIKE $${paramIndex} OR 
                e.last_name ILIKE $${paramIndex} OR 
                e.email ILIKE $${paramIndex} OR 
                e.job_title ILIKE $${paramIndex} OR 
                e.employee_id ILIKE $${paramIndex}
            )`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Add sorting
        const validSortFields = ['first_name', 'last_name', 'email', 'hire_date', 'salary', 'created_at'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
        const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';
        query += ` ORDER BY e.${sortField} ${sortDirection}`;

        // Add pagination
        const offset = (page - 1) * limit;
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        try {
            const result = await pool.query(query, params);
            
            // Get total count
            let countQuery = `
                SELECT COUNT(*) as total 
                FROM employees e 
                WHERE 1=1
            `;
            const countParams = [];
            let countParamIndex = 1;

            if (department_id) {
                countQuery += ` AND e.department_id = $${countParamIndex}`;
                countParams.push(department_id);
                countParamIndex++;
            }

            if (status) {
                countQuery += ` AND e.status = $${countParamIndex}`;
                countParams.push(status);
                countParamIndex++;
            }

            if (employment_type) {
                countQuery += ` AND e.employment_type = $${countParamIndex}`;
                countParams.push(employment_type);
                countParamIndex++;
            }

            if (search) {
                countQuery += ` AND (
                    e.first_name ILIKE $${countParamIndex} OR 
                    e.last_name ILIKE $${countParamIndex} OR 
                    e.email ILIKE $${countParamIndex} OR 
                    e.job_title ILIKE $${countParamIndex} OR 
                    e.employee_id ILIKE $${countParamIndex}
                )`;
                countParams.push(`%${search}%`);
                countParamIndex++;
            }

            const countResult = await pool.query(countQuery, countParams);
            const total = parseInt(countResult.rows[0].total);

            return {
                employees: result.rows,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            };
        } catch (error) {
            throw new Error(`Error fetching employees: ${error.message}`);
        }
    }

    // Get employee by ID
    static async getById(id) {
        try {
            const query = `
                SELECT e.*, d.name as department_name 
                FROM employees e 
                LEFT JOIN departments d ON e.department_id = d.id 
                WHERE e.id = $1
            `;
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error fetching employee: ${error.message}`);
        }
    }

    // Get employee by employee_id
    static async getByEmployeeId(employeeId) {
        try {
            const query = `
                SELECT e.*, d.name as department_name 
                FROM employees e 
                LEFT JOIN departments d ON e.department_id = d.id 
                WHERE e.employee_id = $1
            `;
            const result = await pool.query(query, [employeeId]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error fetching employee: ${error.message}`);
        }
    }

    // Create new employee
    static async create(employeeData) {
        const {
            employee_id,
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            hire_date,
            job_title,
            department_id,
            salary,
            address,
            city,
            state,
            postal_code,
            country,
            emergency_contact_name,
            emergency_contact_phone,
            status = 'active',
            employment_type = 'full_time'
        } = employeeData;

        try {
            const query = `
                INSERT INTO employees (
                    employee_id, first_name, last_name, email, phone, date_of_birth,
                    hire_date, job_title, department_id, salary, address, city,
                    state, postal_code, country, emergency_contact_name,
                    emergency_contact_phone, status, employment_type
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
                ) RETURNING *
            `;

            const values = [
                employee_id, first_name, last_name, email, phone, date_of_birth,
                hire_date, job_title, department_id, salary, address, city,
                state, postal_code, country, emergency_contact_name,
                emergency_contact_phone, status, employment_type
            ];

            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('Employee ID or email already exists');
            }
            throw new Error(`Error creating employee: ${error.message}`);
        }
    }

    // Update employee
    static async update(id, updateData) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        // Build dynamic update query
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(updateData[key]);
                paramIndex++;
            }
        });

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        try {
            const query = `
                UPDATE employees 
                SET ${fields.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING *
            `;

            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('Email already exists');
            }
            throw new Error(`Error updating employee: ${error.message}`);
        }
    }

    // Delete employee (soft delete by setting status to inactive)
    static async delete(id) {
        try {
            const query = `
                UPDATE employees 
                SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `;
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error deleting employee: ${error.message}`);
        }
    }

    // Get employee statistics
    static async getStatistics() {
        try {
            const queries = [
                // Total employees
                pool.query('SELECT COUNT(*) as total FROM employees'),
                // Employees by department
                pool.query(`
                    SELECT d.name, COUNT(e.id) as count 
                    FROM departments d 
                    LEFT JOIN employees e ON d.id = e.department_id 
                    GROUP BY d.name 
                    ORDER BY count DESC
                `),
                // Employees by status
                pool.query(`
                    SELECT status, COUNT(*) as count 
                    FROM employees 
                    GROUP BY status
                `),
                // Employees by employment type
                pool.query(`
                    SELECT employment_type, COUNT(*) as count 
                    FROM employees 
                    GROUP BY employment_type
                `),
                // Average salary
                pool.query('SELECT AVG(salary) as avg_salary FROM employees'),
                // Recent hires (last 30 days)
                pool.query(`
                    SELECT COUNT(*) as recent_hires 
                    FROM employees 
                    WHERE hire_date >= CURRENT_DATE - INTERVAL '30 days'
                `)
            ];

            const results = await Promise.all(queries);

            return {
                total: parseInt(results[0].rows[0].total),
                byDepartment: results[1].rows,
                byStatus: results[2].rows,
                byEmploymentType: results[3].rows,
                averageSalary: parseFloat(results[4].rows[0].avg_salary || 0),
                recentHires: parseInt(results[5].rows[0].recent_hires)
            };
        } catch (error) {
            throw new Error(`Error fetching statistics: ${error.message}`);
        }
    }

    // Get employees with upcoming birthdays (next 30 days)
    static async getUpcomingBirthdays() {
        try {
            const query = `
                SELECT id, first_name, last_name, email, date_of_birth,
                    EXTRACT(DAY FROM date_of_birth) as day,
                    EXTRACT(MONTH FROM date_of_birth) as month
                FROM employees 
                WHERE status = 'active'
                    AND (
                        (EXTRACT(MONTH FROM date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE)
                        AND EXTRACT(DAY FROM date_of_birth) >= EXTRACT(DAY FROM CURRENT_DATE))
                        OR
                        (EXTRACT(MONTH FROM date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE + INTERVAL '1 month')
                        AND EXTRACT(DAY FROM date_of_birth) <= EXTRACT(DAY FROM CURRENT_DATE))
                    )
                ORDER BY EXTRACT(MONTH FROM date_of_birth), EXTRACT(DAY FROM date_of_birth)
                LIMIT 10
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching upcoming birthdays: ${error.message}`);
        }
    }
}

module.exports = Employee;
