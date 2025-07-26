const express = require("express");
const router = express.Router();

const { checkUserVerified } = require('../middlewares/checkUserVerified')
const productController = require('../controllers/productController')

/**
 * @swagger
 * /api/v1/products/post:
 *   post:
 *     tags:
 *       - Products
 *     summary: Post a new product listing
 *     description: |
 *       Create a new product listing in the marketplace.
 *       This endpoint allows verified users to post products for sale.
 *       **Required:** User must be verified (phone number verified).
 *       **Image Handling:** Provide image URLs directly in the request body (no file upload).
 *       **Image Requirements:**
 *       - Provide up to 10 image URLs per product
 *       - Images should be hosted externally (CDN, cloud storage, etc.)
 *       - Supported formats: JPEG, PNG, GIF, WebP
 *       - Recommended resolution: minimum 800x600px
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
 *               - type
 *               - condition
 *               - price
 *               - phone
 *               - governorate
 *               - city
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 description: Product name
 *                 example: "200W Monocrystalline Solar Panel"
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Detailed product description
 *                 example: "High efficiency solar panel with 25-year warranty. Perfect for residential installations. Includes mounting hardware and cables."
 *               type:
 *                 type: string
 *                 enum: [Inverter, Panel, Battery, Accessory, Cable, Controller, Monitor, Other]
 *                 description: Product category type
 *                 example: "Panel"
 *               condition:
 *                 type: string
 *                 enum: [New, Used, Needs Repair, Refurbished]
 *                 description: Product condition
 *                 example: "New"
 *               brand:
 *                 type: string
 *                 maxLength: 100
 *                 description: Product brand/manufacturer
 *                 example: "Canadian Solar"
 *               model:
 *                 type: string
 *                 maxLength: 100
 *                 description: Product model number
 *                 example: "CS3U-370MS"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Product price (in selected currency)
 *                 example: 25000
 *               currency:
 *                 type: string
 *                 enum: [YER, USD, SAR, EUR]
 *                 description: Price currency
 *                 default: "YER"
 *                 example: "YER"
 *               phone:
 *                 type: string
 *                 pattern: '^\\+[1-9]\\d{1,14}$'
 *                 description: Contact phone number (international format)
 *                 example: "+967777123456"
 *               whatsappPhone:
 *                 type: string
 *                 pattern: '^\\+[1-9]\\d{1,14}$'
 *                 description: WhatsApp contact number (international format)
 *                 example: "+967777123456"
 *               governorate:
 *                 type: string
 *                 description: Governorate/state location
 *                 example: "Sana'a"
 *               city:
 *                 type: string
 *                 description: City location
 *                 example: "Sanhan"
 *               locationText:
 *                 type: string
 *                 maxLength: 500
 *                 description: Additional location description
 *                 example: "Near Al-Noor Mosque, behind the pharmacy"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 minItems: 1
 *                 maxItems: 10
 *                 description: Array of product image URLs (hosted externally, up to 10 images)
 *                 example: [
 *                   "https://example.com/images/panel-front.jpg",
 *                   "https://example.com/images/panel-back.jpg",
 *                   "https://example.com/images/panel-specs.jpg"
 *                 ]
 *               specifications:
 *                 type: object
 *                 description: Product technical specifications
 *                 properties:
 *                   power:
 *                     type: string
 *                     example: "200W"
 *                   voltage:
 *                     type: string
 *                     example: "24V"
 *                   efficiency:
 *                     type: string
 *                     example: "20.1%"
 *                   warranty:
 *                     type: string
 *                     example: "25 years"
 *                   dimensions:
 *                     type: string
 *                     example: "1650x990x35mm"
 *                   weight:
 *                     type: string
 *                     example: "18.5kg"
 *                 example:
 *                   power: "200W"
 *                   voltage: "24V"
 *                   efficiency: "20.1%"
 *                   warranty: "25 years"
 *                   dimensions: "1650x990x35mm"
 *                   weight: "18.5kg"
 *               isNegotiable:
 *                 type: boolean
 *                 description: Whether the price is negotiable
 *                 default: true
 *                 example: true
 *           examples:
 *             solar_panel:
 *               summary: Solar Panel Listing
 *               value:
 *                 name: "200W Monocrystalline Solar Panel"
 *                 description: "High efficiency solar panel with 25-year warranty. Perfect for residential installations."
 *                 type: "Panel"
 *                 condition: "New"
 *                 brand: "Canadian Solar"
 *                 model: "CS3U-200MS"
 *                 price: 25000
 *                 currency: "YER"
 *                 phone: "+967777123456"
 *                 whatsappPhone: "+967777123456"
 *                 governorate: "Sana'a"
 *                 city: "Sanhan"
 *                 locationText: "Near Al-Noor Mosque"
 *                 images: [
 *                   "https://example.com/images/panel-front.jpg",
 *                   "https://example.com/images/panel-back.jpg",
 *                   "https://example.com/images/panel-specs.jpg"
 *                 ]
 *                 specifications:
 *                   power: "200W"
 *                   voltage: "24V"
 *                   efficiency: "20.1%"
 *                   warranty: "25 years"
 *                 isNegotiable: true
 *             battery_listing:
 *               summary: Battery Listing
 *               value:
 *                 name: "Deep Cycle Solar Battery 200Ah"
 *                 description: "High quality gel battery for solar systems. Maintenance-free design with excellent cycle life."
 *                 type: "Battery"
 *                 condition: "New"
 *                 brand: "Trojan"
 *                 model: "T-105"
 *                 price: 45000
 *                 currency: "YER"
 *                 phone: "+967771234567"
 *                 governorate: "Aden"
 *                 city: "Crater"
 *                 images: [
 *                   "https://example.com/images/battery-main.jpg",
 *                   "https://example.com/images/battery-label.jpg"
 *                 ]
 *                 specifications:
 *                   capacity: "200Ah"
 *                   voltage: "12V"
 *                   type: "Gel"
 *                   lifespan: "10-15 years"
 *                 isNegotiable: false
 *             inverter_listing:
 *               summary: Inverter Listing
 *               value:
 *                 name: "Pure Sine Wave Inverter 2000W"
 *                 description: "High quality pure sine wave inverter with built-in battery charger and transfer switch."
 *                 type: "Inverter"
 *                 condition: "Used"
 *                 brand: "Victron Energy"
 *                 model: "Phoenix 24/2000"
 *                 price: 85000
 *                 currency: "YER"
 *                 phone: "+967789123456"
 *                 governorate: "Hadramout"
 *                 city: "Mukalla"
 *                 images: [
 *                   "https://example.com/images/inverter-front.jpg",
 *                   "https://example.com/images/inverter-connections.jpg",
 *                   "https://example.com/images/inverter-display.jpg"
 *                 ]
 *                 specifications:
 *                   power: "2000W"
 *                   inputVoltage: "24V DC"
 *                   outputVoltage: "230V AC"
 *                   waveform: "Pure Sine Wave"
 *                 isNegotiable: true
 *     responses:
 *       201:
 *         description: Product posted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Product posted successfully"
 *                   data:
 *                     product:
 *                       id: "64abc123def456789012345"
 *                       name: "200W Monocrystalline Solar Panel"
 *                       type: "Panel"
 *                       condition: "New"
 *                       price: 25000
 *                       currency: "YER"
 *                       status: "pending"
 *                       images: [
 *                         "https://example.com/images/panel-front.jpg",
 *                         "https://example.com/images/panel-back.jpg"
 *                       ]
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       expiresAt: "2024-02-14T10:30:00.000Z"
 *       400:
 *         description: Validation error or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 value:
 *                   status: "fail"
 *                   message: "Name, type, condition, price, phone, governorate, and city are required"
 *               invalid_images:
 *                 value:
 *                   status: "fail"
 *                   message: "At least one image URL is required, maximum 10 images allowed"
 *               invalid_url:
 *                 value:
 *                   status: "fail"
 *                   message: "Invalid image URL format in images array"
 *               invalid_phone:
 *                 value:
 *                   status: "fail"
 *                   message: "Phone number must be in international format (+967XXXXXXXXX)"
 *               invalid_price:
 *                 value:
 *                   status: "fail"
 *                   message: "Price must be a positive number"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Please verify your phone number before posting products"
 *       413:
 *         description: Request too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Request payload too large. Reduce number of images or description length."
 */
