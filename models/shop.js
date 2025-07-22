const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Shop name is required'],
        trim: true,
        minLength: [2, 'Shop name must be at least 2 characters'],
        maxLength: [200, 'Shop name cannot exceed 200 characters']
    },
    description: {
        type: String,
        default: '',
        trim: true,
        maxLength: [1000, 'Description cannot exceed 1000 characters']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[0-9+()-\s]{10,15}$/, 'Please enter a valid phone number']
    },
    whatsappPhone: {
        type: String,
        default: '',
        trim: true,
        validate: {
            validator: function(v) {
                return !v || /^[0-9+()-\s]{10,15}$/.test(v);
            },
            message: 'Please enter a valid WhatsApp phone number'
        }
    },
    email: {
        type: String,
        default: '',
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    website: {
        type: String,
        default: '',
        trim: true,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/i.test(v);
            },
            message: 'Website must be a valid URL'
        }
    },
    governorate: {
        type: String,
        required: [true, 'Governorate is required'],
        trim: true,
        index: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        index: true
    },
    address: {
        type: String,
        default: '',
        trim: true,
        maxLength: [500, 'Address cannot exceed 500 characters']
    },
    location: {
        latitude: { 
            type: Number,
            min: [-90, 'Latitude must be between -90 and 90'],
            max: [90, 'Latitude must be between -90 and 90']
        },
        longitude: { 
            type: Number,
            min: [-180, 'Longitude must be between -180 and 180'],
            max: [180, 'Longitude must be between -180 and 180']
        }
    },
    services: {
        type: [String],
        enum: {
            values: ['sale', 'install', 'repair', 'maintenance', 'consultation', 'warranty'],
            message: 'Invalid service type'
        },
        required: [true, 'At least one service is required'],
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'At least one service must be selected'
        },
        index: true
    },
    productCategories: {
        type: [String],
        enum: {
            values: ['Inverter', 'Panel', 'Battery', 'Accessory', 'Cable', 'Controller', 'Monitor', 'Complete Systems'],
            message: 'Invalid product category'
        },
        default: []
    },
    brands: {
        type: [String],
        default: []
    },
    establishedYear: {
        type: Number,
        min: [1950, 'Establishment year seems too old'],
        max: [new Date().getFullYear(), 'Establishment year cannot be in the future']
    },
    licenseNumber: {
        type: String,
        default: '',
        trim: true
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    workingHours: {
        openTime: {
            type: String,
            default: '08:00'
        },
        closeTime: {
            type: String,
            default: '18:00'
        },
        workingDays: {
            type: [String],
            enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            default: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
        }
    },
    socialMedia: {
        facebook: {
            type: String,
            default: '',
            validate: {
                validator: function(v) {
                    return !v || /^https?:\/\/(www\.)?facebook\.com\/.+/i.test(v);
                },
                message: 'Facebook must be a valid Facebook URL'
            }
        },
        instagram: {
            type: String,
            default: '',
            validate: {
                validator: function(v) {
                    return !v || /^https?:\/\/(www\.)?instagram\.com\/.+/i.test(v);
                },
                message: 'Instagram must be a valid Instagram URL'
            }
        },
        twitter: {
            type: String,
            default: '',
            validate: {
                validator: function(v) {
                    return !v || /^https?:\/\/(www\.)?twitter\.com\/.+/i.test(v);
                },
                message: 'Twitter must be a valid Twitter URL'
            }
        }
    },
    logoUrl: {
        type: String,
        default: '',
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/i.test(v);
            },
            message: 'Logo must be a valid URL'
        }
    },
    images: [{
        type: String,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/i.test(v);
            },
            message: 'Image must be a valid URL'
        }
    }],
    isVerified: {
        type: Boolean,
        default: true, // All shops are verified by default since only admin adds them
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isFeatured: {
        type: Boolean,
        default: false,
        index: true
    },
    views: {
        type: Number,
        default: 0,
        min: 0
    },
    contactsCount: {
        type: Number,
        default: 0,
        min: 0
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'verified',
        index: true
    },
    verificationDocuments: [{
        name: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true,
            validate: {
                validator: function(v) {
                    return /^https?:\/\/.+/i.test(v);
                },
                message: 'Document must be a valid URL'
            }
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    notes: {
        type: String,
        default: '',
        trim: true,
        maxLength: [500, 'Notes cannot exceed 500 characters']
    }
}, { 
    timestamps: true 
});

// Create indexes for better performance
shopSchema.index({ governorate: 1, city: 1 });
shopSchema.index({ services: 1 });
shopSchema.index({ productCategories: 1 });
shopSchema.index({ isActive: 1, isVerified: 1 });
shopSchema.index({ isFeatured: -1, createdAt: -1 });
shopSchema.index({ 'rating.average': -1 });
shopSchema.index({ verificationStatus: 1 });
shopSchema.index({ createdAt: -1 });
shopSchema.index({ location: '2dsphere' }); // For geospatial queries

// Virtual for contact info
shopSchema.virtual('contactInfo').get(function() {
    return {
        phone: this.phone,
        whatsapp: this.whatsappPhone || this.phone,
        email: this.email,
        website: this.website
    };
});

// Instance method to increment views
shopSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

// Instance method to increment contacts count
shopSchema.methods.incrementContacts = function() {
    this.contactsCount += 1;
    return this.save();
};

// Instance method to update rating
shopSchema.methods.updateRating = function(newRating) {
    if (newRating < 1 || newRating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }
    
    const totalRating = (this.rating.average * this.rating.count) + newRating;
    this.rating.count += 1;
    this.rating.average = totalRating / this.rating.count;
    
    return this.save();
};

// Static method to find active shops
shopSchema.statics.findActive = function(filters = {}) {
    return this.find({
        isActive: true,
        isVerified: true,
        ...filters
    });
};

// Static method for shop search
shopSchema.statics.searchShops = function(filters = {}) {
    const {
        governorate,
        city,
        services,
        productCategories,
        brands,
        minRating,
        search,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = -1
    } = filters;

    const query = {
        isActive: true,
        isVerified: true,
        verificationStatus: 'verified'
    };

    if (governorate) query.governorate = new RegExp(governorate, 'i');
    if (city) query.city = new RegExp(city, 'i');
    if (services && services.length > 0) {
        query.services = { $in: services };
    }
    if (productCategories && productCategories.length > 0) {
        query.productCategories = { $in: productCategories };
    }
    if (brands && brands.length > 0) {
        query.brands = { $in: brands.map(brand => new RegExp(brand, 'i')) };
    }
    if (minRating) query['rating.average'] = { $gte: minRating };
    if (search) {
        query.$or = [
            { name: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') },
            { services: { $in: [new RegExp(search, 'i')] } },
            { brands: { $in: [new RegExp(search, 'i')] } }
        ];
    }

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder;

    return this.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('addedBy', 'name')
        .select('-notes -verificationDocuments -__v');
};

module.exports = mongoose.model('Shop', shopSchema);
