const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// Get user's cart
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('cart.product');
        
        res.json({
            success: true,
            data: {
                items: user.cart,
                total: user.cartTotal,
                count: user.cart.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Validate product
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        // Check stock
        if (product.availableQuantity < quantity) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient stock'
            });
        }

        const user = await User.findById(req.user.id);
        
        // Check if item already in cart
        const existingItemIndex = user.cart.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex !== -1) {
            // Update quantity
            const newQuantity = user.cart[existingItemIndex].quantity + quantity;
            
            if (product.availableQuantity < newQuantity) {
                return res.status(400).json({
                    success: false,
                    error: 'Insufficient stock for requested quantity'
                });
            }
            
            user.cart[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item
            user.cart.push({
                product: productId,
                quantity
            });
        }

        await user.save();
        await user.populate('cart.product');

        res.json({
            success: true,
            data: {
                items: user.cart,
                total: user.cartTotal,
                count: user.cart.length
            },
            message: 'Item added to cart'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update cart item quantity
router.put('/update/:itemId', auth, async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                error: 'Quantity must be at least 1'
            });
        }

        const user = await User.findById(req.user.id);
        const cartItemIndex = user.cart.findIndex(
            item => item._id.toString() === itemId
        );

        if (cartItemIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Cart item not found'
            });
        }

        // Check stock
        const product = await Product.findById(user.cart[cartItemIndex].product);
        if (product.availableQuantity < quantity) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient stock'
            });
        }

        user.cart[cartItemIndex].quantity = quantity;
        await user.save();
        await user.populate('cart.product');

        res.json({
            success: true,
            data: {
                items: user.cart,
                total: user.cartTotal,
                count: user.cart.length
            },
            message: 'Cart updated'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Remove item from cart
router.delete('/remove/:itemId', auth, async (req, res) => {
    try {
        const { itemId } = req.params;

        const user = await User.findById(req.user.id);
        const cartItemIndex = user.cart.findIndex(
            item => item._id.toString() === itemId
        );

        if (cartItemIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Cart item not found'
            });
        }

        user.cart.splice(cartItemIndex, 1);
        await user.save();
        await user.populate('cart.product');

        res.json({
            success: true,
            data: {
                items: user.cart,
                total: user.cartTotal,
                count: user.cart.length
            },
            message: 'Item removed from cart'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Clear cart
router.delete('/clear', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.cart = [];
        await user.save();

        res.json({
            success: true,
            data: {
                items: [],
                total: 0,
                count: 0
            },
            message: 'Cart cleared'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get cart summary (without full product details)
router.get('/summary', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('cart');
        
        const summary = {
            items: user.cart.map(item => ({
                id: item._id,
                productId: item.product,
                quantity: item.quantity,
                addedAt: item.addedAt
            })),
            count: user.cart.length,
            total: user.cartTotal
        };

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Validate cart (check stock availability)
router.post('/validate', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('cart.product');
        const validationResults = [];
        let isValid = true;

        for (const cartItem of user.cart) {
            const product = cartItem.product;
            const availableQuantity = product.availableQuantity;
            const requestedQuantity = cartItem.quantity;

            if (availableQuantity < requestedQuantity) {
                validationResults.push({
                    productId: product._id,
                    productName: product.name,
                    requestedQuantity,
                    availableQuantity,
                    isValid: false,
                    message: `Only ${availableQuantity} items available in stock`
                });
                isValid = false;
            } else {
                validationResults.push({
                    productId: product._id,
                    productName: product.name,
                    requestedQuantity,
                    availableQuantity,
                    isValid: true
                });
            }
        }

        res.json({
            success: true,
            data: {
                isValid,
                validationResults,
                cartTotal: user.cartTotal
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Move item to wishlist
router.post('/move-to-wishlist/:itemId', auth, async (req, res) => {
    try {
        const { itemId } = req.params;

        const user = await User.findById(req.user.id);
        const cartItemIndex = user.cart.findIndex(
            item => item._id.toString() === itemId
        );

        if (cartItemIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Cart item not found'
            });
        }

        const cartItem = user.cart[cartItemIndex];
        const productId = cartItem.product;

        // Add to wishlist if not already there
        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
        }

        // Remove from cart
        user.cart.splice(cartItemIndex, 1);
        await user.save();
        await user.populate('cart.product');

        res.json({
            success: true,
            data: {
                items: user.cart,
                total: user.cartTotal,
                count: user.cart.length
            },
            message: 'Item moved to wishlist'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
