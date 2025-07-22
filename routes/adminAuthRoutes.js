
const express = require('express');
const router = express.Router();

// Import controllers
const adminAuthController = require('../controllers/adminAuthController');

// Import middleware
const { authToken, isAdmin, isSuperAdmin, authRateLimit } = require('../middlewares/auth');
const { validateAdminCreation, validateObjectId } = require('../middlewares/validation');

// Rate limiting for admin auth endpoints
const adminAuthLimiter = authRateLimit(15 * 60 * 1000, 3); // 3 attempts per 15 minutes (stricter)

/**
 * @swagger
 * /api/v1/admin-auth/login:
 *   post:
 *     tags:
 *       - Admin Authentication
 *     summary: Admin login
 *     description: |
 *       Login endpoint for administrators only.
 *       **Admin Credentials Required**: Only pre-registered admin accounts can login.
 *       **Rate Limited**: Maximum 3 login attempts per 15 minutes for security.
 *       **Roles Supported**: 
 *       - `admin`: Standard administrator with management permissions
 *       - `super_admin`: Super administrator with full system access including admin management
 *       
 *       Upon successful login, admin receives JWT token with role-based permissions.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 description: Admin username (case insensitive)
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Admin password
 *                 example: "securePassword123"
 *           examples:
 *             admin_login:
 *               summary: Standard admin login
 *               value:
 *                 username: "admin"
 *                 password: "adminPassword123"
 *             super_admin_login:
 *               summary: Super admin login
 *               value:
 *                 username: "superadmin"
 *                 password: "superSecurePassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: JWT token set as httpOnly cookie
 *             schema:
 *               type: string
 *               example: "jwt=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Secure; SameSite=Strict"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               admin_success:
 *                 summary: Standard admin login success
 *                 value:
 *                   status: "success"
 *                   message: "Admin login successful"
 *                   data:
 *                     admin:
 *                       id: "64abc123def456789012345"
 *                       username: "admin"
 *                       email: "admin@qafzh-solar.com"
 *                       role: "admin"
 *                       permissions: ["manage_products", "manage_engineers", "manage_shops", "manage_ads"]
 *                       lastLogin: "2024-01-15T10:30:00.000Z"
 *                       createdAt: "2024-01-01T00:00:00.000Z"
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               super_admin_success:
 *                 summary: Super admin login success
 *                 value:
 *                   status: "success"
 *                   message: "Admin login successful"
 *                   data:
 *                     admin:
 *                       id: "64abc123def456789012346"
 *                       username: "superadmin"
 *                       email: "superadmin@qafzh-solar.com"
 *                       role: "super_admin"
 *                       permissions: ["*"]
 *                       lastLogin: "2024-01-15T10:30:00.000Z"
 *                       createdAt: "2024-01-01T00:00:00.000Z"
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid credentials or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_credentials:
 *                 value:
 *                   status: "fail"
 *                   message: "Invalid username or password"
 *               validation_error:
 *                 value:
 *                   status: "fail"
 *                   message: "Username and password are required"
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Admin account not found or inactive"
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/login', adminAuthLimiter, adminAuthController.loginAdmin);

// Protected admin routes
router.use(authToken, isAdmin); // All routes below require admin authentication

/**
 * @swagger
 * /api/v1/admin-auth/profile:
 *   get:
 *     tags:
 *       - Admin Profile
 *     summary: Get admin profile (Admin only)
 *     description: |
 *       Get the authenticated admin's profile information.
 *       **Admin Access Required**: Authenticated admin can view their own profile.
 *       Shows admin details including permissions and role information.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               admin_profile:
 *                 summary: Standard admin profile
 *                 value:
 *                   status: "success"
 *                   message: "Admin profile retrieved successfully"
 *                   data:
 *                     admin:
 *                       id: "64abc123def456789012345"
 *                       username: "admin"
 *                       email: "admin@qafzh-solar.com"
 *                       role: "admin"
 *                       permissions: ["manage_products", "manage_engineers", "manage_shops", "manage_ads"]
 *                       isActive: true
 *                       lastLogin: "2024-01-15T10:30:00.000Z"
 *                       loginCount: 45
 *                       createdAt: "2024-01-01T00:00:00.000Z"
 *                       updatedAt: "2024-01-15T08:00:00.000Z"
 *               super_admin_profile:
 *                 summary: Super admin profile
 *                 value:
 *                   status: "success"
 *                   message: "Admin profile retrieved successfully"
 *                   data:
 *                     admin:
 *                       id: "64abc123def456789012346"
 *                       username: "superadmin"
 *                       email: "superadmin@qafzh-solar.com"
 *                       role: "super_admin"
 *                       permissions: ["*"]
 *                       isActive: true
 *                       lastLogin: "2024-01-15T10:30:00.000Z"
 *                       loginCount: 123
 *                       createdAt: "2024-01-01T00:00:00.000Z"
 *                       updatedAt: "2024-01-14T22:00:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/profile', adminAuthController.getAdminProfile);

/**
 * @swagger
 * /api/v1/admin-auth/profile:
 *   put:
 *     tags:
 *       - Admin Profile
 *     summary: Update admin profile (Admin only)
 *     description: |
 *       Update the authenticated admin's profile information.
 *       **Admin Access Required**: Authenticated admin can update their own profile.
 *       **Updatable Fields**: email, display name, preferences
 *       **Protected Fields**: username, role, permissions (require super admin)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: New email address
 *                 example: "newemail@qafzh-solar.com"
 *               displayName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Display name for admin
 *                 example: "Ahmed Al-Admin"
 *               preferences:
 *                 type: object
 *                 properties:
 *                   theme:
 *                     type: string
 *                     enum: [light, dark, auto]
 *                     default: "light"
 *                   language:
 *                     type: string
 *                     enum: [en, ar]
 *                     default: "en"
 *                   notifications:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: boolean
 *                         default: true
 *                       system:
 *                         type: boolean
 *                         default: true
 *           examples:
 *             basic_update:
 *               summary: Update email and display name
 *               value:
 *                 email: "updated.admin@qafzh-solar.com"
 *                 displayName: "Ahmed Al-Yamani"
 *             preferences_update:
 *               summary: Update preferences only
 *               value:
 *                 preferences:
 *                   theme: "dark"
 *                   language: "ar"
 *                   notifications:
 *                     email: false
 *                     system: true
 *     responses:
 *       200:
 *         description: Admin profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Admin profile updated successfully"
 *                   data:
 *                     admin:
 *                       id: "64abc123def456789012345"
 *                       username: "admin"
 *                       email: "updated.admin@qafzh-solar.com"
 *                       displayName: "Ahmed Al-Yamani"
 *                       role: "admin"
 *                       preferences:
 *                         theme: "dark"
 *                         language: "ar"
 *                       updatedAt: "2024-01-15T12:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.put('/profile', adminAuthController.updateAdminProfile);

/**
 * @swagger
 * /api/v1/admin-auth/change-password:
 *   put:
 *     tags:
 *       - Admin Profile
 *     summary: Change admin password (Admin only)
 *     description: |
 *       Change the authenticated admin's password.
 *       **Admin Access Required**: Authenticated admin can change their own password.
 *       **Security**: Requires current password verification before setting new password.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current admin password for verification
 *                 example: "currentSecurePassword"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: New password (minimum 8 characters, must include uppercase, lowercase, number)
 *                 example: "NewSecurePassword123"
 *               confirmNewPassword:
 *                 type: string
 *                 description: Confirm new password (must match newPassword)
 *                 example: "NewSecurePassword123"
 *           examples:
 *             password_change:
 *               summary: Change admin password
 *               value:
 *                 currentPassword: "currentSecurePassword"
 *                 newPassword: "NewSecurePassword123"
 *                 confirmNewPassword: "NewSecurePassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Password changed successfully"
 *                   data:
 *                     passwordUpdatedAt: "2024-01-15T12:30:00.000Z"
 *                     message: "Please login again with your new password"
 *       400:
 *         description: Password validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               weak_password:
 *                 value:
 *                   status: "fail"
 *                   message: "Password must be at least 8 characters with uppercase, lowercase, and number"
 *               passwords_mismatch:
 *                 value:
 *                   status: "fail"
 *                   message: "New password and confirm password do not match"
 *               wrong_current:
 *                 value:
 *                   status: "fail"
 *                   message: "Current password is incorrect"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.put('/change-password', adminAuthController.changePassword);

/**
 * @swagger
 * /api/v1/admin-auth/logout:
 *   post:
 *     tags:
 *       - Admin Authentication
 *     summary: Admin logout (Admin only)
 *     description: |
 *       Logout the authenticated admin by clearing the JWT cookie.
 *       **Admin Access Required**: Authenticated admin can logout.
 *       Admin will need to login again to access protected routes.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Admin logout successful
 *         headers:
 *           Set-Cookie:
 *             description: JWT cookie cleared
 *             schema:
 *               type: string
 *               example: "jwt=; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Admin logged out successfully"
 *                   data:
 *                     logoutTime: "2024-01-15T12:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/logout', adminAuthController.logoutAdmin);

// Super admin only routes
router.use(isSuperAdmin);

/**
 * @swagger
 * /api/v1/admin-auth/create:
 *   post:
 *     tags:
 *       - Admin Management (Super Admin)
 *     summary: Create new admin (Super Admin only)
 *     description: |
 *       Create a new administrator account in the system.
 *       **Super Admin Access Required**: Only super administrators can create new admin accounts.
 *       **Role Assignment**: Super admin can assign roles and permissions to new admin.
 *       **Available Roles**:
 *       - `admin`: Standard administrator with predefined permissions
 *       - `super_admin`: Super administrator with full system access
 *       
 *       **Default Admin Permissions**:
 *       - manage_products: Approve/reject product listings
 *       - manage_engineers: Add/edit/verify engineers
 *       - manage_shops: Add/edit/verify shops  
 *       - manage_ads: Create/edit advertisements
 *       - view_stats: Access dashboard statistics
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 pattern: '^[a-zA-Z0-9_]+$'
 *                 description: Unique admin username (alphanumeric and underscore only)
 *                 example: "admin_manager"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email address
 *                 example: "manager@qafzh-solar.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Strong password (min 8 chars, uppercase, lowercase, number)
 *                 example: "SecureAdminPass123"
 *               role:
 *                 type: string
 *                 enum: [admin, super_admin]
 *                 description: Admin role and access level
 *                 example: "admin"
 *               displayName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Display name for the admin
 *                 example: "Product Manager"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [manage_products, manage_engineers, manage_shops, manage_ads, manage_users, view_stats, system_settings]
 *                 description: Specific permissions (optional, defaults based on role)
 *                 example: ["manage_products", "manage_engineers", "view_stats"]
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the admin account is active
 *                 example: true
 *           examples:
 *             standard_admin:
 *               summary: Create standard admin
 *               value:
 *                 username: "product_admin"
 *                 email: "products@qafzh-solar.com"
 *                 password: "SecureAdminPass123"
 *                 role: "admin"
 *                 displayName: "Product Manager"
 *                 permissions: ["manage_products", "view_stats"]
 *             super_admin:
 *               summary: Create super admin
 *               value:
 *                 username: "super_manager"
 *                 email: "super@qafzh-solar.com"
 *                 password: "SuperSecurePass123"
 *                 role: "super_admin"
 *                 displayName: "System Administrator"
 *             full_access_admin:
 *               summary: Create admin with all permissions
 *               value:
 *                 username: "full_admin"
 *                 email: "full@qafzh-solar.com"
 *                 password: "FullAccessPass123"
 *                 role: "admin"
 *                 displayName: "Full Access Manager"
 *                 permissions: ["manage_products", "manage_engineers", "manage_shops", "manage_ads", "view_stats"]
 *     responses:
 *       201:
 *         description: Admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Admin created successfully"
 *                   data:
 *                     admin:
 *                       id: "64abc123def456789012347"
 *                       username: "product_admin"
 *                       email: "products@qafzh-solar.com"
 *                       role: "admin"
 *                       displayName: "Product Manager"
 *                       permissions: ["manage_products", "view_stats"]
 *                       isActive: true
 *                       createdAt: "2024-01-15T12:30:00.000Z"
 *                       createdBy: "64abc123def456789012346"
 *       400:
 *         description: Validation error or username/email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               username_exists:
 *                 value:
 *                   status: "fail"
 *                   message: "Username already exists"
 *               email_exists:
 *                 value:
 *                   status: "fail"
 *                   message: "Email already registered"
 *               weak_password:
 *                 value:
 *                   status: "fail"
 *                   message: "Password must be at least 8 characters with uppercase, lowercase, and number"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Super admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Super admin access required to create admin accounts"
 */
