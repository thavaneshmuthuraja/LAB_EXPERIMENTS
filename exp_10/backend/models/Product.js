const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [2, 'Product name must be at least 2 characters'],
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative'],
        max: [999999.99, 'Price cannot exceed 999999.99']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: {
            values: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Food', 'Other'],
            message: 'Category must be one of: Electronics, Clothing, Books, Home & Garden, Sports, Toys, Beauty, Food, Other'
        }
    },
    subcategory: {
        type: String,
        trim: true,
        maxlength: [50, 'Subcategory cannot exceed 50 characters']
    },
    brand: {
        type: String,
        trim: true,
        maxlength: [50, 'Brand name cannot exceed 50 characters']
    },
    sku: {
        type: String,
        required: [true, 'SKU is required'],
        unique: true,
        trim: true,
        uppercase: true,
        match: [/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens']
    },
    images: [{
        url: {
            type: String,
            required: true,
            validate: {
                validator: function(v) {
                    return /^https?:\/\/.+/.test(v);
                },
                message: 'Image URL must be a valid HTTP or HTTPS URL'
            }
        },
        alt: {
            type: String,
            trim: true,
            maxlength: [100, 'Alt text cannot exceed 100 characters']
        },
        isMain: {
            type: Boolean,
            default: false
        }
    }],
    inventory: {
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [0, 'Quantity cannot be negative'],
            default: 0
        },
        reserved: {
            type: Number,
            min: [0, 'Reserved quantity cannot be negative'],
            default: 0
        },
        lowStockThreshold: {
            type: Number,
            min: [0, 'Low stock threshold cannot be negative'],
            default: 10
        }
    },
    dimensions: {
        length: {
            type: Number,
            min: [0, 'Length cannot be negative']
        },
        width: {
            type: Number,
            min: [0, 'Width cannot be negative']
        },
        height: {
            type: Number,
            min: [0, 'Height cannot be negative']
        },
        weight: {
            type: Number,
            min: [0, 'Weight cannot be negative']
        }
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    rating: {
        average: {
            type: Number,
            min: [0, 'Average rating cannot be less than 0'],
            max: [5, 'Average rating cannot exceed 5'],
            default: 0
        },
        count: {
            type: Number,
            min: [0, 'Review count cannot be negative'],
            default: 0
        }
    },
    specifications: {
        type: Map,
        of: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    discount: {
        percentage: {
            type: Number,
            min: [0, 'Discount percentage cannot be negative'],
            max: [100, 'Discount percentage cannot exceed 100'],
            default: 0
        },
        validUntil: {
            type: Date
        }
    },
    shipping: {
        freeShipping: {
            type: Boolean,
            default: false
        },
        shippingCost: {
            type: Number,
            min: [0, 'Shipping cost cannot be negative'],
            default: 0
        },
        estimatedDelivery: {
            type: String,
            maxlength: [50, 'Estimated delivery cannot exceed 50 characters']
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtuals
productSchema.virtual('availableQuantity').get(function() {
    return this.inventory.quantity - this.inventory.reserved;
});

productSchema.virtual('isLowStock').get(function() {
    return this.availableQuantity <= this.inventory.lowStockThreshold;
});

productSchema.virtual('isOutOfStock').get(function() {
    return this.availableQuantity <= 0;
});

productSchema.virtual('discountedPrice').get(function() {
    if (this.discount.percentage > 0 && 
        (!this.discount.validUntil || new Date(this.discount.validUntil) > new Date())) {
        return this.price * (1 - this.discount.percentage / 100);
    }
    return this.price;
});

productSchema.virtual('hasDiscount').get(function() {
    return this.discount.percentage > 0 && 
        (!this.discount.validUntil || new Date(this.discount.validUntil) > new Date());
});

productSchema.virtual('mainImage').get(function() {
    const mainImage = this.images.find(img => img.isMain);
    return mainImage || this.images[0];
});

// Indexes
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'inventory.quantity': 1 });
productSchema.index({ tags: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });

// Pre-save middleware
productSchema.pre('save', function(next) {
    if (this.sku) {
        this.sku = this.sku.toUpperCase();
    }
    
    // Ensure only one main image
    const mainImages = this.images.filter(img => img.isMain);
    if (mainImages.length > 1) {
        this.images.forEach((img, index) => {
            img.isMain = index === 0;
        });
    } else if (this.images.length > 0 && mainImages.length === 0) {
        this.images[0].isMain = true;
    }
    
    next();
});

// Static methods
productSchema.statics.findLowStock = function() {
    return this.find({
        'inventory.quantity': { $lte: '$inventory.lowStockThreshold' },
        isActive: true
    });
};

productSchema.statics.findFeatured = function() {
    return this.find({ isFeatured: true, isActive: true })
        .sort({ 'rating.average': -1 });
};

productSchema.statics.findByCategory = function(category) {
    return this.find({ category, isActive: true });
};

productSchema.statics.searchProducts = function(query) {
    return this.find({
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
};

module.exports = mongoose.model('Product', productSchema);
