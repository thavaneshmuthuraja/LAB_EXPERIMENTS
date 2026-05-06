# Inventory Management REST API

A comprehensive Express.js REST API for managing inventory items with routing, middleware, and validation.

## Features

- **CRUD Operations**: Create, Read, Update, Delete inventory items
- **Validation**: Input validation for all operations
- **Error Handling**: Comprehensive error handling middleware
- **Security**: Helmet for security headers, CORS enabled
- **Logging**: Morgan for request logging
- **Search**: Filter by category and low stock items
- **Health Check**: API health monitoring endpoint

## Installation

```bash
cd exp_7
npm install
```

## Usage

Start the server:
```bash
node index.js
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Base URL: `http://localhost:3000/api`

### Inventory Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory` | Get all inventory items |
| GET | `/inventory/:id` | Get single inventory item by ID |
| POST | `/inventory` | Create new inventory item |
| PUT | `/inventory/:id` | Update entire inventory item |
| PATCH | `/inventory/:id` | Partially update inventory item |
| DELETE | `/inventory/:id` | Delete inventory item |
| GET | `/inventory/category/:category` | Get items by category |
| GET | `/inventory/low-stock` | Get items with quantity < 10 |

### Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health check |

## Request/Response Examples

### Create Inventory Item
```bash
POST /api/inventory
Content-Type: application/json

{
  "name": "Wireless Mouse",
  "category": "Electronics",
  "quantity": 15,
  "price": 29.99,
  "description": "Ergonomic wireless mouse"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Wireless Mouse",
    "category": "Electronics",
    "quantity": 15,
    "price": 29.99,
    "description": "Ergonomic wireless mouse",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Inventory Item (Partial)
```bash
PATCH /api/inventory/uuid-here
Content-Type: application/json

{
  "quantity": 20,
  "price": 24.99
}
```

## Data Model

Each inventory item contains:
- `id`: Unique identifier (UUID)
- `name`: Item name (string, required)
- `category`: Item category (string, required)
- `quantity`: Available quantity (number, required, >= 0)
- `price`: Item price (number, required, >= 0)
- `description`: Item description (string, optional)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Validation Rules

- **name**: Required, non-empty string
- **category**: Required, non-empty string
- **quantity**: Required, non-negative number
- **price**: Required, non-negative number
- **description**: Optional string

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `404`: Not Found
- `500`: Internal Server Error

## Dependencies

- **express**: Web framework
- **cors**: Cross-Origin Resource Sharing
- **helmet**: Security middleware
- **morgan**: HTTP request logger
- **uuid**: Unique identifier generation

## Testing the API

You can use tools like Postman, curl, or any HTTP client to test the API endpoints.

Example with curl:
```bash
# Get all items
curl http://localhost:3000/api/inventory

# Create new item
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{"name":"Keyboard","category":"Electronics","quantity":10,"price":49.99}'
```
