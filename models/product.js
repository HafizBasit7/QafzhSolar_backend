const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minLength: [2, 'Product name must be at least 2 characters'],
    maxLength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: {
      values: ['Inverter', 'Panel', 'Battery', 'Accessory', 'Cable', 'Controller', 'Monitor', 'Other'],
      message: 'Invalid product type'
    },
    required: [true, 'Product type is required'],
    index: true
  },
  condition: {
    type: String,
    enum: {
      values: ['New', 'Used', 'Needs Repair', 'Refurbished'],
      message: 'Invalid product condition'
    },
    required: [true, 'Product condition is required'],
    index: true
  },
  brand: {
    type: String,
    default: 'Unknown',
    trim: true,
    maxLength: [100, 'Brand name cannot exceed 100 characters']
  },
  model: {
    type: String,
    default: '',
    trim: true,
    maxLength: [100, 'Model cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    max: [999999999, 'Price is too high'],
    index: true
  },
  currency: {
    type: String,
    enum: ['YER', 'USD', 'SAR', 'EUR'],
    default: 'YER'
  },
  phone: {
    type: String,
    required: [true, 'Contact phone is required'],
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
  locationText: {
    type: String,
    default: '',
    trim: true,
    maxLength: [500, 'Location text cannot exceed 500 characters']
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
  specifications: {
    power: {
      type: String,
      default: ''
    },
    voltage: {
      type: String,
      default: ''
    },
    capacity: {
      type: String,
      default: ''
    },
    warranty: {
      type: String,
      default: ''
    }
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected', 'sold', 'inactive'],
      message: 'Invalid status'
    },
    default: 'pending',
    index: true
  },
  rejectionReason: {
    type: String,
    default: '',
    trim: true
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
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  isNegotiable: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    index: true
  }
}, {
  timestamps: true
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
