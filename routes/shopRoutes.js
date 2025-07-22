const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { authToken, isAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * /api/v1/shops/add:
 *   post:
 *     tags:
 *       - Shops Management
 *     summary: Add new solar shop (Admin only)
 *     description: |
 *       Add a new solar equipment shop to the system.
 *       **Admin Access Required**: Only administrators can add shops.
 *       Shops added through this endpoint will be available for users to browse and contact.
 *       **Services**: sale, install, repair, maintenance, consultation, warranty
 *       **Product Categories**: Inverter, Panel, Battery, Accessory, Cable, Controller, Monitor, Complete Systems
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
 *                 description: Shop name
 *                 example: "Solar Solutions Yemen"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Shop description and specialties
 *                 example: "Leading solar equipment supplier in Yemen with over 10 years of experience"
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
 *                 description: Shop email address
 *                 example: "info@solarsolutions.com"
 *               website:
 *                 type: string
 *                 format: uri
 *                 description: Shop website URL
 *                 example: "https://www.solarsolutions.com"
 *               governorate:
 *                 type: string
 *                 description: Governorate/state where shop is located
 *                 example: "Sana'a"
 *               city:
 *                 type: string
 *                 description: City where shop is based
 *                 example: "Sanhan"
 *               address:
 *                 type: string
 *                 description: Full shop address
 *                 example: "Al-Tahrir Street, Commercial Building 25, Ground Floor"
 *               services:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [sale, install, repair, maintenance, consultation, warranty]
 *                 minItems: 1
 *                 description: Services offered by the shop
 *                 example: ["sale", "install", "repair", "warranty"]
 *               productCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Inverter, Panel, Battery, Accessory, Cable, Controller, Monitor, Complete Systems]
 *                 description: Product categories sold by the shop
 *                 example: ["Panel", "Inverter", "Battery", "Complete Systems"]
 *               brands:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Brands carried by the shop
 *                 example: ["Canadian Solar", "Victron Energy", "Trojan Battery"]
 *               logoUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL to shop logo image
 *                 example: "https://example.com/shop-logo.jpg"
 *               operatingHours:
 *                 type: object
 *                 properties:
 *                   weekdays:
 *                     type: string
 *                     description: Weekday operating hours
 *                     example: "8:00 AM - 6:00 PM"
 *                   weekends:
 *                     type: string
 *                     description: Weekend operating hours
 *                     example: "9:00 AM - 4:00 PM"
 *                   holidays:
 *                     type: string
 *                     description: Holiday schedule
 *                     example: "Closed on public holidays"
 *               socialMedia:
 *                 type: object
 *                 properties:
 *                   facebook:
 *                     type: string
 *                     format: uri
 *                     example: "https://facebook.com/solarsolutions"
 *                   instagram:
 *                     type: string
 *                     format: uri
 *                     example: "https://instagram.com/solarsolutions"
 *                   twitter:
 *                     type: string
 *                     format: uri
 *                     example: "https://twitter.com/solarsolutions"
 *               isVerified:
 *                 type: boolean
 *                 default: false
 *                 description: Whether the shop is verified by admin
 *                 example: true
 *           examples:
 *             solar_shop:
 *               summary: Complete Solar Shop
 *               value:
 *                 name: "Solar Solutions Yemen"
 *                 description: "Leading solar equipment supplier with comprehensive installation services"
 *                 phone: "+967777123456"
 *                 whatsappPhone: "+967777123456"
 *                 email: "info@solarsolutions.com"
 *                 website: "https://www.solarsolutions.com"
 *                 governorate: "Sana'a"
 *                 city: "Sanhan"
 *                 address: "Al-Tahrir Street, Commercial Building 25"
 *                 services: ["sale", "install", "repair", "warranty"]
 *                 productCategories: ["Panel", "Inverter", "Battery", "Complete Systems"]
 *                 brands: ["Canadian Solar", "Victron Energy", "Trojan Battery"]
 *                 operatingHours:
 *                   weekdays: "8:00 AM - 6:00 PM"
 *                   weekends: "9:00 AM - 4:00 PM"
 *                 isVerified: true
 *             basic_shop:
 *               summary: Basic Shop Information
 *               value:
 *                 name: "Green Energy Store"
 *                 phone: "+967711234567"
 *                 governorate: "Aden"
 *                 city: "Crater"
 *                 address: "Main Street, Building 10"
 *                 services: ["sale", "consultation"]
 *                 productCategories: ["Panel", "Accessory"]
 *                 isVerified: false
 *     responses:
 *       201:
 *         description: Shop added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Shop added successfully"
 *                   data:
 *                     shop:
 *                       id: "64abc123def456789012345"
 *                       name: "Solar Solutions Yemen"
 *                       phone: "+967777123456"
 *                       services: ["sale", "install", "repair", "warranty"]
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
router.post('/add', authToken, isAdmin, shopController.addShop);

