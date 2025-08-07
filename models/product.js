const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minLength: [3, 'Product name must be at least 3 characters long'],
    maxLength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [2000, 'Description cannot exceed 2000 characters']
  },
  type: {
    type: String,
    required: [true, 'Product type is required'],
    enum: {
      values: ['Inverter', 'Panel', 'Battery', 'Accessory', 'Panel bases', 'Other'],
      message: 'Product type must be one of: Inverter, Panel, Battery, Accessory, Panel bases, Other'
    }
  },
  condition: {
    type: String,
    required: [true, 'Product condition is required'],
    enum: {
      values: ['New', 'Used', 'Needs Repair', 'Refurbished'],
      message: 'Condition must be one of: New, Used, Needs Repair, Refurbished'
    }
  },
  brand: {
    type: String,
    trim: true,
    maxLength: [100, 'Brand name cannot exceed 100 characters']
  },
  model: {
    type: String,
    trim: true,
    maxLength: [100, 'Model cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    enum: ['YER', 'USD', 'SAR', 'YER_SOUTH'],
    default: 'YER'
  },
  isNegotiable: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    required: [true, 'Contact phone is required'],
    trim: true
  },
  whatsappPhone: {
    type: String,
    trim: true
  },
  governorate: {
    type: String,
    required: [true, 'Governorate is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  locationText: {
    type: String,
    trim: true,
    maxLength: [500, 'Location details cannot exceed 500 characters']
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
  // specifications: {
  //   type: Map,
  //   of: String
  // },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' // Changed from 'pending' to 'approved' for auto-approval
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  contactCount: {
    type: Number,
    default: 0
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true
  },
  postedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Auto-expire after 90 days
      return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    }
  },
  boostedUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create compound indexes for better query performance
productSchema.index({ governorate: 1, city: 1 });
productSchema.index({ type: 1, condition: 1 });
productSchema.index({ status: 1, isActive: 1 });
productSchema.index({ price: 1, type: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ featured: -1, createdAt: -1 });
productSchema.index({ userId: 1, status: 1 });
productSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for contact info
productSchema.virtual('contactInfo').get(function() {
  return {
    phone: this.phone,
    whatsapp: this.whatsappPhone || this.phone
  };
});

// Instance method to increment views
productSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to approve product
productSchema.methods.approve = function(adminId) {
  this.status = 'approved';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.rejectionReason = '';
  return this.save();
};

// Instance method to reject product
productSchema.methods.reject = function(reason, adminId) {
  this.status = 'rejected';
  this.rejectionReason = reason;
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  return this.save();
};

// Static method to find approved products
productSchema.statics.findApproved = function(filters = {}) {
  return this.find({
    status: 'approved',
    isActive: true,
    expiresAt: { $gt: new Date() },
    ...filters
  });
};

// Static method for marketplace search
productSchema.statics.searchMarketplace = function(filters = {}) {
  const {
    type,
    condition,
    minPrice,
    maxPrice,
    governorate,
    city,
    brand,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = -1
  } = filters;

  const query = {
    status: 'approved',
    isActive: true,
    expiresAt: { $gt: new Date() }
  };

  if (type) query.type = type;
  if (condition) query.condition = condition;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = minPrice;
    if (maxPrice) query.price.$lte = maxPrice;
  }
  if (governorate) query.governorate = new RegExp(governorate, 'i');
  if (city) query.city = new RegExp(city, 'i');
  if (brand) query.brand = new RegExp(brand, 'i');
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { brand: new RegExp(search, 'i') }
    ];
  }

  const skip = (page - 1) * limit;
  const sort = {};
  sort[sortBy] = sortOrder;

  return this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('userId', 'name phone')
    .select('-__v');
};

module.exports = mongoose.model('Product', productSchema);