router.post('/post', checkUserVerified, productController.postProduct);

/**
 * @swagger
 * /api/v1/products/verfiry-otp-postProduct:
 *   post:
 *     tags:
 *       - Products
 *     summary: Verify OTP and post product (for unverified users)
 *     description: |
 *       This endpoint allows unverified users to post a product by verifying OTP first.
 *       The process:
 *       1. User attempts to post product without verification
 *       2. OTP is sent to their phone
 *       3. User calls this endpoint with OTP and product data
 *       4. If OTP is valid, user is verified and product is posted
 *       
 *       **Note:** This is an alternative flow for users who haven't completed phone verification yet.
 *       **Image Handling:** Provide image URLs directly in the request body (no file upload).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - phone
 *               - name
 *               - type
 *               - condition
 *               - price
 *               - governorate
 *               - city
 *             properties:
 *               otp:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 description: 6-digit OTP code sent to phone
 *                 example: "123456"
 *               phone:
 *                 type: string
 *                 pattern: '^\\+[1-9]\\d{1,14}$'
 *                 description: Phone number that received the OTP
 *                 example: "+967777123456"
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 description: Product name
 *                 example: "100W Solar Panel"
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Product description
 *                 example: "Well maintained solar panel, works perfectly. Used for 2 years."
 *               type:
 *                 type: string
 *                 enum: [Inverter, Panel, Battery, Accessory, Cable, Controller, Monitor, Other]
 *                 example: "Panel"
 *               condition:
 *                 type: string
 *                 enum: [New, Used, Needs Repair, Refurbished]
 *                 example: "Used"
 *               brand:
 *                 type: string
 *                 maxLength: 100
 *                 description: Product brand
 *                 example: "Jinko Solar"
 *               model:
 *                 type: string
 *                 maxLength: 100
 *                 description: Product model
 *                 example: "JKM100M"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 15000
 *               currency:
 *                 type: string
 *                 enum: [YER, USD, SAR, EUR]
 *                 default: "YER"
 *                 example: "YER"
 *               governorate:
 *                 type: string
 *                 example: "Sana'a"
 *               city:
 *                 type: string
 *                 example: "Sanhan"
 *               locationText:
 *                 type: string
 *                 maxLength: 500
 *                 description: Additional location details
 *                 example: "Near the central market"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 minItems: 1
 *                 maxItems: 10
 *                 description: Array of product image URLs
 *                 example: [
 *                   "https://example.com/images/used-panel.jpg",
 *                   "https://example.com/images/panel-condition.jpg"
 *                 ]
 *               specifications:
 *                 type: object
 *                 description: Technical specifications
 *                 example:
 *                   power: "100W"
 *                   voltage: "12V"
 *                   efficiency: "18.5%"
 *               isNegotiable:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *           examples:
 *             otp_verification_post:
 *               summary: OTP verification with product posting
 *               value:
 *                 otp: "123456"
 *                 phone: "+967777123456"
 *                 name: "100W Solar Panel - Used"
 *                 description: "Well maintained solar panel, works perfectly"
 *                 type: "Panel"
 *                 condition: "Used"
 *                 brand: "Jinko Solar"
 *                 price: 15000
 *                 currency: "YER"
 *                 governorate: "Sana'a"
 *                 city: "Sanhan"
 *                 images: [
 *                   "https://example.com/images/used-panel.jpg",
 *                   "https://example.com/images/panel-condition.jpg"
 *                 ]
 *                 specifications:
 *                   power: "100W"
 *                   voltage: "12V"
 *                   efficiency: "18.5%"
 *                 isNegotiable: true
 *     responses:
 *       201:
 *         description: OTP verified and product posted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Phone verified and product posted successfully"
 *                   data:
 *                     userVerified: true
 *                     product:
 *                       id: "64abc123def456789012345"
 *                       name: "100W Solar Panel - Used"
 *                       status: "pending"
 *                       images: [
 *                         "https://example.com/images/used-panel.jpg"
 *                       ]
 *                       createdAt: "2024-01-15T10:30:00.000Z"
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
 *                   message: "Missing required fields: name, type, condition"
 *               invalid_images:
 *                 value:
 *                   status: "fail"
 *                   message: "At least one valid image URL is required"
 */
