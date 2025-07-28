const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Ad title is required'],
    trim: true,
    minLength: [5, 'Title must be at least 5 characters long'],
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Ad description is required'],
    trim: true,
    minLength: [10, 'Description must be at least 10 characters long'],
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Ad image is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/i.test(v);
      },
      message: 'Image must be a valid URL'
    }
  },
  targetUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/i.test(v);
      },
      message: 'Target URL must be a valid URL'
    }
  },
  placement: {
    type: String,
    required: [true, 'Ad placement is required'],
    enum: {
      values: ['banner', 'sidebar', 'inline', 'popup', 'header', 'footer'],
      message: 'Placement must be one of: banner, sidebar, inline, popup, header, footer'
    }
  },
  priority: {
    type: Number,
    default: 1,
    min: [1, 'Priority must be at least 1'],
    max: [10, 'Priority cannot exceed 10']
  },
  targetAudience: [{
    type: String,
    enum: ['all', 'buyers', 'sellers', 'engineers', 'shops'],
    default: ['all']
  }],
  governorates: [{
    type: String,
    trim: true
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  budget: {
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Budget amount cannot be negative']
    },
    currency: {
      type: String,
      enum: ['YER', 'USD', 'SAR', 'EUR'],
      default: 'YER'
    }
  },
  clicks: {
    count: {
      type: Number,
      default: 0
    },
    limit: {
      type: Number,
      default: null
    }
  },
  impressions: {
    count: {
      type: Number,
      default: 0
    },
    limit: {
      type: Number,
      default: null
    }
  },
  analytics: {
    ctr: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    cost: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: true // Changed from false to true for auto-approval
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Creator ID is required']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: {
    type: Date,
    default: Date.now // Auto-set approval date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for better performance
adSchema.index({ placement: 1, isActive: 1 });
adSchema.index({ startDate: 1, endDate: 1 });
adSchema.index({ isActive: 1, isApproved: 1 });
adSchema.index({ priority: -1 });
adSchema.index({ createdAt: -1 });
adSchema.index({ targetAudience: 1 });
adSchema.index({ governorates: 1 });

// Virtual to check if ad is currently running
adSchema.virtual('isRunning').get(function() {
  const now = new Date();
  const isTimeValid = now >= this.startDate && (!this.endDate || now <= this.endDate);
  const isWithinLimits = 
    (!this.clicks.limit || this.clicks.count < this.clicks.limit);
  
  return this.isActive && this.isApproved && isTimeValid && isWithinLimits;
});

// Virtual to calculate click-through rate
// adSchema.virtual('clickThroughRate').get(function() {
//   return this.impressions.count > 0 ? (this.clicks.count / this.impressions.count) * 100 : 0;
// });

// // Instance method to record impression
// adSchema.methods.recordImpression = function() {
//   this.impressions.count += 1;
//   return this.save();
// };

// Instance method to record click
adSchema.methods.recordClick = function() {
  this.clicks.count += 1;
  this.analytics.ctr = this.clickThroughRate;
  return this.save();
};

// Instance method to check if ad should be shown to user
adSchema.methods.shouldShowTo = function(userProfile = {}) {
  if (!this.isRunning) return false;
  
  // Check target audience
  if (!this.targetAudience.includes('all')) {
    const userType = userProfile.type || 'buyer'; // default to buyer
    if (!this.targetAudience.includes(userType)) return false;
  }
  
  // Check governorate targeting
  if (this.governorates.length > 0 && userProfile.governorate) {
    if (!this.governorates.includes(userProfile.governorate)) return false;
  }
  
  return true;
};

// Static method to find active ads for placement
adSchema.statics.findActiveForPlacement = function(placement, userProfile = {}) {
  const now = new Date();
  
  return this.find({
    placement: placement,
    isActive: true,
    isApproved: true,
    startDate: { $lte: now },
    $or: [
      { endDate: null },
      { endDate: { $gte: now } }
    ],
    $or: [
      { 'clicks.limit': null },
      { $expr: { $lt: ['$clicks.count', '$clicks.limit'] } }
    ]
  })
  .sort({ priority: -1, createdAt: -1 })
  .populate('createdBy', 'name')
  .select('-__v');
};

// Static method to get ads analytics
adSchema.statics.getAnalytics = function(filters = {}) {
  const matchConditions = { isActive: true };
  
  if (filters.startDate && filters.endDate) {
    matchConditions.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  
  if (filters.placement) {
    matchConditions.placement = filters.placement;
  }
  
  return this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: null,
        totalAds: { $sum: 1 },
        totalClicks: { $sum: '$clicks.count' },
        avgCTR: { $avg: '$analytics.ctr' },
        totalBudgetSpent: { $sum: '$budget.spent' }
      }
    }
  ]);
};

module.exports = mongoose.model('Ad', adSchema);