/**
 * @swagger
 * /api/v1/shops/getAll:
 *   get:
 *     tags:
 *       - Shops Management
 *     summary: Get all shops (Admin only)
 *     description: |
 *       Retrieve a comprehensive list of all shops in the system.
 *       **Admin Access Required**: Only administrators can view the complete shops list.
 *       This endpoint provides detailed information for admin management purposes including statistics.
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
 *         description: Number of shops per page
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
 *           example: "sale,install"
 *       - name: productCategories
 *         in: query
 *         description: Filter by product categories (comma-separated)
 *         schema:
 *           type: string
 *           example: "Panel,Inverter"
 *       - name: brands
 *         in: query
 *         description: Filter by brands (comma-separated)
 *         schema:
 *           type: string
 *           example: "Canadian Solar,Victron"
 *       - name: search
 *         in: query
 *         description: Search by shop name, phone, or email
 *         schema:
 *           type: string
 *           example: "Solar Solutions"
 *       - name: sortBy
 *         in: query
 *         description: Sort field
 *         schema:
 *           type: string
 *           enum: [name, createdAt, rating, views]
 *           default: "createdAt"
 *           example: "rating"
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
 *         description: Shops retrieved successfully
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
 *                   example: "Shops retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     shops:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Shop'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 28
 *                         verified:
 *                           type: number
 *                           example: 23
 *                         unverified:
 *                           type: number
 *                           example: 5
 *                         avgRating:
 *                           type: number
 *                           example: 4.2
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Shops retrieved successfully"
 *                   data:
 *                     shops:
 *                       - id: "64abc123def456789012345"
 *                         name: "Solar Solutions Yemen"
 *                         phone: "+967777123456"
 *                         email: "info@solarsolutions.com"
 *                         services: ["sale", "install", "repair"]
 *                         productCategories: ["Panel", "Inverter", "Battery"]
 *                         governorate: "Sana'a"
 *                         city: "Sanhan"
 *                         isVerified: true
 *                         rating:
 *                           average: 4.5
 *                           count: 35
 *                         views: 1245
 *                         createdAt: "2024-01-15T10:30:00.000Z"
 *                     pagination:
 *                       currentPage: 1
 *                       totalPages: 2
 *                       totalItems: 28
 *                       itemsPerPage: 20
 *                     summary:
 *                       total: 28
 *                       verified: 23
 *                       unverified: 5
 *                       avgRating: 4.2
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/getAll', authToken, isAdmin, shopController.getAllShops);

/**
 * @swagger
 * /api/v1/shops/update/{id}:
 *   patch:
 *     tags:
 *       - Shops Management
 *     summary: Update shop information (Admin only)
 *     description: |
 *       Update an existing shop's information.
 *       **Admin Access Required**: Only administrators can update shop profiles.
 *       All fields are optional - only provided fields will be updated.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Shop's unique ID
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
 *                 example: "Solar Solutions Yemen - Updated"
 *               description:
 *                 type: string
 *                 example: "Updated description with new services and capabilities"
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
 *                 example: "updated@solarsolutions.com"
 *               website:
 *                 type: string
 *                 format: uri
 *                 example: "https://www.updated-solarsolutions.com"
 *               governorate:
 *                 type: string
 *                 example: "Hadramout"
 *               city:
 *                 type: string
 *                 example: "Mukalla"
 *               address:
 *                 type: string
 *                 example: "New Location, Building 30, First Floor"
 *               services:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [sale, install, repair, maintenance, consultation, warranty]
 *                 example: ["sale", "install", "repair", "maintenance", "warranty"]
 *               productCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Inverter, Panel, Battery, Accessory, Cable, Controller, Monitor, Complete Systems]
 *                 example: ["Panel", "Inverter", "Battery", "Complete Systems", "Monitor"]
 *               brands:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Canadian Solar", "Victron Energy", "Trojan Battery", "Schneider Electric"]
 *               logoUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/updated-logo.jpg"
 *               operatingHours:
 *                 type: object
 *                 properties:
 *                   weekdays:
 *                     type: string
 *                     example: "8:00 AM - 7:00 PM"
 *                   weekends:
 *                     type: string
 *                     example: "9:00 AM - 5:00 PM"
 *               socialMedia:
 *                 type: object
 *                 properties:
 *                   facebook:
 *                     type: string
 *                     format: uri
 *                     example: "https://facebook.com/updated-solarsolutions"
 *           examples:
 *             service_expansion:
 *               summary: Expand services and products
 *               value:
 *                 services: ["sale", "install", "repair", "maintenance", "warranty"]
 *                 productCategories: ["Panel", "Inverter", "Battery", "Complete Systems", "Monitor"]
 *                 brands: ["Canadian Solar", "Victron Energy", "Trojan Battery", "Schneider Electric"]
 *             location_change:
 *               summary: Update location
 *               value:
 *                 governorate: "Hadramout"
 *                 city: "Mukalla"
 *                 address: "New Location, Building 30, First Floor"
 *                 operatingHours:
 *                   weekdays: "8:00 AM - 7:00 PM"
 *                   weekends: "9:00 AM - 5:00 PM"
 *     responses:
 *       200:
 *         description: Shop updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Shop updated successfully"
 *                   data:
 *                     shop:
 *                       id: "64abc123def456789012345"
 *                       name: "Solar Solutions Yemen - Updated"
 *                       services: ["sale", "install", "repair", "maintenance", "warranty"]
 *                       productCategories: ["Panel", "Inverter", "Battery", "Complete Systems"]
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
router.patch('/update/:id', authToken, isAdmin, shopController.updateShop);

/**
 * @swagger
 * /api/v1/shops/delete/{id}:
 *   delete:
 *     tags:
 *       - Shops Management
 *     summary: Delete shop (Admin only)
 *     description: |
 *       Permanently delete a shop from the system.
 *       **Admin Access Required**: Only administrators can delete shops.
 *       **⚠️ Warning**: This action cannot be undone and will remove all shop data and history.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Shop's unique ID to delete
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: "64abc123def456789012345"
 *     responses:
 *       200:
 *         description: Shop deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Shop deleted successfully"
 *                   data:
 *                     deletedShopId: "64abc123def456789012345"
 *                     shopName: "Solar Solutions Yemen"
 *                     deletedAt: "2024-01-15T12:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Shop not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Shop not found with the provided ID"
 */