router.post('/create', validateAdminCreation, adminAuthController.createAdmin);

/**
 * @swagger
 * /api/v1/admin-auth/all:
 *   get:
 *     tags:
 *       - Admin Management (Super Admin)
 *     summary: Get all admins (Super Admin only)
 *     description: |
 *       Retrieve a list of all administrator accounts in the system.
 *       **Super Admin Access Required**: Only super administrators can view all admin accounts.
 *       **Information Included**: Admin profiles, roles, permissions, activity status, and statistics.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Number of admins per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *           example: 10
 *       - name: role
 *         in: query
 *         description: Filter by admin role
 *         schema:
 *           type: string
 *           enum: [admin, super_admin, all]
 *           default: "all"
 *           example: "admin"
 *       - name: status
 *         in: query
 *         description: Filter by account status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *           default: "all"
 *           example: "active"
 *       - name: search
 *         in: query
 *         description: Search by username, email, or display name
 *         schema:
 *           type: string
 *           example: "product"
 *       - name: sortBy
 *         in: query
 *         description: Sort field
 *         schema:
 *           type: string
 *           enum: [username, email, role, createdAt, lastLogin]
 *           default: "createdAt"
 *           example: "lastLogin"
 *       - name: sortOrder
 *         in: query
 *         description: Sort order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *           example: "desc"
 *     responses:
 *       200:
 *         description: Admins retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Admins retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     admins:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           username:
 *                             type: string
 *                           email:
 *                             type: string
 *                           role:
 *                             type: string
 *                           displayName:
 *                             type: string
 *                           permissions:
 *                             type: array
 *                             items:
 *                               type: string
 *                           isActive:
 *                             type: boolean
 *                           lastLogin:
 *                             type: string
 *                           loginCount:
 *                             type: number
 *                           createdAt:
 *                             type: string
 *                           createdBy:
 *                             type: string
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         active:
 *                           type: number
 *                         inactive:
 *                           type: number
 *                         admins:
 *                           type: number
 *                         superAdmins:
 *                           type: number
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Admins retrieved successfully"
 *                   data:
 *                     admins:
 *                       - id: "64abc123def456789012345"
 *                         username: "admin"
 *                         email: "admin@qafzh-solar.com"
 *                         role: "admin"
 *                         displayName: "System Admin"
 *                         permissions: ["manage_products", "manage_engineers", "manage_shops"]
 *                         isActive: true
 *                         lastLogin: "2024-01-15T08:30:00.000Z"
 *                         loginCount: 234
 *                         createdAt: "2024-01-01T00:00:00.000Z"
 *                         createdBy: "64abc123def456789012346"
 *                       - id: "64abc123def456789012346"
 *                         username: "superadmin"
 *                         email: "super@qafzh-solar.com"
 *                         role: "super_admin"
 *                         displayName: "Super Administrator"
 *                         permissions: ["*"]
 *                         isActive: true
 *                         lastLogin: "2024-01-15T10:15:00.000Z"
 *                         loginCount: 456
 *                         createdAt: "2024-01-01T00:00:00.000Z"
 *                     pagination:
 *                       currentPage: 1
 *                       totalPages: 1
 *                       totalItems: 2
 *                       itemsPerPage: 10
 *                     summary:
 *                       total: 2
 *                       active: 2
 *                       inactive: 0
 *                       admins: 1
 *                       superAdmins: 1
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Super admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Super admin access required to view admin accounts"
 */
