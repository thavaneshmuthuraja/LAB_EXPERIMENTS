# Employee Management System API

A comprehensive Node.js and PostgreSQL REST API for employee management with full CRUD operations, advanced filtering, and HR analytics.

## Features

- **PostgreSQL Integration**: Full PostgreSQL integration with connection pooling
- **CRUD Operations**: Complete Create, Read, Update, Delete operations for employees
- **Advanced Filtering**: Filter by department, status, employment type, and search
- **Pagination**: Efficient pagination for large datasets
- **Employee Analytics**: Statistics, reports, and insights
- **Validation**: Comprehensive input validation using Joi
- **Error Handling**: Robust error handling with specific PostgreSQL error codes
- **Security**: Helmet for security headers, CORS enabled
- **Logging**: Morgan for request logging

## Installation

1. **Install Dependencies**:
   ```bash
   cd exp_9
   npm install
   ```

2. **Set up PostgreSQL**:
   - Make sure PostgreSQL is running on your system
   - Create a database named `employee_management`
   - Update the connection details in `.env` file

3. **Environment Variables**:
   Create a `.env` file with:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=employee_management
   DB_USER=postgres
   DB_PASSWORD=password
   NODE_ENV=development
   ```

4. **Initialize Database**:
   Run the SQL schema to create tables:
   ```bash
   psql -U postgres -d employee_management -f config/schema.sql
   ```

## Usage

Start the server:
```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Base URL: `http://localhost:3000/api/employees`

### Employee Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all employees with filtering and pagination |
| GET | `/:id` | Get single employee by ID |
| GET | `/employee-id/:employeeId` | Get employee by employee ID |
| POST | `/` | Create new employee |
| PUT | `/:id` | Update entire employee |
| PATCH | `/:id` | Partially update employee |
| DELETE | `/:id` | Soft delete employee |

### Specialized Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats/summary` | Get employee statistics |
| GET | `/birthdays/upcoming` | Get upcoming birthdays (next 30 days) |

### Utility

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health check |

## Request/Response Examples

### Create Employee
```bash
POST /api/employees
Content-Type: application/json

{
  "employee_id": "EMP006",
  "first_name": "Alice",
  "last_name": "Anderson",
  "email": "alice.anderson@company.com",
  "phone": "555-0106",
  "date_of_birth": "1990-05-15",
  "hire_date": "2023-01-10",
  "job_title": "Project Manager",
  "department_id": 1,
  "salary": 70000.00,
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "USA",
  "emergency_contact_name": "Bob Anderson",
  "emergency_contact_phone": "555-0107",
  "status": "active",
  "employment_type": "full_time"
}
```

### Get Employees with Filtering
```bash
GET /api/employees?department_id=1&status=active&page=1&limit=10&sortBy=last_name&sortOrder=asc
```

### Search Employees
```bash
GET /api/employees?search=alice
```

### Update Employee
```bash
PATCH /api/employees/1
Content-Type: application/json

{
  "salary": 75000.00,
  "job_title": "Senior Project Manager"
}
```

## Data Model

### Employee Schema
```sql
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    hire_date DATE NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    salary DECIMAL(10, 2) NOT NULL,
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    employment_type VARCHAR(20) DEFAULT 'full_time',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Department Schema
```sql
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    manager_id INTEGER REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Validation Rules

### Employee Validation
- **employee_id**: Required, uppercase letters, numbers, hyphens only
- **first_name**: Required, 2-50 characters
- **last_name**: Required, 2-50 characters
- **email**: Required, valid email format
- **phone**: Optional, max 20 characters
- **date_of_birth**: Optional, must be in the past
- **hire_date**: Required, must be today or in the past
- **job_title**: Required, 2-100 characters
- **department_id**: Optional, must be positive integer
- **salary**: Required, must be positive
- **status**: Optional, must be one of: active, inactive, terminated, on_leave
- **employment_type**: Optional, must be one of: full_time, part_time, contract, intern

## Query Parameters

### Filtering
- `department_id`: Filter by department ID
- `status`: Filter by employee status
- `employment_type`: Filter by employment type
- `search`: Search in first_name, last_name, email, job_title, employee_id

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Sorting
- `sortBy`: Field to sort by (default: created_at)
- `sortOrder`: asc/desc (default: desc)

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message",
  "details": ["Detailed error messages"] // For validation errors
}
```

### PostgreSQL Error Codes
- `23505`: Unique constraint violation
- `23503`: Foreign key constraint violation
- `23502`: Not null constraint violation

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `404`: Not Found
- `500`: Internal Server Error

## Database Schema

The application uses PostgreSQL with the following tables:
- `employees`: Stores all employee information
- `departments`: Stores department information
- `attendance`: Employee attendance records
- `performance_reviews`: Performance review records
- `leave_requests`: Leave request records

### Indexes
- Primary keys on all tables
- Unique constraints on employee_id and email
- Foreign key constraints with proper relationships
- Indexes on frequently queried fields

## Dependencies

- **express**: Web framework
- **pg**: PostgreSQL client
- **cors**: Cross-Origin Resource Sharing
- **helmet**: Security middleware
- **morgan**: HTTP request logger
- **dotenv**: Environment variable management
- **joi**: Data validation library
- **bcryptjs**: Password hashing (for future authentication)
- **jsonwebtoken**: JWT tokens (for future authentication)

## Testing

You can use tools like Postman, curl, or any HTTP client to test the API.

Example with curl:
```bash
# Health check
curl http://localhost:3000/api/health

# Get all employees
curl http://localhost:3000/api/employees

# Create employee
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMP007",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@company.com",
    "hire_date": "2023-01-01",
    "job_title": "Developer",
    "department_id": 1,
    "salary": 60000
  }'
```

## Development

The application includes comprehensive error handling, validation, and logging for development and debugging purposes. The database schema includes triggers for automatic timestamp updates and proper constraint handling.

## Sample Data

The schema.sql file includes sample departments and employees to help you get started with testing the API immediately after database setup.
