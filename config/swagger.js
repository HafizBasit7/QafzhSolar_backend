const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Basic Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Qafzh Solar Marketplace API',
    version: '1.0.0',
    description: 'A comprehensive REST API for the solar products marketplace platform',
    contact: {
      name: 'API Support',
      email: 'support@qafzh-solar.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: process.env.API_BASE_URL || 'http://localhost:5000',
      description: 'Development server'
    },
    {
      url: 'https://api.qafzh-solar.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme'
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'jwt',
        description: 'JWT token stored in cookie'
      }
    },
    schemas: {
      // User schemas
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '64abc123def456789012345' },
          phone: { type: 'string', example: '+967777123456' },
          name: { type: 'string', example: 'Ahmed Ali' },
          profileImageUrl: { type: 'string', example: 'https://example.com/profile.jpg' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          isVerified: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      UserRegistration: {
        type: 'object',
        required: ['phone'],
        properties: {
          phone: { type: 'string', example: '+967777123456' }
        }
      },
      OTPVerification: {
        type: 'object',
        required: ['phone', 'otp'],
        properties: {
          phone: { type: 'string', example: '+967777123456' },
          otp: { type: 'string', example: '112233' }
        }
      },
      UserProfileUpdate: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Ahmed Ali' },
          profileImageUrl: { type: 'string', example: 'https://example.com/profile.jpg' }
        }
      },

      // Product schemas
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '64abc123def456789012345' },
          name: { type: 'string', example: '100W Solar Panel' },
          description: { type: 'string', example: 'High efficiency monocrystalline solar panel' },
          type: { type: 'string', enum: ['Inverter', 'Panel', 'Battery', 'Accessory', 'Cable', 'Controller', 'Monitor', 'Other'] },
          condition: { type: 'string', enum: ['New', 'Used', 'Needs Repair', 'Refurbished'] },
          brand: { type: 'string', example: 'SolarTech' },
          model: { type: 'string', example: 'ST-100' },
          price: { type: 'number', example: 15000 },
          currency: { type: 'string', enum: ['YER', 'USD', 'SAR', 'EUR'], example: 'YER' },
          phone: { type: 'string', example: '+967777123456' },
          whatsappPhone: { type: 'string', example: '+967777123456' },
          governorate: { type: 'string', example: 'Sana\'a' },
          city: { type: 'string', example: 'Sanhan' },
          locationText: { type: 'string', example: 'Near the main mosque' },
          images: {
            type: 'array',
            items: { type: 'string', format: 'url' },
            example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
          },
          specifications: {
            type: 'object',
            properties: {
              power: { type: 'string', example: '100W' },
              voltage: { type: 'string', example: '12V' },
              capacity: { type: 'string', example: '100Ah' },
              warranty: { type: 'string', example: '2 years' }
            }
          },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'sold', 'inactive'] },
          views: { type: 'number', example: 25 },
          isNegotiable: { type: 'boolean', example: true },
          featured: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
          expiresAt: { type: 'string', format: 'date-time' }
        }
      },
      ProductCreate: {
        type: 'object',
        required: ['name', 'type', 'condition', 'price', 'phone', 'governorate', 'city'],
        properties: {
          name: { type: 'string', example: '100W Solar Panel' },
          description: { type: 'string', example: 'High efficiency monocrystalline solar panel' },
          type: { type: 'string', enum: ['Inverter', 'Panel', 'Battery', 'Accessory', 'Cable', 'Controller', 'Monitor', 'Other'] },
          condition: { type: 'string', enum: ['New', 'Used', 'Needs Repair', 'Refurbished'] },
          brand: { type: 'string', example: 'SolarTech' },
          model: { type: 'string', example: 'ST-100' },
          price: { type: 'number', example: 15000 },
          currency: { type: 'string', enum: ['YER', 'USD', 'SAR', 'EUR'], example: 'YER' },
          phone: { type: 'string', example: '+967777123456' },
          whatsappPhone: { type: 'string', example: '+967777123456' },
          governorate: { type: 'string', example: 'Sana\'a' },
          city: { type: 'string', example: 'Sanhan' },
          locationText: { type: 'string', example: 'Near the main mosque' },
          images: {
            type: 'array',
            items: { type: 'string', format: 'url' },
            example: ['https://example.com/image1.jpg']
          },
          specifications: {
            type: 'object',
            properties: {
              power: { type: 'string', example: '100W' },
              voltage: { type: 'string', example: '12V' },
              capacity: { type: 'string', example: '100Ah' },
              warranty: { type: 'string', example: '2 years' }
            }
          },
          isNegotiable: { type: 'boolean', example: true }
        }
      },

      // Engineer schemas
      Engineer: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '64abc123def456789012345' },
          name: { type: 'string', example: 'Mohammad Hassan' },
          phone: { type: 'string', example: '+967777123456' },
          whatsappPhone: { type: 'string', example: '+967777123456' },
          email: { type: 'string', example: 'engineer@example.com' },
          services: {
            type: 'array',
            items: { type: 'string', enum: ['Install', 'Repair', 'Maintenance', 'Consultation', 'Design'] },
            example: ['Install', 'Repair']
          },
          specializations: {
            type: 'array',
            items: { type: 'string', enum: ['Residential', 'Commercial', 'Industrial', 'Off-grid', 'On-grid', 'Hybrid'] }
          },
          governorate: { type: 'string', example: 'Sana\'a' },
          city: { type: 'string', example: 'Sanhan' },
          address: { type: 'string', example: 'Al-Tahrir Street, Building 15' },
          experience: {
            type: 'object',
            properties: {
              years: { type: 'number', example: 5 },
              description: { type: 'string', example: '5 years of experience in solar installations' }
            }
          },
          rating: {
            type: 'object',
            properties: {
              average: { type: 'number', example: 4.5 },
              count: { type: 'number', example: 20 }
            }
          },
          profileImageUrl: { type: 'string', example: 'https://example.com/profile.jpg' },
          availability: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['Available', 'Busy', 'Unavailable'] }
            }
          },
          pricing: {
            type: 'object',
            properties: {
              hourlyRate: { type: 'number', example: 1000 },
              currency: { type: 'string', enum: ['YER', 'USD', 'SAR', 'EUR'] },
              minimumCharge: { type: 'number', example: 5000 }
            }
          },
          isVerified: { type: 'boolean', example: true },
          views: { type: 'number', example: 150 },
          contactsCount: { type: 'number', example: 25 }
        }
      },

      // Shop schemas
      Shop: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '64abc123def456789012345' },
          name: { type: 'string', example: 'Solar Solutions Store' },
          description: { type: 'string', example: 'Professional solar equipment supplier' },
          phone: { type: 'string', example: '+967777123456' },
          whatsappPhone: { type: 'string', example: '+967777123456' },
          email: { type: 'string', example: 'shop@example.com' },
          website: { type: 'string', example: 'https://solarsolutions.com' },
          governorate: { type: 'string', example: 'Sana\'a' },
          city: { type: 'string', example: 'Sanhan' },
          address: { type: 'string', example: 'Commercial Street, Building 20' },
          services: {
            type: 'array',
            items: { type: 'string', enum: ['sale', 'install', 'repair', 'maintenance', 'consultation', 'warranty'] },
            example: ['sale', 'install']
          },
          productCategories: {
            type: 'array',
            items: { type: 'string', enum: ['Inverter', 'Panel', 'Battery', 'Accessory', 'Cable', 'Controller', 'Monitor', 'Complete Systems'] }
          },
          brands: {
            type: 'array',
            items: { type: 'string' },
            example: ['SolarTech', 'PowerMax']
          },
          rating: {
            type: 'object',
            properties: {
              average: { type: 'number', example: 4.2 },
              count: { type: 'number', example: 35 }
            }
          },
          logoUrl: { type: 'string', example: 'https://example.com/logo.jpg' },
          isVerified: { type: 'boolean', example: true },
          views: { type: 'number', example: 300 }
        }
      },

      // Common schemas
      ApiResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success', 'fail', 'error'] },
          message: { type: 'string' },
          data: { type: 'object' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['fail', 'error'] },
          message: { type: 'string' }
        }
      },
      PaginationResponse: {
        type: 'object',
        properties: {
          currentPage: { type: 'number', example: 1 },
          totalPages: { type: 'number', example: 5 },
          totalItems: { type: 'number', example: 100 },
          itemsPerPage: { type: 'number', example: 20 }
        }
      },
      Governorate: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Sana\'a' },
          cities: {
            type: 'array',
            items: { type: 'string' },
            example: ['Sanhan', 'Khawlan', 'Bani Matar']
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication information is missing or invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              status: 'fail',
              message: 'You are not logged in! Please log in to get access.'
            }
          }
        }
      },
      ForbiddenError: {
        description: 'Access denied due to insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              status: 'fail',
              message: 'You do not have permission to perform this action'
            }
          }
        }
      },
      NotFoundError: {
        description: 'The requested resource was not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              status: 'fail',
              message: 'Resource not found'
            }
          }
        }
      },
      ValidationError: {
        description: 'Input validation failed',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              status: 'fail',
              message: 'Invalid input data. Phone number is required'
            }
          }
        }
      },
      RateLimitError: {
        description: 'Too many requests',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              status: 'error',
              message: 'Too many requests, please try again later'
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

// Options for the swagger docs
const options = {
  definition: swaggerDefinition,
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerSpec,
  swaggerUi
}; 