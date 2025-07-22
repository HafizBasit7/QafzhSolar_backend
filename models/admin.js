// models/Admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Admin name is required'],
        unique: true,
        trim: true,
        minLength: [2, 'Name must be at least 2 characters'],
        maxLength: [100, 'Name cannot exceed 100 characters']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
        index: true
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minLength: [6, 'Password must be at least 6 characters']
    },
    role: { 
        type: String, 
        enum: {
            values: ['admin', 'super_admin', 'moderator'],
            message: 'Invalid role'
        },
        default: 'admin',
        index: true
    },
    permissions: {
        products: {
            create: { type: Boolean, default: false },
            read: { type: Boolean, default: true },
            update: { type: Boolean, default: true },
            delete: { type: Boolean, default: false },
            approve: { type: Boolean, default: true }
        },
        engineers: {
            create: { type: Boolean, default: true },
            read: { type: Boolean, default: true },
            update: { type: Boolean, default: true },
            delete: { type: Boolean, default: false }
        },
        shops: {
            create: { type: Boolean, default: true },
            read: { type: Boolean, default: true },
            update: { type: Boolean, default: true },
            delete: { type: Boolean, default: false }
        },
        ads: {
            create: { type: Boolean, default: true },
            read: { type: Boolean, default: true },
            update: { type: Boolean, default: true },
            delete: { type: Boolean, default: true }
        },
        users: {
            read: { type: Boolean, default: true },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
        },
        analytics: {
            read: { type: Boolean, default: true }
        }
    },
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
    phone: {
        type: String,
        default: '',
        trim: true,
        validate: {
            validator: function(v) {
                return !v || /^[0-9+()-\s]{10,15}$/.test(v);
            },
            message: 'Please enter a valid phone number'
        }
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isSuperAdmin: {
        type: Boolean,
        default: false,
        index: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    },
    passwordChangedAt: {
        type: Date,
        default: Date.now
    },
    passwordResetToken: {
        type: String,
        default: null
    },
    passwordResetExpires: {
        type: Date,
        default: null
    }
}, { 
    timestamps: true 
});

// Create indexes for better performance
adminSchema.index({ email: 1 }, { unique: true });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ isSuperAdmin: 1 });
adminSchema.index({ createdAt: -1 });

// Virtual for checking if account is locked
adminSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password with cost of 12
        this.password = await bcrypt.hash(this.password, 12);
        next();
    } catch (error) {
        next(error);
    }
});

// Update passwordChangedAt when password is modified
adminSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
    
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// Instance method to compare passwords
adminSchema.methods.comparePassword = async function(candidatePassword) {
    if (!candidatePassword) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment login attempts
adminSchema.methods.incLoginAttempts = function() {
    // Check if we have a previous lock that has expired
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: {
                loginAttempts: 1,
                lockUntil: 1
            }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = {
            lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
        };
    }
    
    return this.updateOne(updates);
};

// Instance method to reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: {
            loginAttempts: 1,
            lockUntil: 1
        },
        $set: {
            lastLogin: Date.now()
        }
    });
};

// Instance method to check if password changed after JWT was issued
adminSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// Instance method to generate password reset token
adminSchema.methods.createPasswordResetToken = function() {
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    
    this.passwordResetToken = require('crypto')
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return resetToken;
};

// Instance method to check permissions
adminSchema.methods.hasPermission = function(resource, action) {
    if (this.isSuperAdmin) return true;
    
    if (this.permissions[resource] && this.permissions[resource][action]) {
        return this.permissions[resource][action];
    }
    
    return false;
};

// Static method to find active admins
adminSchema.statics.findActive = function() {
    return this.find({ isActive: true });
};

module.exports = mongoose.model('Admin', adminSchema);