router.delete('/delete/:id', authToken, isAdmin, shopController.deleteShop);

/**
 * @swagger
 * /api/v1/shops/toggle-status/{id}:
 *   patch:
 *     tags:
 *       - Shops Management
 *     summary: Toggle shop verification status (Admin only)
 *     description: |
 *       Toggle the verification status of a shop between verified and unverified.
 *       **Admin Access Required**: Only administrators can change verification status.
 *       Verified shops appear in public listings and have higher visibility, while unverified ones are hidden from users.
 *       **Impact of Verification:**
 *       - **Verified**: Shop appears in public listings, higher search ranking, trust badge displayed
 *       - **Unverified**: Hidden from public view, only visible to admins for review
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Shop's unique ID
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: "64abc123def456789012345"
 *     responses:
 *       200:
 *         description: Shop status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               verified:
 *                 summary: Shop verified
 *                 value:
 *                   status: "success"
 *                   message: "Shop verification status updated successfully"
 *                   data:
 *                     shop:
 *                       id: "64abc123def456789012345"
 *                       name: "Solar Solutions Yemen"
 *                       isVerified: true
 *                       updatedAt: "2024-01-15T12:30:00.000Z"
 *                     statusChange: "verified"
 *                     publicVisibility: true
 *               unverified:
 *                 summary: Shop unverified
 *                 value:
 *                   status: "success"
 *                   message: "Shop verification status updated successfully"
 *                   data:
 *                     shop:
 *                       id: "64abc123def456789012345"
 *                       name: "Solar Solutions Yemen"
 *                       isVerified: false
 *                       updatedAt: "2024-01-15T12:30:00.000Z"
 *                     statusChange: "unverified"
 *                     publicVisibility: false
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/toggle-status/:id', authToken, isAdmin, shopController.toggleShopStatus);

module.exports = router;
