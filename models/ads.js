const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Ad title is required'],
    trim: true,
    minLength: [3, 'Title must be at least 3 characters'],
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  imageUrl: { 
    type: String, 
    required: [true, 'Image URL is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/i.test(v);
      },
      message: 'Image must be a valid URL'
    }
  },
  linkType: {
    type: String,
    enum: {
      values: ['internal', 'external', 'none'],
      message: 'Invalid link type'
    },
    required: [true, 'Link type is required'],
    default: 'none'
  },
  externalUrl: { 
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        // Only validate if linkType is external and URL is provided
        if (this.linkType === 'external' && v) {
          return /^https?:\/\/.+/i.test(v);
        }
        return true;
      },
      message: 'External URL must be a valid URL'
    }
  },
  internalRoute: {
    type: String,
    default: '',
    trim: true,
    validate: {
      validator: function(v) {
        // Only validate if linkType is internal
        if (this.linkType === 'internal' && !v) {
          return false;
        }
        return true;
      },
      message: 'Internal route is required for internal links'
    }
  },
  placement: {
    type: String,
    enum: {
      values: ['homepage', 'marketplace', 'calculator', 'engineerPage', 'offersTab', 'banner', 'sidebar'],
      message: 'Invalid placement'
    },
    required: [true, 'Ad placement is required'],
    index: true
  },
  priority: {
    type: Number,
    default: 0,
    min: [0, 'Priority cannot be negative'],
    max: [100, 'Priority cannot exceed 100']
  },
  targetAudience: {
    type: [String],
    enum: {
      values: ['all', 'buyers', 'sellers', 'engineers', 'shops'],
      message: 'Invalid target audience'
    },
    default: ['all']
  },
  governorates: {
    type: [String],
    default: [] // Empty means all governorates
  },
  startDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  endDate: {
    type: Date,
    default: null,
    validate: {
      validator: function(v) {
        // End date should be after start date
        return !v || v > this.startDate;
      },
      message: 'End date must be after start date'
    },
    index: true
  },
  impressions: {
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    limit: {
      type: Number,
      default: null,
      min: 0
    }
  },
  clicks: {
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    limit: {
      type: Number,
      default: null,
      min: 0
    }
  },
  budget: {
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    spent: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      enum: ['YER', 'USD', 'SAR', 'EUR'],
      default: 'YER'
    }
  },
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  },
  isApproved: {
    type: Boolean,
    default: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  tags: {
    type: [String],
    default: []
  },
  dimensions: {
    width: {
      type: Number,
      min: 0
    },
    height: {
      type: Number,
      min: 0
    }
  },
  callToAction: {
    text: {
      type: String,
      default: '',
      trim: true,
      maxLength: [50, 'Call to action text cannot exceed 50 characters']
    },
    color: {
      type: String,
      default: '#007bff',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format']
    }
  },
  analytics: {
    ctr: { // Click-through rate
      type: Number,
      default: 0,
      min: 0
    },
    avgViewDuration: {
      type: Number,
      default: 0,
      min: 0
    },
    conversionRate: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true
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
    (!this.impressions.limit || this.impressions.count < this.impressions.limit) &&
    (!this.clicks.limit || this.clicks.count < this.clicks.limit);
  
  return this.isActive && this.isApproved && isTimeValid && isWithinLimits;
});

// Virtual to calculate click-through rate
adSchema.virtual('clickThroughRate').get(function() {
  return this.impressions.count > 0 ? (this.clicks.count / this.impressions.count) * 100 : 0;
});

// Instance method to record impression
adSchema.methods.recordImpression = function() {
  this.impressions.count += 1;
  return this.save();
};

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
      { 'impressions.limit': null },
      { $expr: { $lt: ['$impressions.count', '$impressions.limit'] } }
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
        totalImpressions: { $sum: '$impressions.count' },
        totalClicks: { $sum: '$clicks.count' },
        avgCTR: { $avg: '$analytics.ctr' },
        totalBudgetSpent: { $sum: '$budget.spent' }
      }
    }
  ]);
};

module.exports = mongoose.model('Ad', adSchema);
