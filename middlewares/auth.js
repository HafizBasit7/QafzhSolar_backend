require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/auth');
const Admin = require('../models/admin');
const { AppError } = require('./errorHandler');
const { catchAsync } = require('./errorHandler');

// Generate JWT token
const signToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  });
};

// Create and send token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);
  
  const cookieOptions = {
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Protect routes - verify JWT token
const authToken = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  const decoded = jwt.verify(token, process.env.SECRET_KEY);

  // 3) Check if user still exists
  let currentUser;
  if (decoded.role === 'admin' || decoded.role === 'super_admin' || decoded.role === 'moderator') {
    currentUser = await Admin.findById(decoded.id).select('+isActive');
    if (!currentUser || !currentUser.isActive) {
      return next(new AppError('The admin account no longer exists or is inactive.', 401));
    }
    
    // 4) Check if admin changed password after the token was issued
    if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('Admin recently changed password! Please log in again.', 401));
    }
  } else {
    currentUser = await User.findById(decoded.id).select('+isActive');
    if (!currentUser || !currentUser.isActive) {
      return next(new AppError('The user account no longer exists or is inactive.', 401));
    }
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

// Restrict to certain roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'super_admin', 'moderator'].includes(req.user.role)) {
    return next(new AppError('Access denied. Admins only.', 403));
  }
  next();
};

// Check if user is super admin
const isSuperAdmin = (req, res, next) => {
  if (!req.user || !req.user.isSuperAdmin) {
    return next(new AppError('Access denied. Super admins only.', 403));
  }
  next();
};

// Check if user is verified
const isVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return next(new AppError('Please verify your phone number first.', 403));
  }
  next();
};

// Check admin permissions for specific resource and action
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    if (req.user.role === 'user') {
      return next(new AppError('Access denied. Admins only.', 403));
    }

    if (!req.user.hasPermission || !req.user.hasPermission(resource, action)) {
      return next(new AppError(`You don't have permission to ${action} ${resource}`, 403));
    }
    
    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      
      let currentUser;
      if (decoded.role === 'admin' || decoded.role === 'super_admin' || decoded.role === 'moderator') {
        currentUser = await Admin.findById(decoded.id).select('+isActive');
      } else {
        currentUser = await User.findById(decoded.id).select('+isActive');
      }
      
      if (currentUser && currentUser.isActive) {
        req.user = currentUser;
      }
    } catch (err) {
      // Token is invalid, but we continue without authentication
      // This allows anonymous access while still providing user context if available
    }
  }

  next();
});

// Rate limiting for authentication endpoints
const authRateLimit = (windowMs, max) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    if (!attempts.has(key)) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const userData = attempts.get(key);
    
    if (now > userData.resetTime) {
      userData.count = 1;
      userData.resetTime = now + windowMs;
      return next();
    }
    
    if (userData.count >= max) {
      return next(new AppError('Too many authentication attempts. Please try again later.', 429));
    }
    
    userData.count++;
    next();
  };
};

module.exports = {
  signToken,
  createSendToken,
  authToken,
  restrictTo,
  isAdmin,
  isSuperAdmin,
  isVerified,
  checkPermission,
  optionalAuth,
  authRateLimit
};

