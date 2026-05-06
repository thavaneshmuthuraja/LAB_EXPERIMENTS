const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');

// Get all products with filtering and pagination
router.get('/', optionalAuth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            subcategory,
            minPrice,
            maxPrice,
            brand,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            featured,
            inStock
        } = req.query;

        // Build query
        const query = { isActive: true };

        if (category) query.category = category;
        if (subcategory) query.subcategory = subcategory;
        if (brand) query.brand = new RegExp(brand, 'i');
        if (featured === 'true') query.isFeatured = true;

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        if (inStock === 'true') {
            query['inventory.quantity'] = { $gt: 0 };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Sort options
        const sort = {};
        const validSortFields = ['name', 'price', 'createdAt', 'rating.average', 'inventory.quantity'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        sort[sortField] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const products = await Product.find(query)
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            data: products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single product by ID
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get featured products
router.get('/featured/list', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const products = await Product.findFeatured().limit(limit);
        
        res.json({
            success: true,
            data: products,
            count: products.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        const query = { category, isActive: true };
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const products = await Product.find(query)
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            data: products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Search products
router.get('/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const { page = 1, limit = 12, sortBy = 'relevance' } = req.query;

        let products;
        let total;

        if (sortBy === 'relevance') {
            // Use text search for relevance
            products = await Product.searchProducts(query)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();
            
            total = await Product.countDocuments({
                $and: [
                    { isActive: true },
                    {
                        $or: [
                            { name: { $regex: query, $options: 'i' } },
                            { description: { $regex: query, $options: 'i' } },
                            { brand: { $regex: query, $options: 'i' } },
                            { tags: { $in: [new RegExp(query, 'i')] } }
                        ]
                    }
                ]
            });
        } else {
            // Regular search with sorting
            const searchQuery = {
                $and: [
                    { isActive: true },
                    {
                        $or: [
                            { name: { $regex: query, $options: 'i' } },
                            { description: { $regex: query, $options: 'i' } },
                            { brand: { $regex: query, $options: 'i' } },
                            { tags: { $in: [new RegExp(query, 'i')] } }
                        ]
                    }
                ]
            };

            const sort = {};
            sort[sortBy] = -1;

            products = await Product.find(searchQuery)
                .sort(sort)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();

            total = await Product.countDocuments(searchQuery);
        }

        res.json({
            success: true,
            data: products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            },
            query
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get low stock products (admin only)
router.get('/admin/low-stock', adminAuth, async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 10;
        const products = await Product.find({
            isActive: true,
            'inventory.quantity': { $lte: threshold }
        });

        res.json({
            success: true,
            data: products,
            count: products.length,
            threshold
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new product (admin only)
router.post('/', adminAuth, async (req, res) => {
    try {
        const productData = req.body;
        
        // Ensure at least one image is marked as main
        if (productData.images && productData.images.length > 0) {
            const hasMainImage = productData.images.some(img => img.isMain);
            if (!hasMainImage) {
                productData.images[0].isMain = true;
            }
        }

        const product = new Product(productData);
        await product.save();

        res.status(201).json({
            success: true,
            data: product,
            message: 'Product created successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Update product (admin only)
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product,
            message: 'Product updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Delete product (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get product categories
router.get('/categories/list', async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        
        res.json({
            success: true,
            data: categories,
            count: categories.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get product statistics (admin only)
router.get('/admin/stats', adminAuth, async (req, res) => {
    try {
        const stats = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    totalValue: { $sum: { $multiply: ['$price', '$inventory.quantity'] } },
                    averagePrice: { $avg: '$price' },
                    lowStockCount: {
                        $sum: {
                            $cond: [
                                { $lte: ['$inventory.quantity', '$inventory.lowStockThreshold'] },
                                1,
                                0
                            ]
                        }
                    },
                    outOfStockCount: {
                        $sum: {
                            $cond: [{ $eq: ['$inventory.quantity', 0] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const categoryStats = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    averagePrice: { $avg: '$price' },
                    totalValue: { $sum: { $multiply: ['$price', '$inventory.quantity'] } }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                summary: stats[0] || {},
                byCategory: categoryStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
