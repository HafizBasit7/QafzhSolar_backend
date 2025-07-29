// routes/auth.js
const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/authController');

// Import middleware
const { authToken, isVerified, authRateLimit } = require('../middlewares/auth');
const { 
  validateUserRegistration, 
  validateOTPVerification,
  validateUserProfileUpdate
} = require('../middlewares/validation');

// Rate limiting for auth endpoints
const authLimiter = authRateLimit(15 * 60 * 1000, 60); // 5 attempts per 15 minutes

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: |
 *       Register a new user with phone number. This will send an OTP to the provided phone number.
 *       The phone number must be in international format (+967XXXXXXXXX for Yemen).
 *       Rate limited to 5 attempts per 15 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *           examples:
 *             yemeni_number:
 *               summary: Yemeni phone number
 *               value:
 *                 phone: "+967777123456"
 *             international_number:
 *               summary: International format
 *               value:
 *                 phone: "+1234567890"
 *     responses:
 *       201:
 *         description: Registration successful, OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Registration successful. OTP sent to your phone."
 *                   data:
 *                     phone: "+967777123456"
 *                     otpSent: true
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Phone number already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Phone number already exists"
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/register', authLimiter, validateUserRegistration, authController.registerUser);

/**
 * @swagger
 * /api/v1/auth/verify-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify OTP and complete registration
 *     description: |
 *       Verify the OTP sent to user's phone number to complete the registration process.
 *       Upon successful verification, user will be logged in and receive JWT tokens.
 *       Rate limited to 5 attempts per 15 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPVerification'
 *           examples:
 *             verification:
 *               summary: OTP verification
 *               value:
 *                 phone: "+967777123456"
 *                 otp: "112233"
 *     responses:
 *       200:
 *         description: OTP verified successfully, user logged in
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
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Login successful"
 *                   data:
 *                     user:
 *                       id: "64abc123def456789012345"
 *                       phone: "+967777123456"
 *                       name: null
 *                       profileImageUrl: null
 *                       role: "user"
 *                       isVerified: true
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid OTP or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_otp:
 *                 value:
 *                   status: "fail"
 *                   message: "Invalid or expired OTP"
 *               validation_error:
 *                 value:
 *                   status: "fail"
 *                   message: "Phone number and OTP are required"
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/verify-otp/:phone', authLimiter, validateOTPVerification, authController.verifyOTP);

/**
 * @swagger
 * /api/v1/auth/request-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request new OTP
 *     description: |
 *       Request a new OTP for an existing registered phone number.
 *       This can be used if the previous OTP expired or was not received.
 *       Rate limited to 5 attempts per 15 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *           examples:
 *             request_new_otp:
 *               summary: Request new OTP
 *               value:
 *                 phone: "+967777123456"
 *     responses:
 *       200:
 *         description: New OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "New OTP sent to your phone"
 *                   data:
 *                     phone: "+967777123456"
 *                     otpSent: true
 *       404:
 *         description: Phone number not registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Phone number not found. Please register first."
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/request-otp', authLimiter, validateUserRegistration, authController.requestOTP);

/**
 * @swagger
 * /api/v1/auth/check-phone:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Check if phone number exists
 *     description: |
 *       Check if a phone number is already registered in the system.
 *       This is useful for frontend validation before registration.
 *     parameters:
 *       - name: phone
 *         in: query
 *         required: true
 *         description: Phone number to check (international format)
 *         schema:
 *           type: string
 *           example: "+967777123456"
 *     responses:
 *       200:
 *         description: Phone number status check result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               exists:
 *                 summary: Phone exists
 *                 value:
 *                   status: "success"
 *                   message: "Phone number found"
 *                   data:
 *                     exists: true
 *                     phone: "+967777123456"
 *               not_exists:
 *                 summary: Phone doesn't exist
 *                 value:
 *                   status: "success"
 *                   message: "Phone number available"
 *                   data:
 *                     exists: false
 *                     phone: "+967777123456"
 *       400:
 *         description: Invalid phone number format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Invalid phone number format"
 */
router.get('/check-phone', authController.checkPhone);
router.post('/login', authController.login); // Removed rate limiter

// Protected routes (require authentication)
router.use(authToken); // All routes below require authentication

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     tags:
 *       - User Profile
 *     summary: Get user profile
 *     description: |
 *       Get the authenticated user's profile information.
 *       Requires valid JWT token in Authorization header or cookie.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               complete_profile:
 *                 summary: Complete user profile
 *                 value:
 *                   status: "success"
 *                   message: "Profile retrieved successfully"
 *                   data:
 *                     user:
 *                       id: "64abc123def456789012345"
 *                       phone: "+967777123456"
 *                       name: "Ahmed Ali"
 *                       profileImageUrl: "https://example.com/profile.jpg"
 *                       role: "user"
 *                       isVerified: true
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *               minimal_profile:
 *                 summary: Minimal user profile
 *                 value:
 *                   status: "success"
 *                   message: "Profile retrieved successfully"
 *                   data:
 *                     user:
 *                       id: "64abc123def456789012345"
 *                       phone: "+967777123456"
 *                       name: null
 *                       profileImageUrl: null
 *                       role: "user"
 *                       isVerified: true
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/profile', authController.getProfile);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   put:
 *     tags:
 *       - User Profile
 *     summary: Update user profile
 *     description: |
 *       Update the authenticated user's profile information.
 *       Only name and profile image URL can be updated.
 *       Requires valid JWT token in Authorization header or cookie.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfileUpdate'
 *           examples:
 *             update_name:
 *               summary: Update name only
 *               value:
 *                 name: "Ahmed Ali Al-Yamani"
 *             update_image:
 *               summary: Update profile image only
 *               value:
 *                 profileImageUrl: "https://example.com/new-profile.jpg"
 *             update_both:
 *               summary: Update name and image
 *               value:
 *                 name: "Ahmed Ali Al-Yamani"
 *                 profileImageUrl: "https://example.com/new-profile.jpg"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Profile updated successfully"
 *                   data:
 *                     user:
 *                       id: "64abc123def456789012345"
 *                       phone: "+967777123456"
 *                       name: "Ahmed Ali Al-Yamani"
 *                       profileImageUrl: "https://example.com/new-profile.jpg"
 *                       role: "user"
 *                       isVerified: true
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/update-profile', authToken, validateUserProfileUpdate, authController.updateProfile);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     description: |
 *       Logout the authenticated user by clearing the JWT cookie.
 *       The user will need to login again to access protected routes.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
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
 *                   message: "Logged out successfully"
 *                   data: null
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout', authController.logout);

// Routes that require verified phone
router.use(isVerified); // All routes below require verified phone

/**
 * @swagger
 * /api/v1/auth/account:
 *   delete:
 *     tags:
 *       - User Account
 *     summary: Delete user account
 *     description: |
 *       Permanently delete the authenticated user's account and all associated data.
 *       This action cannot be undone. User must be verified to delete account.
 *       **⚠️ Warning: This will permanently delete all user data including:**
 *       - User profile
 *       - Posted products
 *       - Account history
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
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
 *                   message: "Account deleted successfully"
 *                   data: null
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Account not verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Please verify your phone number before deleting account"
 */
router.delete('/account', authController.deleteAccount);

module.exports = router;