const mongoose = require('mongoose');

const engineerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Engineer name is required'],
        trim: true,
        minLength: [2, 'Name must be at least 2 characters'],
        maxLength: [100, 'Name cannot exceed 100 characters']
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
    services: {
        type: [String],
        enum: {
            values: ['Install', 'Repair', 'Maintenance', 'Consultation', 'Design'],
            message: 'Invalid service type'
        },
        required: [true, 'At least one service is required'],
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'At least one service must be selected'
        }
    },
    specializations: {
        type: [String],
        enum: {
            values: ['Residential', 'Commercial', 'Industrial', 'Off-grid', 'On-grid', 'Hybrid'],
            message: 'Invalid specialization'
        },
        default: []
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
        maxLength: [300, 'Address cannot exceed 300 characters']
    },
    experience: {
        years: {
            type: Number,
            default: 0,
            min: [0, 'Experience years cannot be negative'],
            max: [50, 'Experience years seems too high']
        },
        description: {
            type: String,
            default: '',
            trim: true,
            maxLength: [1000, 'Experience description cannot exceed 1000 characters']
        }
    },
    certifications: [{
        name: {
            type: String,
            
            trim: true
        },
        issuedBy: {
            type: String,
           
            trim: true
        },
        issuedDate: {
            type: Date
        },
        expiryDate: {
            type: Date
        }
    }],
    profileImageUrl: {
        type: String,
        default: '',
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/i.test(v);
            },
            message: 'Profile image must be a valid URL'
        }
    },
    portfolioImages: [{
        type: String,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/i.test(v);
            },
            message: 'Portfolio image must be a valid URL'
        }
    }],
    availability: {
        status: {
            type: String,
            enum: ['Available', 'Busy', 'Unavailable'],
            default: 'Available'
        },
        workingHours: {
            start: {
                type: String,
                default: '08:00'
            },
            end: {
                type: String,
                default: '18:00'
            }
        },
        workingDays: {
            type: [String],
            enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            default: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
        }
    },
    pricing: {
        hourlyRate: {
            type: Number,
            default: 0,
            min: 0
        },
        currency: {
            type: String,
            enum: ['YER', 'USD', 'SAR', 'EUR'],
            default: 'YER'
        },
        minimumCharge: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    isVerified: {
        type: Boolean,
        default: false,
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
    },
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
engineerSchema.index({ governorate: 1, city: 1 });
engineerSchema.index({ services: 1 });
engineerSchema.index({ specializations: 1 });
engineerSchema.index({ isActive: 1, isVerified: 1 });
engineerSchema.index({ isFeatured: -1, createdAt: -1 });
engineerSchema.index({ 'rating.average': -1 });
engineerSchema.index({ 'availability.status': 1 });
engineerSchema.index({ createdAt: -1 });

// Virtual for contact info
engineerSchema.virtual('contactInfo').get(function() {
    return {
        phone: this.phone,
        whatsapp: this.whatsappPhone || this.phone,
        email: this.email
    };
});

// Instance method to increment views
engineerSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

// Instance method to increment contacts count
engineerSchema.methods.incrementContacts = function() {
    this.contactsCount += 1;
    return this.save();
};

// Instance method to update rating
engineerSchema.methods.updateRating = function(newRating) {
    if (newRating < 1 || newRating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }
    
    const totalRating = (this.rating.average * this.rating.count) + newRating;
    this.rating.count += 1;
    this.rating.average = totalRating / this.rating.count;
    
    return this.save();
};

// Static method to find active engineers
engineerSchema.statics.findActive = function(filters = {}) {
    return this.find({
        isActive: true,
        ...filters
    });
};

// Static method to find verified engineers
engineerSchema.statics.findVerified = function(filters = {}) {
    return this.find({
        isActive: true,
        isVerified: true,
        ...filters
    });
};

// Static method for engineer search
engineerSchema.statics.searchEngineers = function(filters = {}) {
    const {
        governorate,
        city,
        services,
        specializations,
        availability,
        minRating,
        search,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = -1
    } = filters;

    const query = {
        isActive: true,
        isVerified: true
    };

    if (governorate) query.governorate = new RegExp(governorate, 'i');
    if (city) query.city = new RegExp(city, 'i');
    if (services && services.length > 0) {
        query.services = { $in: services };
    }
    if (specializations && specializations.length > 0) {
        query.specializations = { $in: specializations };
    }
    if (availability) query['availability.status'] = availability;
    if (minRating) query['rating.average'] = { $gte: minRating };
    if (search) {
        query.$or = [
            { name: new RegExp(search, 'i') },
            { services: { $in: [new RegExp(search, 'i')] } },
            { specializations: { $in: [new RegExp(search, 'i')] } }
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
        .select('-notes -__v');
};

module.exports = mongoose.model('Engineer', engineerSchema);
