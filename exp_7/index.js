const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


let inventory = [
    {
        id: uuidv4(),
        name: 'Laptop',
        category: 'Electronics',
        quantity: 10,
        price: 999.99,
        description: 'High-performance laptop',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: uuidv4(),
        name: 'Office Chair',
        category: 'Furniture',
        quantity: 25,
        price: 199.99,
        description: 'Ergonomic office chair',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];


const validateInventoryItem = (req, res, next) => {
    const { name, category, quantity, price } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
    }
    
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
        return res.status(400).json({ error: 'Category is required and must be a non-empty string' });
    }
    
    if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ error: 'Quantity is required and must be a non-negative number' });
    }
    
    if (price === undefined || typeof price !== 'number' || price < 0) {
        return res.status(400).json({ error: 'Price is required and must be a non-negative number' });
    }
    
    next();
};


const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
};


app.get('/api/inventory', (req, res) => {
    res.json({
        success: true,
        count: inventory.length,
        data: inventory
    });
});


app.get('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    const item = inventory.find(item => item.id === id);
    
    if (!item) {
        return res.status(404).json({ 
            success: false,
            error: 'Inventory item not found' 
        });
    }
    
    res.json({
        success: true,
        data: item
    });
});


app.post('/api/inventory', validateInventoryItem, (req, res) => {
    const { name, category, quantity, price, description } = req.body;
    
    const newItem = {
        id: uuidv4(),
        name: name.trim(),
        category: category.trim(),
        quantity,
        price,
        description: description ? description.trim() : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    inventory.push(newItem);
    
    res.status(201).json({
        success: true,
        data: newItem
    });
});


app.put('/api/inventory/:id', validateInventoryItem, (req, res) => {
    const { id } = req.params;
    const { name, category, quantity, price, description } = req.body;
    
    const itemIndex = inventory.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
        return res.status(404).json({ 
            success: false,
            error: 'Inventory item not found' 
        });
    }
    
    const updatedItem = {
        ...inventory[itemIndex],
        name: name.trim(),
        category: category.trim(),
        quantity,
        price,
        description: description ? description.trim() : inventory[itemIndex].description,
        updatedAt: new Date().toISOString()
    };
    
    inventory[itemIndex] = updatedItem;
    
    res.json({
        success: true,
        data: updatedItem
    });
});


app.patch('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    const itemIndex = inventory.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
        return res.status(404).json({ 
            success: false,
            error: 'Inventory item not found' 
        });
    }
    

    if (updates.quantity !== undefined) {
        if (typeof updates.quantity !== 'number' || updates.quantity < 0) {
            return res.status(400).json({ error: 'Quantity must be a non-negative number' });
        }
    }
    

    if (updates.price !== undefined) {
        if (typeof updates.price !== 'number' || updates.price < 0) {
            return res.status(400).json({ error: 'Price must be a non-negative number' });
        }
    }
    
    const updatedItem = {
        ...inventory[itemIndex],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    

    if (updatedItem.name) updatedItem.name = updatedItem.name.trim();
    if (updatedItem.category) updatedItem.category = updatedItem.category.trim();
    if (updatedItem.description) updatedItem.description = updatedItem.description.trim();
    
    inventory[itemIndex] = updatedItem;
    
    res.json({
        success: true,
        data: updatedItem
    });
});

app.delete('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    const itemIndex = inventory.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
        return res.status(404).json({ 
            success: false,
            error: 'Inventory item not found' 
        });
    }
    
    const deletedItem = inventory.splice(itemIndex, 1)[0];
    
    res.json({
        success: true,
        message: 'Inventory item deleted successfully',
        data: deletedItem
    });
});


app.get('/api/inventory/category/:category', (req, res) => {
    const { category } = req.params;
    const items = inventory.filter(item => 
        item.category.toLowerCase() === category.toLowerCase()
    );
    
    res.json({
        success: true,
        count: items.length,
        data: items
    });
});

app.get('/api/inventory/low-stock', (req, res) => {
    const lowStockItems = inventory.filter(item => item.quantity < 10);
    
    res.json({
        success: true,
        count: lowStockItems.length,
        data: lowStockItems
    });
});


app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Inventory API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Inventory Management API server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`API Documentation: http://localhost:${PORT}/api/inventory`);
});

module.exports = app;