router.post('/verfiry-otp', productController.verifyOtp)

/**
 * @swagger
 * /api/v1/products/browse-products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Browse all approved products
 *     description: |
 *       Get a paginated list of all approved products in the marketplace.
 *       This endpoint shows only products that have been approved by admins.
 *       Supports filtering, sorting, and pagination.
 *       **Public endpoint** - No authentication required.
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
 *         description: Number of products per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *           example: 20
 *       - name: type
 *         in: query
 *         description: Filter by product type
 *         schema:
 *           type: string
 *           enum: [Inverter, Panel, Battery, Accessory, Cable, Controller, Monitor, Other]
 *           example: "Panel"
 *       - name: condition
 *         in: query
 *         description: Filter by product condition
 *         schema:
 *           type: string
 *           enum: [New, Used, Needs Repair, Refurbished]
 *           example: "New"
 *       - name: governorate
 *         in: query
 *         description: Filter by governorate/state
 *         schema:
 *           type: string
 *           example: "Sana'a"
 *       - name: city
 *         in: query
 *         description: Filter by city
 *         schema:
 *           type: string
 *           example: "Sanhan"
 *       - name: minPrice
 *         in: query
 *         description: Minimum price filter
 *         schema:
 *           type: number
 *           minimum: 0
 *           example: 10000
 *       - name: maxPrice
 *         in: query
 *         description: Maximum price filter
 *         schema:
 *           type: number
 *           minimum: 0
 *           example: 50000
 *       - name: currency
 *         in: query
 *         description: Filter by currency
 *         schema:
 *           type: string
 *           enum: [YER, USD, SAR, EUR]
 *           example: "YER"
 *       - name: brand
 *         in: query
 *         description: Filter by brand name (case insensitive)
 *         schema:
 *           type: string
 *           example: "Canadian Solar"
 *       - name: sortBy
 *         in: query
 *         description: Sort field
 *         schema:
 *           type: string
 *           enum: [createdAt, price, name, views]
 *           default: "createdAt"
 *           example: "price"
 *       - name: sortOrder
 *         in: query
 *         description: Sort order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *           example: "asc"
 *       - name: featured
 *         in: query
 *         description: Show only featured products
 *         schema:
 *           type: boolean
 *           example: true
 *       - name: negotiable
 *         in: query
 *         description: Filter by negotiable price
 *         schema:
 *           type: boolean
 *           example: true
 *       - name: search
 *         in: query
 *         description: Search by product name, description, or brand
 *         schema:
 *           type: string
 *           example: "solar panel"
 *     responses:
 *       200:
 *         description: Products retrieved successfully
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
 *                   example: "Products retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *                     filters:
 *                       type: object
 *                       description: Applied filters summary
 *                       properties:
 *                         type:
 *                           type: string
 *                         condition:
 *                           type: string
 *                         priceRange:
 *                           type: object
 *                           properties:
 *                             min:
 *                               type: number
 *                             max:
 *                               type: number
 *                             currency:
 *                               type: string
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Products retrieved successfully"
 *                   data:
 *                     products:
 *                       - id: "64abc123def456789012345"
 *                         name: "200W Solar Panel"
 *                         type: "Panel"
 *                         condition: "New"
 *                         brand: "Canadian Solar"
 *                         price: 25000
 *                         currency: "YER"
 *                         governorate: "Sana'a"
 *                         city: "Sanhan"
 *                         images: [
 *                           "https://example.com/images/panel1.jpg",
 *                           "https://example.com/images/panel2.jpg"
 *                         ]
 *                         isNegotiable: true
 *                         featured: false
 *                         views: 45
 *                         createdAt: "2024-01-15T10:30:00.000Z"
 *                       - id: "64abc123def456789012346"
 *                         name: "1000W Inverter"
 *                         type: "Inverter"
 *                         condition: "Used"
 *                         brand: "Victron"
 *                         price: 35000
 *                         currency: "YER"
 *                         governorate: "Aden"
 *                         city: "Crater"
 *                         images: [
 *                           "https://example.com/images/inverter1.jpg"
 *                         ]
 *                         isNegotiable: false
 *                         featured: true
 *                         views: 120
 *                         createdAt: "2024-01-14T15:20:00.000Z"
 *                     pagination:
 *                       currentPage: 1
 *                       totalPages: 5
 *                       totalItems: 95
 *                       itemsPerPage: 20
 *                     filters:
 *                       type: "Panel"
 *                       condition: "New"
 *                       priceRange:
 *                         min: 10000
 *                         max: 50000
 *                         currency: "YER"
 *               empty_results:
 *                 value:
 *                   status: "success"
 *                   message: "No products found matching the criteria"
 *                   data:
 *                     products: []
 *                     pagination:
 *                       currentPage: 1
 *                       totalPages: 0
 *                       totalItems: 0
 *                       itemsPerPage: 20
 *                     filters:
 *                       type: "Panel"
 *                       condition: "New"
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_params:
 *                 value:
 *                   status: "fail"
 *                   message: "Invalid price range: minPrice cannot be greater than maxPrice"
 *               invalid_pagination:
 *                 value:
 *                   status: "fail"
 *                   message: "Invalid page number. Page must be a positive integer"
 *               invalid_sort:
 *                 value:
 *                   status: "fail"
 *                   message: "Invalid sortBy field. Must be one of: createdAt, price, name, views"
 */
router.get('/browse-products', productController.browseProducts);

router.get('/user-products/:userId', productController.getUserProducts); // Add this

// update product

router.patch('/update-product/:id', productController.updateProduct);

// delete product

router.delete('/delete-product/:id', productController.deleteProduct);

module.exports = router;