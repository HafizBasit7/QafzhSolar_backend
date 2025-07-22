const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

// Rate limiting configurations
const createRateLimit = (windowMs, max, message = 'Too many requests, please try again later') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      status: 'error',
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        status: 'error',
        message
      });
    }
  });
};

// General rate limiting - 1000 requests per hour
const generalLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  1000,
  'Too many requests from this IP, please try again in an hour'
);

// Auth rate limiting - 5 attempts per 15 minutes
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5,
  'Too many authentication attempts, please try again in 15 minutes'
);

// API rate limiting - 100 requests per 10 minutes
const apiLimiter = createRateLimit(
  10 * 60 * 1000, // 10 minutes
  100,
  'Too many API requests, please try again later'
);

// Strict rate limiting for sensitive operations - 10 requests per hour
const strictLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10,
  'Rate limit exceeded for this operation'
);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'https://yourdomain.com'];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Security headers configuration
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};

// Request sanitization
const sanitizeRequest = (req, res, next) => {
  // Mongo injection sanitization
  mongoSanitize()(req, res, () => {
    // XSS sanitization
    xss()(req, res, () => {
      // HPP (HTTP Parameter Pollution) protection
      hpp({
        whitelist: [
          'sort', 'page', 'limit', 'fields',
          'governorate', 'city', 'type', 'condition',
          'services', 'brands'
        ]
      })(req, res, next);
    });
  });
};

// IP whitelist middleware (for admin routes if needed)
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (allowedIPs.length === 0 || allowedIPs.includes(clientIP)) {
      return next();
    }
    
    res.status(403).json({
      status: 'error',
      message: 'Access denied from this IP address'
    });
  };
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  
  // Log response time
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// Security middleware setup function
const setupSecurity = (app) => {
  // Trust proxy (important for rate limiting and IP detection)
  app.set('trust proxy', 1);
  
  // Security headers
  app.use(helmet(helmetConfig));
  
  // CORS
  app.use(cors(corsOptions));
  
  // Rate limiting
  app.use('/api/', generalLimiter);
  
  // Request sanitization
  app.use(sanitizeRequest);
  
  // Request logging in development
  if (process.env.NODE_ENV === 'development') {
    app.use(requestLogger);
  }
  
  // Disable X-Powered-By header
  app.disable('x-powered-by');
};

module.exports = {
  setupSecurity,
  generalLimiter,
  authLimiter,
  apiLimiter,
  strictLimiter,
  corsOptions,
  sanitizeRequest,
  ipWhitelist,
  requestLogger
}; 