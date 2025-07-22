const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
    trim: true,
    maxLength: [100, 'Name cannot be more than 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[0-9+()-\s]{10,15}$/, 'Please enter a valid phone number']
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
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for better performance
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ isVerified: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1 });

// Update updatedAt before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to generate OTP
userSchema.methods.generateOTP = function() {
  this.otp = '112233'; // Fixed OTP as per scope
  this.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

// Instance method to verify OTP
userSchema.methods.verifyOTP = function(inputOtp) {
  if (!this.otp || !this.otpExpires) {
    return false;
  }
  
  if (this.otpExpires < Date.now()) {
    return false;
  }
  
  return this.otp === inputOtp;
};

// Instance method to clear OTP
userSchema.methods.clearOTP = function() {
  this.otp = null;
  this.otpExpires = null;
  this.isVerified = true;
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('User', userSchema);
