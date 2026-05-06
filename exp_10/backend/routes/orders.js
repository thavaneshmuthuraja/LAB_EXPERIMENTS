const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Create order from cart
router.post('/', auth, async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            billingAddress,
            paymentMethod,
            notes
        } = req.body;

        const user = await User.findById(req.user.id).populate('cart.product');

        // Validate items match cart
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No items in order'
            });
        }

        // Check stock availability
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product || !product.isActive) {
                return res.status(400).json({
                    success: false,
                    error: `Product ${item.product} not found or inactive`
                });
            }

            if (product.availableQuantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    error: `Insufficient stock for ${product.name}. Available: ${product.availableQuantity}`
                });
            }
        }

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            const itemSubtotal = product.price * item.quantity;
            subtotal += itemSubtotal;

            orderItems.push({
                product: item.product,
                quantity: item.quantity,
                price: product.price,
                subtotal: itemSubtotal
            });

            // Reserve inventory
            product.inventory.reserved += item.quantity;
            await product.save();
        }

        const tax = subtotal * 0.08; // 8% tax
        const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
        const total = subtotal + tax + shipping;

        // Create order
        const order = new Order({
            user: req.user.id,
            items: orderItems,
            subtotal,
            tax,
            shipping,
            total,
            shippingAddress,
            billingAddress,
            paymentMethod,
            notes
        });

        await order.save();

        // Clear user's cart
        user.cart = [];
        await user.save();

        // Add order to user's orders
        user.orders.push(order._id);
        await user.save();

        res.status(201).json({
            success: true,
            data: order,
            message: 'Order created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get user's orders
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        let query = { user: req.user.id };
        if (status) query.status = status;

        const orders = await Order.find(query)
            .populate('items.product')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            data: orders,
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

// Get single order
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product')
            .populate('user', 'firstName lastName email');

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Check if user owns the order or is admin
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update order status (admin only)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin privileges required.'
            });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        const previousStatus = order.status;
        order.status = status;

        // Handle inventory when order is confirmed
        if (previousStatus === 'pending' && status === 'confirmed') {
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                product.inventory.quantity -= item.quantity;
                product.inventory.reserved -= item.quantity;
                await product.save();
            }
        }

        // Handle inventory when order is cancelled
        if (status === 'cancelled' && previousStatus !== 'cancelled') {
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                product.inventory.reserved -= item.quantity;
                await product.save();
            }
        }

        await order.save();

        res.json({
            success: true,
            data: order,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Cancel order
router.post('/:id/cancel', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Check if user owns the order
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        // Check if order can be cancelled
        if (!order.canCancel) {
            return res.status(400).json({
                success: false,
                error: 'Order cannot be cancelled at this stage'
            });
        }

        order.status = 'cancelled';
        order.cancellationReason = reason;
        order.cancelledAt = new Date();

        // Release reserved inventory
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            product.inventory.reserved -= item.quantity;
            await product.save();
        }

        await order.save();

        res.json({
            success: true,
            data: order,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add tracking information (admin only)
router.put('/:id/tracking', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { carrier, trackingNumber, trackingUrl } = req.body;

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin privileges required.'
            });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        order.tracking = {
            carrier,
            trackingNumber,
            trackingUrl
        };

        if (order.status === 'processing') {
            order.status = 'shipped';
        }

        await order.save();

        res.json({
            success: true,
            data: order,
            message: 'Tracking information updated'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get order statistics (admin only)
router.get('/admin/stats', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin privileges required.'
            });
        }

        const { startDate, endDate } = req.query;

        const revenueStats = await Order.getRevenueStats(
            startDate ? new Date(startDate) : null,
            endDate ? new Date(endDate) : null
        );

        const salesByDay = await Order.getSalesByDay();

        const ordersByStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$total' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                revenueStats: revenueStats[0] || {
                    totalRevenue: 0,
                    totalOrders: 0,
                    averageOrderValue: 0
                },
                salesByDay,
                ordersByStatus
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get all orders (admin only)
router.get('/admin/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin privileges required.'
            });
        }

        const { page = 1, limit = 20, status, startDate, endDate } = req.query;

        let query = {};
        if (status) query.status = status;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const orders = await Order.find(query)
            .populate('items.product', 'name sku')
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            data: orders,
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

module.exports = router;
