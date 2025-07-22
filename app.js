require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Security middleware
const { setupSecurity } = require('./middlewares/security');
const { globalErrorHandler } = require('./middlewares/errorHandler');
const { AppError } = require('./middlewares/errorHandler');

// Initialize app
const app = express();

// Connect to MongoDB
connectDB();

// Security setup (CORS, rate limiting, sanitization, etc.)
setupSecurity(app);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// API Documentation (Swagger)
const { swaggerSpec, swaggerUi } = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Qafzh Solar API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true
  }
}));

// Default Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Qafzh Solar System API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    documentation: '/api-docs'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/admin-auth', require('./routes/adminAuthRoutes'));
app.use('/api/v1/products', require('./routes/productRoute'));
app.use('/api/v1/engineers', require('./routes/engineerRoutes'));
app.use('/api/v1/shops', require('./routes/shopRoutes'));
app.use('/api/v1/ads', require('./routes/adsRoutes'));
app.use('/api/v1/admin', require('./routes/adminApprovalRoutes'));
app.use('/api/v1/admin/stats', require('./routes/adminStatsRoute'));
app.use('/api/v1/marketplace', require('./routes/userRoutes'));

// Catch unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', err);
  console.log('Shutting down the server due to Unhandled Rejection');
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception thrown:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

module.exports = app;