router.get('/all', adminAuthController.getAllAdmins);

/**
 * @swagger
 * /api/v1/admin-auth/permissions/{adminId}:
 *   put:
 *     tags:
 *       - Admin Management (Super Admin)
 *     summary: Update admin permissions (Super Admin only)
 *     description: |
 *       Update permissions for a specific administrator.
 *       **Super Admin Access Required**: Only super administrators can modify admin permissions.
 *       **Permission Management**: Add or remove specific permissions, change role, or modify account status.
 *       **Available Permissions**:
 *       - `manage_products`: Product approval and management
 *       - `manage_engineers`: Engineer verification and management
 *       - `manage_shops`: Shop verification and management
 *       - `manage_ads`: Advertisement creation and management
 *       - `manage_users`: User account management
 *       - `view_stats`: Dashboard and analytics access
 *       - `system_settings`: System configuration access
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: adminId
 *         in: path
 *         required: true
 *         description: Admin's unique ID to update
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: "64abc123def456789012345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, super_admin]
 *                 description: Update admin role
 *                 example: "admin"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [manage_products, manage_engineers, manage_shops, manage_ads, manage_users, view_stats, system_settings]
 *                 description: Set specific permissions
 *                 example: ["manage_products", "manage_engineers", "view_stats"]
 *               isActive:
 *                 type: boolean
 *                 description: Activate or deactivate admin account
 *                 example: true
 *               displayName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Update display name
 *                 example: "Senior Product Manager"
 *           examples:
 *             add_permissions:
 *               summary: Add more permissions
 *               value:
 *                 permissions: ["manage_products", "manage_engineers", "manage_shops", "view_stats"]
 *             promote_to_super_admin:
 *               summary: Promote to super admin
 *               value:
 *                 role: "super_admin"
 *                 displayName: "Assistant Super Admin"
 *             deactivate_admin:
 *               summary: Deactivate admin account
 *               value:
 *                 isActive: false
 *             restrict_permissions:
 *               summary: Restrict to specific permissions
 *               value:
 *                 permissions: ["manage_products"]
 *                 displayName: "Product Approval Specialist"
 *     responses:
 *       200:
 *         description: Admin permissions updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Admin permissions updated successfully"
 *                   data:
 *                     admin:
 *                       id: "64abc123def456789012345"
 *                       username: "product_admin"
 *                       role: "admin"
 *                       permissions: ["manage_products", "manage_engineers", "view_stats"]
 *                       displayName: "Senior Product Manager"
 *                       isActive: true
 *                       updatedAt: "2024-01-15T12:30:00.000Z"
 *                       updatedBy: "64abc123def456789012346"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Super admin access required or cannot modify super admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               access_denied:
 *                 value:
 *                   status: "fail"
 *                   message: "Super admin access required to modify admin permissions"
 *               cannot_modify_super:
 *                 value:
 *                   status: "fail"
 *                   message: "Cannot modify another super admin's permissions"
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/permissions/:adminId', validateObjectId('adminId'), adminAuthController.updateAdminPermissions);

/**
 * @swagger
 * /api/v1/admin-auth/{adminId}:
 *   delete:
 *     tags:
 *       - Admin Management (Super Admin)
 *     summary: Deactivate admin account (Super Admin only)
 *     description: |
 *       Deactivate an administrator account (soft delete).
 *       **Super Admin Access Required**: Only super administrators can deactivate admin accounts.
 *       **Soft Delete**: Account is deactivated but not permanently deleted for audit purposes.
 *       **Restrictions**: Cannot deactivate other super admin accounts or your own account.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: adminId
 *         in: path
 *         required: true
 *         description: Admin's unique ID to deactivate
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: "64abc123def456789012345"
 *     responses:
 *       200:
 *         description: Admin account deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Admin account deactivated successfully"
 *                   data:
 *                     adminId: "64abc123def456789012345"
 *                     username: "product_admin"
 *                     deactivatedAt: "2024-01-15T12:30:00.000Z"
 *                     deactivatedBy: "64abc123def456789012346"
 *                     reason: "Account deactivated by super admin"
 *       400:
 *         description: Cannot deactivate account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               cannot_deactivate_self:
 *                 value:
 *                   status: "fail"
 *                   message: "Cannot deactivate your own account"
 *               cannot_deactivate_super:
 *                 value:
 *                   status: "fail"
 *                   message: "Cannot deactivate another super admin account"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Super admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Super admin access required to deactivate admin accounts"
 *       404:
 *         description: Admin not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Admin account not found"
 */
router.delete('/:adminId', validateObjectId('adminId'), adminAuthController.deactivateAdmin);

module.exports = router;