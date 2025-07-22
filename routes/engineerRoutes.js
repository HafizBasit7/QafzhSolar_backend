const express = require('express');
const router = express.Router();
const engineerController = require('../controllers/engineerController');
const { authToken, isAdmin } = require('../middlewares/auth');
// middleware to check if user is admin

/**
 * @swagger
 * /api/v1/engineers/add:
 *   post:
 *     tags:
 *       - Engineers Management
 *     summary: Add new engineer (Admin only)
 *     description: |
 *       Add a new solar engineer to the system.
 *       **Admin Access Required**: Only administrators can add engineers.
 *       Engineers added through this endpoint will be available for users to contact for solar services.
 *       **Supported Services**: Install, Repair, Maintenance, Consultation, Design
 *       **Specializations**: Residential, Commercial, Industrial, Off-grid, On-grid, Hybrid
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
 *               - name
 *               - phone
 *               - services
 *               - governorate
 *               - city
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Engineer's full name
 *                 example: "Mohammad Hassan Al-Yamani"
 *               phone:
 *                 type: string
 *                 pattern: '^\\+[1-9]\\d{1,14}$'
 *                 description: Primary contact phone number (international format)
 *                 example: "+967777123456"
 *               whatsappPhone:
 *                 type: string
 *                 pattern: '^\\+[1-9]\\d{1,14}$'
 *                 description: WhatsApp contact number (international format)
 *                 example: "+967777123456"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Engineer's email address
 *                 example: "mohammad.hassan@email.com"
 *               services:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Install, Repair, Maintenance, Consultation, Design]
 *                 minItems: 1
 *                 description: Services offered by the engineer
 *                 example: ["Install", "Repair", "Maintenance"]
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Residential, Commercial, Industrial, Off-grid, On-grid, Hybrid]
 *                 description: Engineer's area of specialization
 *                 example: ["Residential", "Off-grid"]
 *               governorate:
 *                 type: string
 *                 description: Governorate/state where engineer operates
 *                 example: "Sana'a"
 *               city:
 *                 type: string
 *                 description: City where engineer is based
 *                 example: "Sanhan"
 *               address:
 *                 type: string
 *                 description: Full address or location details
 *                 example: "Al-Tahrir Street, Building 15, Office 3"
 *               experience:
 *                 type: object
 *                 properties:
 *                   years:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 50
 *                     description: Years of experience
 *                     example: 8
 *                   description:
 *                     type: string
 *                     description: Experience description
 *                     example: "8 years specializing in residential solar installations and maintenance"
 *               pricing:
 *                 type: object
 *                 properties:
 *                   hourlyRate:
 *                     type: number
 *                     minimum: 0
 *                     description: Hourly rate in local currency
 *                     example: 2000
 *                   currency:
 *                     type: string
 *                     enum: [YER, USD, SAR, EUR]
 *                     default: "YER"
 *                     description: Currency for pricing
 *                     example: "YER"
 *                   minimumCharge:
 *                     type: number
 *                     minimum: 0
 *                     description: Minimum charge for service call
 *                     example: 10000
 *               profileImageUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL to engineer's profile image
 *                 example: "https://example.com/profile.jpg"
 *               availability:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum: [Available, Busy, Unavailable]
 *                     default: "Available"
 *                     description: Current availability status
 *                     example: "Available"
 *                   notes:
 *                     type: string
 *                     description: Additional availability notes
 *                     example: "Available for emergency calls 24/7"
 *               isVerified:
 *                 type: boolean
 *                 default: false
 *                 description: Whether the engineer is verified by admin
 *                 example: true
 *           examples:
 *             residential_engineer:
 *               summary: Residential Solar Engineer
 *               value:
 *                 name: "Mohammad Hassan Al-Yamani"
 *                 phone: "+967777123456"
 *                 whatsappPhone: "+967777123456"
 *                 email: "mohammad.hassan@email.com"
 *                 services: ["Install", "Repair", "Maintenance"]
 *                 specializations: ["Residential", "Off-grid"]
 *                 governorate: "Sana'a"
 *                 city: "Sanhan"
 *                 address: "Al-Tahrir Street, Building 15"
 *                 experience:
 *                   years: 8
 *                   description: "8 years specializing in residential solar installations"
 *                 pricing:
 *                   hourlyRate: 2000
 *                   currency: "YER"
 *                   minimumCharge: 10000
 *                 availability:
 *                   status: "Available"
 *                 isVerified: true
 *             commercial_engineer:
 *               summary: Commercial Solar Engineer
 *               value:
 *                 name: "Ahmed Ali Al-Hadhrami"
 *                 phone: "+967711234567"
 *                 email: "ahmed.ali@solartech.com"
 *                 services: ["Install", "Design", "Consultation"]
 *                 specializations: ["Commercial", "Industrial", "On-grid"]
 *                 governorate: "Aden"
 *                 city: "Crater"
 *                 experience:
 *                   years: 12
 *                   description: "Specialized in large commercial solar installations"
 *                 pricing:
 *                   hourlyRate: 3500
 *                   currency: "YER"
 *                 isVerified: true
 *     responses:
 *       201:
 *         description: Engineer added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Engineer added successfully"
 *                   data:
 *                     engineer:
 *                       id: "64abc123def456789012345"
 *                       name: "Mohammad Hassan Al-Yamani"
 *                       phone: "+967777123456"
 *                       services: ["Install", "Repair", "Maintenance"]
 *                       governorate: "Sana'a"
 *                       city: "Sanhan"
 *                       isVerified: true
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/add', authToken, isAdmin, engineerController.addEngineer);

/**
 * @swagger
 * /api/v1/engineers/get:
 *   get:
 *     tags:
 *       - Engineers Management
 *     summary: Get all engineers (Admin only)
 *     description: |
 *       Retrieve a list of all engineers in the system with pagination and filtering options.
 *       **Admin Access Required**: Only administrators can view the complete engineers list.
 *       This endpoint provides detailed information for admin management purposes.
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
 *         description: Number of engineers per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *           example: 20
 *       - name: status
 *         in: query
 *         description: Filter by verification status
 *         schema:
 *           type: string
 *           enum: [verified, unverified, all]
 *           default: "all"
 *           example: "verified"
 *       - name: governorate
 *         in: query
 *         description: Filter by governorate
 *         schema:
 *           type: string
 *           example: "Sana'a"
 *       - name: services
 *         in: query
 *         description: Filter by services (comma-separated)
 *         schema:
 *           type: string
 *           example: "Install,Repair"
 *       - name: availability
 *         in: query
 *         description: Filter by availability status
 *         schema:
 *           type: string
 *           enum: [Available, Busy, Unavailable]
 *           example: "Available"
 *       - name: search
 *         in: query
 *         description: Search by name, phone, or email
 *         schema:
 *           type: string
 *           example: "Mohammad"
 *     responses:
 *       200:
 *         description: Engineers retrieved successfully
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
 *                   example: "Engineers retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     engineers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Engineer'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 45
 *                         verified:
 *                           type: number
 *                           example: 38
 *                         unverified:
 *                           type: number
 *                           example: 7
 *                         available:
 *                           type: number
 *                           example: 32
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Engineers retrieved successfully"
 *                   data:
 *                     engineers:
 *                       - id: "64abc123def456789012345"
 *                         name: "Mohammad Hassan"
 *                         phone: "+967777123456"
 *                         services: ["Install", "Repair"]
 *                         governorate: "Sana'a"
 *                         city: "Sanhan"
 *                         isVerified: true
 *                         availability:
 *                           status: "Available"
 *                         experience:
 *                           years: 8
 *                         rating:
 *                           average: 4.5
 *                           count: 23
 *                         views: 145
 *                         contactsCount: 32
 *                     pagination:
 *                       currentPage: 1
 *                       totalPages: 3
 *                       totalItems: 45
 *                       itemsPerPage: 20
 *                     summary:
 *                       total: 45
 *                       verified: 38
 *                       unverified: 7
 *                       available: 32
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/get', authToken, isAdmin, engineerController.getAllEngineers);

/**
 * @swagger
 * /api/v1/engineers/update/{id}:
 *   patch:
 *     tags:
 *       - Engineers Management
 *     summary: Update engineer information (Admin only)
 *     description: |
 *       Update an existing engineer's information.
 *       **Admin Access Required**: Only administrators can update engineer profiles.
 *       All fields are optional - only provided fields will be updated.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Engineer's unique ID
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
 *               name:
 *                 type: string
 *                 example: "Mohammad Hassan Al-Yamani (Updated)"
 *               phone:
 *                 type: string
 *                 pattern: '^\\+[1-9]\\d{1,14}$'
 *                 example: "+967777654321"
 *               whatsappPhone:
 *                 type: string
 *                 pattern: '^\\+[1-9]\\d{1,14}$'
 *                 example: "+967777654321"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "new.email@example.com"
 *               services:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Install, Repair, Maintenance, Consultation, Design]
 *                 example: ["Install", "Repair", "Maintenance", "Design"]
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Residential, Commercial, Industrial, Off-grid, On-grid, Hybrid]
 *                 example: ["Residential", "Commercial"]
 *               governorate:
 *                 type: string
 *                 example: "Hadramout"
 *               city:
 *                 type: string
 *                 example: "Mukalla"
 *               address:
 *                 type: string
 *                 example: "New Address, Building 20"
 *               experience:
 *                 type: object
 *                 properties:
 *                   years:
 *                     type: number
 *                     example: 10
 *                   description:
 *                     type: string
 *                     example: "10 years of experience in solar installations"
 *               pricing:
 *                 type: object
 *                 properties:
 *                   hourlyRate:
 *                     type: number
 *                     example: 2500
 *                   currency:
 *                     type: string
 *                     enum: [YER, USD, SAR, EUR]
 *                     example: "YER"
 *                   minimumCharge:
 *                     type: number
 *                     example: 12000
 *               availability:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum: [Available, Busy, Unavailable]
 *                     example: "Busy"
 *                   notes:
 *                     type: string
 *                     example: "Busy until next week"
 *               profileImageUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/new-profile.jpg"
 *           examples:
 *             partial_update:
 *               summary: Partial information update
 *               value:
 *                 services: ["Install", "Repair", "Maintenance", "Design"]
 *                 pricing:
 *                   hourlyRate: 2500
 *                   minimumCharge: 12000
 *                 availability:
 *                   status: "Available"
 *             location_update:
 *               summary: Location change
 *               value:
 *                 governorate: "Hadramout"
 *                 city: "Mukalla"
 *                 address: "New Address, Building 20"
 *     responses:
 *       200:
 *         description: Engineer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Engineer updated successfully"
 *                   data:
 *                     engineer:
 *                       id: "64abc123def456789012345"
 *                       name: "Mohammad Hassan Al-Yamani"
 *                       services: ["Install", "Repair", "Maintenance", "Design"]
 *                       pricing:
 *                         hourlyRate: 2500
 *                         minimumCharge: 12000
 *                       updatedAt: "2024-01-15T12:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/update/:id', authToken, isAdmin, engineerController.updateEngineer);

/**
 * @swagger
 * /api/v1/engineers/delete/{id}:
 *   delete:
 *     tags:
 *       - Engineers Management
 *     summary: Delete engineer (Admin only)
 *     description: |
 *       Permanently delete an engineer from the system.
 *       **Admin Access Required**: Only administrators can delete engineers.
 *       **⚠️ Warning**: This action cannot be undone and will remove all engineer data.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Engineer's unique ID to delete
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: "64abc123def456789012345"
 *     responses:
 *       200:
 *         description: Engineer deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Engineer deleted successfully"
 *                   data:
 *                     deletedEngineerId: "64abc123def456789012345"
 *                     deletedAt: "2024-01-15T12:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Engineer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Engineer not found with the provided ID"
 */
