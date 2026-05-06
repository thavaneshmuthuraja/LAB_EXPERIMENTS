# PostgreSQL Setup Instructions

## Prerequisites

Before running the Employee Management API, you need to set up PostgreSQL on your system.

## Windows Setup

### Option 1: Using Chocolatey
```bash
# Install Chocolatey if not already installed
# Run PowerShell as Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install PostgreSQL
choco install postgresql

# Start PostgreSQL service
net start postgresql-x64-14
```

### Option 2: Download from Official Site
1. Go to https://www.postgresql.org/download/windows/
2. Download and run the installer
3. Remember the password you set for the postgres user
4. Install pgAdmin (optional but recommended)

### Option 3: Using Docker
```bash
# Pull PostgreSQL image
docker pull postgres:14

# Run PostgreSQL container
docker run --name postgres-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=employee_management -p 5432:5432 -d postgres:14
```

## Database Setup

1. **Create Database**:
   ```sql
   CREATE DATABASE employee_management;
   ```

2. **Run Schema**:
   ```bash
   psql -U postgres -d employee_management -f config/schema.sql
   ```

   Or using pgAdmin:
   - Connect to your PostgreSQL server
   - Select the `employee_management` database
   - Open Query Tool
   - Copy and paste the contents of `config/schema.sql`
   - Execute the query

## Environment Configuration

Update your `.env` file with your PostgreSQL credentials:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=employee_management
DB_USER=postgres
DB_PASSWORD=your_postgres_password
NODE_ENV=development
```

## Verify Installation

1. **Test Connection**:
   ```bash
   psql -U postgres -h localhost -p 5432 -d employee_management
   ```

2. **Check Tables**:
   ```sql
   \dt
   ```

3. **Check Sample Data**:
   ```sql
   SELECT * FROM employees LIMIT 5;
   SELECT * FROM departments;
   ```

## Common Issues

### Connection Refused
- Make sure PostgreSQL service is running
- Check if port 5432 is available
- Verify firewall settings

### Authentication Failed
- Check username and password in `.env`
- Ensure the user has permissions for the database

### Database Doesn't Exist
- Create the database using the command above
- Check the database name in `.env` matches exactly

## Starting the Application

Once PostgreSQL is set up:

```bash
cd exp_9
npm start
```

The API will be available at `http://localhost:3000`

## Testing Without PostgreSQL

If you want to test the API structure without PostgreSQL, you can:

1. Comment out the `connectDB()` call in `index.js`
2. The health endpoint will work, but employee endpoints will return database errors

## Alternative: Use Online PostgreSQL

You can use online PostgreSQL services like:
- ElephantSQL (free tier available)
- Supabase
- Railway
- Heroku Postgres

Update your `.env` with the connection string provided by the service.
