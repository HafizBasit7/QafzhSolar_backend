const { AppError } = require('./errorHandler');

// Validation helper functions
const isValidPhone = (phone) => {
  return /^[0-9+()-\s]{8,15}$/.test(phone);
};

const isValidEmail = (email) => {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

const isValidUrl = (url) => {
  return /^https?:\/\/.+/i.test(url);
};

const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// User registration validation
const validateUserRegistration = (req, res, next) => {
  const { phone } = req.body;

  if (!phone) {
    return next(new AppError('Phone number is required', 400));
  }

  if (phone.length<8) {
    console.log("tet");
    
    return next(new AppError('Please provide a valid phone number', 400));
  }

  next();
};

// OTP verification validation
const validateOTPVerification = (req, res, next) => {
  const {phone} = req.params
  const { otp } = req.body;

  if (!phone || !otp) {
    return next(new AppError('Phone number and OTP are required', 400));
  }

  if (phone.length<8) {
    return next(new AppError('Please provide a valid phone number', 400));
  }

  if (otp.length !== 6) {
    return next(new AppError('OTP must be 6 digits', 400));
  }

  next();
};

// User profile update validation
const validateUserProfileUpdate = (req, res, next) => {
  const { name, profileImageUrl } = req.body;

  if (name && (name.trim().length < 2 || name.trim().length > 100)) {
    return next(new AppError('Name must be between 2 and 100 characters', 400));
  }

  if (profileImageUrl && !isValidUrl(profileImageUrl)) {
    return next(new AppError('Profile image must be a valid URL', 400));
  }

  next();
};

// Product creation validation
const validateProductCreation = (req, res, next) => {
  const { 
    name, 
    type, 
    condition, 
    price, 
    phone, 
    governorate, 
    city,
    images
  } = req.body;

  // Required fields validation
  if (!name || name.trim().length < 2 || name.trim().length > 200) {
    return next(new AppError('Product name must be between 2 and 200 characters', 400));
  }

  const validTypes = ['Inverter', 'Panel', 'Battery', 'Accessory', 'Cable', 'Controller', 'Monitor', 'Other'];
  if (!type || !validTypes.includes(type)) {
    return next(new AppError('Invalid product type', 400));
  }

  const validConditions = ['New', 'Used', 'Needs Repair', 'Refurbished'];
  if (!condition || !validConditions.includes(condition)) {
    return next(new AppError('Invalid product condition', 400));
  }

  if (!price || price < 0 || price > 999999999) {
    return next(new AppError('Price must be between 0 and 999,999,999', 400));
  }

  if (!phone || phone.length<8) {
    return next(new AppError('Please provide a valid phone number', 400));
  }

  if (!governorate || governorate.trim().length === 0) {
    return next(new AppError('Governorate is required', 400));
  }

  if (!city || city.trim().length === 0) {
    return next(new AppError('City is required', 400));
  }

  // Validate images if provided
  // if (images && Array.isArray(images)) {
  //   for (let i = 0; i < images.length; i++) {
  //     if (!isValidUrl(images[i])) {
  //       return next(new AppError(`Image ${i + 1} must be a valid URL`, 400));
  //     }
  //   }
  // }

  next();
};

// Engineer creation validation (Admin only)
const validateEngineerCreation = (req, res, next) => {
  const { 
    name, 
    phone, 
    services, 
    governorate, 
    city,
    email,
    whatsappPhone
  } = req.body;

  // Required fields validation
  if (!name || name.trim().length < 2 || name.trim().length > 100) {
    return next(new AppError('Engineer name must be between 2 and 100 characters', 400));
  }

  if (!phone || phone.length<8) {
    return next(new AppError('Please provide a valid phone number', 400));
  }

  if (whatsappPhone && !isValidPhone(whatsappPhone)) {
    return next(new AppError('Please provide a valid WhatsApp phone number', 400));
  }

  if (email && !isValidEmail(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  const validServices = ['Install', 'Repair', 'Maintenance', 'Consultation', 'Design'];
  if (!services || !Array.isArray(services) || services.length === 0) {
    return next(new AppError('At least one service is required', 400));
  }

  for (const service of services) {
    if (!validServices.includes(service)) {
      return next(new AppError('Invalid service type', 400));
    }
  }

  if (!governorate || governorate.trim().length === 0) {
    return next(new AppError('Governorate is required', 400));
  }

  if (!city || city.trim().length === 0) {
    return next(new AppError('City is required', 400));
  }

  next();
};

// Shop creation validation (Admin only)
const validateShopCreation = (req, res, next) => {
  const { 
    name, 
    phone, 
    services, 
    governorate, 
    city,
    email,
    website,
    whatsappPhone
  } = req.body;

  // Required fields validation
  if (!name || name.trim().length < 2 || name.trim().length > 200) {
    return next(new AppError('Shop name must be between 2 and 200 characters', 400));
  }

  if (!phone || phone.length<8) {
    return next(new AppError('Please provide a valid phone number', 400));
  }

  if (whatsappPhone && !isValidPhone(whatsappPhone)) {
    return next(new AppError('Please provide a valid WhatsApp phone number', 400));
  }

  if (email && !isValidEmail(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  if (website && !isValidUrl(website)) {
    return next(new AppError('Website must be a valid URL', 400));
  }

  const validServices = ['sale', 'install', 'repair', 'maintenance', 'consultation', 'warranty'];
  if (!services || !Array.isArray(services) || services.length === 0) {
    return next(new AppError('At least one service is required', 400));
  }

  for (const service of services) {
    if (!validServices.includes(service)) {
      return next(new AppError('Invalid service type', 400));
    }
  }

  if (!governorate || governorate.trim().length === 0) {
    return next(new AppError('Governorate is required', 400));
  }

  if (!city || city.trim().length === 0) {
    return next(new AppError('City is required', 400));
  }

  next();
};

// Ad creation validation (Admin only)
const validateAdCreation = (req, res, next) => {
  const { 
    title, 
    imageUrl, 
    linkType, 
    placement,
    externalUrl,
    internalRoute
  } = req.body;

  // Required fields validation
  if (!title || title.trim().length < 3 || title.trim().length > 200) {
    return next(new AppError('Ad title must be between 3 and 200 characters', 400));
  }

  if (!imageUrl || !isValidUrl(imageUrl)) {
    return next(new AppError('Valid image URL is required', 400));
  }

  const validLinkTypes = ['internal', 'external', 'none'];
  if (!linkType || !validLinkTypes.includes(linkType)) {
    return next(new AppError('Invalid link type', 400));
  }

  if (linkType === 'external' && (!externalUrl || !isValidUrl(externalUrl))) {
    return next(new AppError('Valid external URL is required for external links', 400));
  }

  if (linkType === 'internal' && (!internalRoute || internalRoute.trim().length === 0)) {
    return next(new AppError('Internal route is required for internal links', 400));
  }

  const validPlacements = ['homepage', 'marketplace', 'calculator', 'engineerPage', 'offersTab', 'banner', 'sidebar'];
  if (!placement || !validPlacements.includes(placement)) {
    return next(new AppError('Invalid placement', 400));
  }

  next();
};

// Admin creation validation
const validateAdminCreation = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2 || name.trim().length > 100) {
    return next(new AppError('Admin name must be between 2 and 100 characters', 400));
  }

  if (!email || !isValidEmail(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  if (!password || password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long', 400));
  }

  next();
};

// Pagination validation
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  req.pagination = {
    page: Math.max(1, parseInt(page) || 1),
    limit: Math.min(100, Math.max(1, parseInt(limit) || 20))
  };

  next();
};

// ObjectId validation middleware
const validateObjectId = (paramName) => (req, res, next) => {
  const id = req.params[paramName];
  
  if (!id || !isValidObjectId(id)) {
    return next(new AppError(`Invalid ${paramName}`, 400));
  }
  
  next();
};

module.exports = {
  validateUserRegistration,
  validateOTPVerification,
  validateUserProfileUpdate,
  validateProductCreation,
  validateEngineerCreation,
  validateShopCreation,
  validateAdCreation,
  validateAdminCreation,
  validatePagination,
  validateObjectId
}; 