router.delete('/delete/:id', authToken, isAdmin, engineerController.deleteEngineer);

/**
 * @swagger
 * /api/v1/engineers/toggle-status/{id}:
 *   patch:
 *     tags:
 *       - Engineers Management
 *     summary: Toggle engineer verification status (Admin only)
 *     description: |
 *       Toggle the verification status of an engineer between verified and unverified.
 *       **Admin Access Required**: Only administrators can change verification status.
 *       Verified engineers appear in public listings, while unverified ones are hidden from users.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Engineer's unique ID
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: "64abc123def456789012345"
 *     responses:
 *       200:
 *         description: Engineer status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               verified:
 *                 summary: Engineer verified
 *                 value:
 *                   status: "success"
 *                   message: "Engineer status updated successfully"
 *                   data:
 *                     engineer:
 *                       id: "64abc123def456789012345"
 *                       name: "Mohammad Hassan"
 *                       isVerified: true
 *                       updatedAt: "2024-01-15T12:30:00.000Z"
 *               unverified:
 *                 summary: Engineer unverified
 *                 value:
 *                   status: "success"
 *                   message: "Engineer status updated successfully"
 *                   data:
 *                     engineer:
 *                       id: "64abc123def456789012345"
 *                       name: "Mohammad Hassan"
 *                       isVerified: false
 *                       updatedAt: "2024-01-15T12:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/toggle-status/:id', authToken, isAdmin, engineerController.toggleEngineerStatus);

module.exports = router;
