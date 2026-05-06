const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    subtotal: {
        type: Number,
        required: true,
        min: [0, 'Subtotal cannot be negative']
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        default: function() {
            return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'],
        required: true
    },
    paymentId: {
        type: String
    },
    subtotal: {
        type: Number,
        required: true,
        min: [0, 'Subtotal cannot be negative']
    },
    tax: {
        type: Number,
        required: true,
        min: [0, 'Tax cannot be negative'],
        default: 0
    },
    shipping: {
        type: Number,
        required: true,
        min: [0, 'Shipping cannot be negative'],
        default: 0
    },
    discount: {
        type: Number,
        min: [0, 'Discount cannot be negative'],
        default: 0
    },
    total: {
        type: Number,
        required: true,
        min: [0, 'Total cannot be negative']
    },
    shippingAddress: {
        street: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        zipCode: {
            type: String,
            required: true,
            trim: true
        },
        country: {
            type: String,
            required: true,
            trim: true,
            default: 'USA'
        }
    },
    billingAddress: {
        street: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        zipCode: {
            type: String,
            required: true,
            trim: true
        },
        country: {
            type: String,
            required: true,
            trim: true,
            default: 'USA'
        }
    },
    tracking: {
        carrier: {
            type: String,
            trim: true
        },
        trackingNumber: {
            type: String,
            trim: true
        },
        trackingUrl: {
            type: String,
            trim: true
        }
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    estimatedDelivery: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    },
    cancellationReason: {
        type: String,
        trim: true,
        maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtuals
orderSchema.virtual('isDelivered').get(function() {
    return this.status === 'delivered';
});

orderSchema.virtual('isCancelled').get(function() {
    return this.status === 'cancelled';
});

orderSchema.virtual('isPaid').get(function() {
    return this.paymentStatus === 'completed';
});

orderSchema.virtual('canCancel').get(function() {
    return ['pending', 'confirmed'].includes(this.status);
});

orderSchema.virtual('canTrack').get(function() {
    return ['shipped', 'delivered'].includes(this.status) && this.tracking.trackingNumber;
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ total: -1 });

// Pre-save middleware
orderSchema.pre('save', function(next) {
    // Calculate total if not provided
    if (this.isModified('items') || this.isModified('subtotal') || this.isModified('tax') || 
        this.isModified('shipping') || this.isModified('discount')) {
        this.total = this.subtotal + this.tax + this.shipping - this.discount;
    }
    
    // Set deliveredAt when status changes to delivered
    if (this.isModified('status') && this.status === 'delivered' && !this.deliveredAt) {
        this.deliveredAt = new Date();
    }
    
    // Set cancelledAt when status changes to cancelled
    if (this.isModified('status') && this.status === 'cancelled' && !this.cancelledAt) {
        this.cancelledAt = new Date();
    }
    
    next();
});

// Static methods
orderSchema.statics.findByUser = function(userId) {
    return this.find({ user: userId }).sort({ createdAt: -1 });
};

orderSchema.statics.findByStatus = function(status) {
    return this.find({ status }).sort({ createdAt: -1 });
};

orderSchema.statics.getRevenueStats = function(startDate, endDate) {
    const matchStage = {
        paymentStatus: 'completed'
    };
    
    if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = startDate;
        if (endDate) matchStage.createdAt.$lte = endDate;
    }
    
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$total' },
                totalOrders: { $sum: 1 },
                averageOrderValue: { $avg: '$total' }
            }
        }
    ]);
};

orderSchema.statics.getSalesByDay = function(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.aggregate([
        {
            $match: {
                paymentStatus: 'completed',
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                revenue: { $sum: '$total' },
                orders: { $sum: 1 }
            }
        },
        { $sort: { '_id': 1 } }
    ]);
};

module.exports = mongoose.model('Order', orderSchema);
