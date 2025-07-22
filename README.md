# Qafzh Solar Marketplace API

A comprehensive REST API for a solar products marketplace platform built with Node.js, Express.js, and MongoDB.

## 🌟 Features

- **User Authentication**: Mobile-only registration with OTP verification
- **Product Management**: Create, browse, and manage solar product listings
- **Engineer Directory**: Admin-managed solar engineers with location-based search
- **Verified Shops**: Admin-managed verified solar equipment shops
- **Admin Panel**: Complete admin dashboard with approval workflows
- **Marketplace Filters**: Advanced filtering by location, type, price, etc.
- **Security**: Rate limiting, input validation, XSS protection, and more
- **API Documentation**: Complete Swagger/OpenAPI documentation

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB (v4.4+ recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/qafzh-solar-api.git
   cd qafzh-solar-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   MONGO_URI=mongodb://localhost:27017/qafzh_solar_db
   
   # JWT Configuration
   SECRET_KEY=your-very-secure-jwt-secret-key-change-this-in-production
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90
   
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   API_BASE_URL=http://localhost:5000
   
   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   
   # Admin Configuration
   ADMIN_EMAIL=admin@qafzh-solar.com
   ADMIN_PASSWORD=Admin123!@#
   ```

4. **Set up the database**
   ```bash
   # Start MongoDB (if running locally)
   mongod
   
   # Create default admin user (optional)
   npm run seed:admin
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

The API will be available at `http://localhost:5000`

## 📖 API Documentation

Once the server is running, visit `http://localhost:5000/api-docs` for the complete interactive API documentation.

### Quick API Overview

#### Authentication
- `POST /api/v1/auth/register` - Register with phone number
- `POST /api/v1/auth/verify-otp` - Verify OTP and get token
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile

#### Products
- `POST /api/v1/products` - Create product listing
- `GET /api/v1/marketplace/products` - Browse approved products
- `GET /api/v1/products/:id` - Get product details

#### Engineers
- `GET /api/v1/marketplace/engineers` - Browse engineers
- `GET /api/v1/marketplace/engineers/search` - Search engineers by location

#### Shops
- `GET /api/v1/marketplace/shops` - Browse verified shops

#### Admin
- `POST /api/v1/admin-auth/login` - Admin login
- `GET /api/v1/admin/products/pending` - Get pending product approvals
- `PUT /api/v1/admin/products/:id/approve` - Approve product
- `POST /api/v1/engineers` - Create engineer profile

## 🏗️ Architecture

### Project Structure
```
├── app.js              # Application entry point
├── config/
│   ├── db.js          # Database configuration
│   └── swagger.js     # API documentation setup
├── controllers/       # Route controllers
├── middlewares/       # Custom middleware
├── models/           # Mongoose schemas
├── routes/           # API routes
├── utils/            # Utility functions
├── scripts/          # Database scripts
└── data/             # Static data (governorates)
```

### Key Technologies
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with mobile OTP verification
- **Security**: Helmet, express-rate-limit, express-mongo-sanitize
- **Documentation**: Swagger/OpenAPI 3.0
- **Validation**: Custom validation middleware

## 🔐 Security Features

- **Rate Limiting**: Multiple rate limiting strategies
- **Input Validation**: Comprehensive request validation
- **Data Sanitization**: NoSQL injection and XSS protection
- **Security Headers**: Helmet.js for security headers
- **JWT Security**: Secure token implementation with refresh
- **Password Security**: Bcrypt with proper salt rounds
- **CORS**: Configurable cross-origin resource sharing

## 🌍 Governorates Support

The API supports all 22 Yemeni governorates with their respective cities:
- Abyan, Aden, Al Bayda, Al Dhale'e, Al Hudaydah
- Al Jawf, Al Mahrah, Al Mahwit, Amanat Al Asimah (Sana'a City)
- Amran, Dhamar, Hadhramaut, Hajjah, Ibb, Lahij
- Ma'rib, Raymah, Sa'dah, Sana'a, Shabwah, Socotra, Taiz

## 📋 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Register user with phone number
- `POST /verify-otp` - Verify OTP (fixed: 112233 for testing)
- `POST /request-otp` - Request new OTP
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /logout` - Logout user
- `DELETE /account` - Delete user account
- `GET /check-phone` - Check if phone is available

### Admin Authentication (`/api/v1/admin-auth`)
- `POST /login` - Admin login
- `GET /profile` - Get admin profile
- `PUT /profile` - Update admin profile
- `PUT /change-password` - Change admin password
- `POST /create` - Create new admin (super admin only)

### Products (`/api/v1/products`)
- `POST /` - Create product listing (anonymous allowed)
- `GET /:id` - Get product details
- `PUT /:id` - Update product (owner only)
- `DELETE /:id` - Delete product (owner only)

### Engineers (`/api/v1/engineers`)
- `POST /` - Create engineer (admin only)
- `GET /` - Get all engineers
- `GET /:id` - Get engineer details
- `PUT /:id` - Update engineer (admin only)
- `DELETE /:id` - Delete engineer (admin only)

### Shops (`/api/v1/shops`)
- `POST /` - Create shop (admin only)
- `GET /` - Get all shops
- `GET /:id` - Get shop details
- `PUT /:id` - Update shop (admin only)
- `DELETE /:id` - Delete shop (admin only)

### Marketplace (`/api/v1/marketplace`)
- `GET /products` - Browse approved products with filters
- `GET /engineers` - Browse engineers with filters
- `GET /shops` - Browse verified shops with filters
- `GET /governorates` - Get governorates and cities
- `GET /search` - Global search across products, engineers, shops

### Admin Panel (`/api/v1/admin`)
- `GET /stats` - Get dashboard statistics
- `GET /products/pending` - Get pending products
- `PUT /products/:id/approve` - Approve product
- `PUT /products/:id/reject` - Reject product
- `GET /users` - Get all users
- `PUT /users/:id/status` - Update user status

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/qafzh_solar_db` |
| `SECRET_KEY` | JWT secret key | - |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |
| `JWT_EXPIRES_IN` | JWT expiration time | `90d` |

### Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General API | 1000 requests | 1 hour |
| Authentication | 5 attempts | 15 minutes |
| Admin Auth | 3 attempts | 15 minutes |

## 🧪 Testing

The API includes comprehensive testing (to be implemented):

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong `SECRET_KEY`
   - Configure production MongoDB URI
   - Set proper CORS origins

2. **Security**
   - Enable HTTPS
   - Configure firewall
   - Set up monitoring
   - Regular security updates

3. **Performance**
   - Enable MongoDB indexes
   - Configure caching
   - Set up load balancing
   - Monitor performance metrics

### Docker Deployment (Optional)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@qafzh-solar.com or create an issue on GitHub.

## 🗺️ Roadmap

- [ ] Real-time notifications
- [ ] Payment gateway integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app API extensions
- [ ] Multi-language support
- [ ] Image optimization service
- [ ] Advanced search with Elasticsearch
- [ ] Microservices architecture

---

**Built with ❤️ for the solar energy community in Yemen** 