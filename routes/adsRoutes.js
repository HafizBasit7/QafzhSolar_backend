const express = require('express');
const router = express.Router();

const adsController = require('../controllers/adsController');
const { authToken, isAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * /api/v1/ads/postads:
 *   post:
 *     tags:
 *       - Advertisement Management
 *     summary: Create advertisement (Admin only)
 *     description: |
 *       Create a new advertisement for display in the marketplace.
 *       **Admin Access Required**: Only administrators can create advertisements.
 *       **Image Handling**: Provide image URL directly in the request body (no file upload).
 *       **Placement Options**: Various placement locations throughout the app.
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
 *               - title
 *               - placement
 *               - imageUrl
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 description: Advertisement title
 *                 example: "Premium Solar Panel Sale - 20% Off"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Advertisement description
 *                 example: "Get the best solar panels at discounted prices. Limited time offer!"
 *               placement:
 *                 type: string
 *                 enum: [banner_top, banner_bottom, sidebar, popup, product_list, shop_list, engineer_list]
 *                 description: Where the ad will be displayed
 *                 example: "banner_top"
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 description: Advertisement banner image URL (hosted externally)
 *                 example: "https://example.com/images/solar-panel-banner.jpg"
 *               link:
 *                 type: string
 *                 format: uri
 *                 description: Optional link URL when ad is clicked
 *                 example: "https://example.com/solar-sale"
 *               targetAudience:
 *                 type: string
 *                 enum: [all, buyers, sellers, engineers, shops]
 *                 default: "all"
 *                 description: Target audience for the advertisement
 *                 example: "buyers"
 *               priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 default: 5
 *                 description: Display priority (1=lowest, 10=highest)
 *                 example: 8
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the ad is active
 *                 example: true
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Ad start date (optional)
 *                 example: "2024-01-15"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Ad end date (optional)
 *                 example: "2024-02-15"
 *           examples:
 *             banner_ad:
 *               summary: Top banner advertisement
 *               value:
 *                 title: "Premium Solar Panel Sale - 20% Off"
 *                 description: "Get the best solar panels at discounted prices"
 *                 placement: "banner_top"
 *                 imageUrl: "https://example.com/images/solar-panel-banner.jpg"
 *                 link: "https://example.com/solar-sale"
 *                 targetAudience: "buyers"
 *                 priority: 8
 *                 startDate: "2024-01-15"
 *                 endDate: "2024-02-15"
 *             sidebar_ad:
 *               summary: Sidebar advertisement
 *               value:
 *                 title: "Professional Solar Installation"
 *                 description: "Expert installation services available"
 *                 placement: "sidebar"
 *                 imageUrl: "https://example.com/images/installation-ad.jpg"
 *                 targetAudience: "buyers"
 *                 priority: 6
 *                 isActive: true
 *     responses:
 *       201:
 *         description: Advertisement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Advertisement created successfully"
 *                   data:
 *                     ad:
 *                       id: "64abc123def456789012345"
 *                       title: "Premium Solar Panel Sale - 20% Off"
 *                       placement: "banner_top"
 *                       imageUrl: "https://example.com/images/solar-panel-banner.jpg"
 *                       isActive: true
 *                       priority: 8
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Validation error or invalid image URL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 value:
 *                   status: "fail"
 *                   message: "Title, placement, and imageUrl are required"
 *               invalid_url:
 *                 value:
 *                   status: "fail"
 *                   message: "Invalid image URL format"
 *               invalid_placement:
 *                 value:
 *                   status: "fail"
 *                   message: "Invalid placement. Must be one of: banner_top, banner_bottom, sidebar, popup, product_list, shop_list, engineer_list"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/postads', authToken, isAdmin, adsController.postAds);

/**
 * @swagger
 * /api/v1/ads/get/allAds:
 *   get:
 *     tags:
 *       - Advertisement Management
 *     summary: Get all advertisements (Admin only)
 *     description: |
 *       Retrieve all advertisements with filtering and pagination options.
 *       **Admin Access Required**: Only administrators can view all advertisements.
 *       **Management Features**: View statistics, performance metrics, and manage ad status.
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
 *       - name: limit
 *         in: query
 *         description: Number of ads per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *       - name: placement
 *         in: query
 *         description: Filter by placement location
 *         schema:
 *           type: string
 *           enum: [banner_top, banner_bottom, sidebar, popup, product_list, shop_list, engineer_list]
 *       - name: isActive
 *         in: query
 *         description: Filter by active status
 *         schema:
 *           type: boolean
 *       - name: targetAudience
 *         in: query
 *         description: Filter by target audience
 *         schema:
 *           type: string
 *           enum: [all, buyers, sellers, engineers, shops]
 *     responses:
 *       200:
 *         description: Advertisements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     ads:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           placement:
 *                             type: string
 *                           imageUrl:
 *                             type: string
 *                           link:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           views:
 *                             type: number
 *                           clicks:
 *                             type: number
 *                           priority:
 *                             type: number
 *                           createdAt:
 *                             type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/get/allAds', authToken, isAdmin, adsController.getAllAds);

/**
 * @swagger
 * /api/v1/ads/update/{id}:
 *   patch:
 *     tags:
 *       - Advertisement Management
 *     summary: Update advertisement (Admin only)
 *     description: |
 *       Update an existing advertisement.
 *       **Admin Access Required**: Only administrators can update advertisements.
 *       **Image Update**: Provide new image URL in JSON body (no file upload required).
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Advertisement ID
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
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 description: Updated advertisement title
 *                 example: "Updated Solar Panel Sale - 25% Off"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Updated advertisement description
 *                 example: "Even better deals on premium solar panels"
 *               placement:
 *                 type: string
 *                 enum: [banner_top, banner_bottom, sidebar, popup, product_list, shop_list, engineer_list]
 *                 description: New placement location
 *                 example: "banner_bottom"
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 description: New advertisement image URL
 *                 example: "https://example.com/images/updated-banner.jpg"
 *               link:
 *                 type: string
 *                 format: uri
 *                 description: Updated click-through URL
 *                 example: "https://example.com/updated-sale"
 *               targetAudience:
 *                 type: string
 *                 enum: [all, buyers, sellers, engineers, shops]
 *                 description: Updated target audience
 *                 example: "all"
 *               priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Updated display priority
 *                 example: 9
 *               isActive:
 *                 type: boolean
 *                 description: Updated active status
 *                 example: true
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Updated start date
 *                 example: "2024-01-20"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Updated end date
 *                 example: "2024-02-20"
 *           examples:
 *             update_content:
 *               summary: Update ad content and image
 *               value:
 *                 title: "Updated Solar Panel Sale - 25% Off"
 *                 description: "Even better deals on premium solar panels"
 *                 imageUrl: "https://example.com/images/updated-banner.jpg"
 *                 priority: 9
 *             update_status:
 *               summary: Update ad status and placement
 *               value:
 *                 placement: "banner_bottom"
 *                 isActive: false
 *                 endDate: "2024-01-31"
 *     responses:
 *       200:
 *         description: Advertisement updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Advertisement updated successfully"
 *                   data:
 *                     ad:
 *                       id: "64abc123def456789012345"
 *                       title: "Updated Solar Panel Sale - 25% Off"
 *                       placement: "banner_bottom"
 *                       imageUrl: "https://example.com/images/updated-banner.jpg"
 *                       priority: 9
 *                       isActive: true
 *                       updatedAt: "2024-01-15T14:30:00.000Z"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_url:
 *                 value:
 *                   status: "fail"
 *                   message: "Invalid image URL format"
 *               invalid_priority:
 *                 value:
 *                   status: "fail"
 *                   message: "Priority must be between 1 and 10"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/update/:id', authToken, isAdmin, adsController.updateAd);

/**
 * @swagger
 * /api/v1/ads/delete/{id}:
 *   delete:
 *     tags:
 *       - Advertisement Management
 *     summary: Delete advertisement (Admin only)
 *     description: |
 *       Permanently delete an advertisement.
 *       **Admin Access Required**: Only administrators can delete advertisements.
 *       **⚠️ Warning**: This action cannot be undone.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Advertisement ID to delete
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: "64abc123def456789012345"
 *     responses:
 *       200:
 *         description: Advertisement deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Advertisement deleted successfully"
 *                   data:
 *                     deletedAdId: "64abc123def456789012345"
 *                     title: "Premium Solar Panel Sale"
 *                     deletedAt: "2024-01-15T14:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/delete/:id', authToken, isAdmin, adsController.deleteAd);

/**
 * @swagger
 * /api/v1/ads/placement/{placement}:
 *   get:
 *     tags:
 *       - Public Advertisements
 *     summary: Get advertisements by placement (Public)
 *     description: |
 *       Get active advertisements for a specific placement location.
 *       **Public Endpoint**: No authentication required.
 *       **Auto-sorted**: Returns ads sorted by priority (highest first).
 *       **Active Only**: Only returns currently active advertisements.
 *     parameters:
 *       - name: placement
 *         in: path
 *         required: true
 *         description: Advertisement placement location
 *         schema:
 *           type: string
 *           enum: [banner_top, banner_bottom, sidebar, popup, product_list, shop_list, engineer_list]
 *           example: "banner_top"
 *       - name: limit
 *         in: query
 *         description: Maximum number of ads to return
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 5
 *           example: 3
 *     responses:
 *       200:
 *         description: Advertisements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     ads:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "64abc123def456789012345"
 *                           title:
 *                             type: string
 *                             example: "Premium Solar Panel Sale"
 *                           imageUrl:
 *                             type: string
 *                             format: uri
 *                             example: "https://example.com/images/banner1.jpg"
 *                           link:
 *                             type: string
 *                             format: uri
 *                             nullable: true
 *                             example: "https://example.com/sale"
 *                           priority:
 *                             type: number
 *                             example: 9
 *                     placement:
 *                       type: string
 *                       example: "banner_top"
 *                     count:
 *                       type: number
 *                       description: Number of ads returned
 *                       example: 2
 *             examples:
 *               banner_ads:
 *                 summary: Banner advertisements
 *                 value:
 *                   status: "success"
 *                   data:
 *                     ads:
 *                       - id: "64abc123def456789012345"
 *                         title: "Premium Solar Panel Sale"
 *                         imageUrl: "https://example.com/images/banner1.jpg"
 *                         link: "https://example.com/sale"
 *                         priority: 9
 *                       - id: "64abc123def456789012346"
 *                         title: "Professional Installation Service"
 *                         imageUrl: "https://example.com/images/banner2.jpg"
 *                         link: null
 *                         priority: 7
 *                     placement: "banner_top"
 *                     count: 2
 *               sidebar_ads:
 *                 summary: Sidebar advertisements
 *                 value:
 *                   status: "success"
 *                   data:
 *                     ads:
 *                       - id: "64abc123def456789012347"
 *                         title: "Expert Solar Consultation"
 *                         imageUrl: "https://example.com/images/sidebar-ad.jpg"
 *                         link: "https://example.com/consultation"
 *                         priority: 8
 *                     placement: "sidebar"
 *                     count: 1
 *       404:
 *         description: No advertisements found for this placement
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "No active advertisements found for this placement"
 */
router.get('/placement/:placement', adsController.getAdsByPlacement);

module.exports = router;
