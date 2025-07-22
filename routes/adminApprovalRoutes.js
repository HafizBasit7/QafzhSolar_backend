const express = require('express');
const router = express.Router();
const adminApprovalController = require('../controllers/adminApprovalController');
const { authToken, isAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * /api/v1/admin/get:
 *   get:
 *     tags:
 *       - Product Approval Management
 *     summary: Get all products for admin review (Admin only)
 *     description: |
 *       Retrieve all products with their approval status for admin management.
 *       **Admin Access Required**: Only administrators can access this endpoint.
 *       **Product Lifecycle**: Shows products in all states (pending, approved, rejected).
 *       **Management Features**: Filter by status, sort by date, search functionality.
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
 *         description: Number of products per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *           example: 20
 *       - name: status
 *         in: query
 *         description: Filter by approval status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, sold, inactive, all]
 *           default: "all"
 *           example: "pending"
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
 *         description: Filter by governorate
 *         schema:
 *           type: string
 *           example: "Sana'a"
 *       - name: dateFrom
 *         in: query
 *         description: Filter products submitted from this date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *       - name: dateTo
 *         in: query
 *         description: Filter products submitted until this date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-31"
 *       - name: sortBy
 *         in: query
 *         description: Sort field
 *         schema:
 *           type: string
 *           enum: [createdAt, price, name, status]
 *           default: "createdAt"
 *           example: "createdAt"
 *       - name: sortOrder
 *         in: query
 *         description: Sort order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *           example: "desc"
 *       - name: search
 *         in: query
 *         description: Search by product name, description, brand, or phone
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
 *                         allOf:
 *                           - $ref: '#/components/schemas/Product'
 *                           - type: object
 *                             properties:
 *                               submittedBy:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   phone:
 *                                     type: string
 *                                   name:
 *                                     type: string
 *                               approvalHistory:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     status:
 *                                       type: string
 *                                     adminId:
 *                                       type: string
 *                                     adminName:
 *                                       type: string
 *                                     timestamp:
 *                                       type: string
 *                                     reason:
 *                                       type: string
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         pending:
 *                           type: number
 *                         approved:
 *                           type: number
 *                         rejected:
 *                           type: number
 *                         sold:
 *                           type: number
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
 *                         price: 25000
 *                         status: "pending"
 *                         submittedBy:
 *                           id: "64abc123def456789012340"
 *                           phone: "+967777123456"
 *                           name: "Ahmed Ali"
 *                         images: ["https://cloudinary.com/image1.jpg"]
 *                         createdAt: "2024-01-15T10:30:00.000Z"
 *                         approvalHistory: []
 *                     pagination:
 *                       currentPage: 1
 *                       totalPages: 5
 *                       totalItems: 95
 *                       itemsPerPage: 20
 *                     summary:
 *                       total: 95
 *                       pending: 23
 *                       approved: 67
 *                       rejected: 5
 *                       sold: 0
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/get', authToken, isAdmin, adminApprovalController.getProducts);

/**
 * @swagger
 * /api/v1/admin/pending:
 *   get:
 *     tags:
 *       - Product Approval Management
 *     summary: Get pending products for review (Admin only)
 *     description: |
 *       Retrieve only products that are pending admin approval.
 *       **Admin Access Required**: Only administrators can access this endpoint.
 *       **Focus on Workflow**: Specifically designed for the approval workflow.
 *       **Priority Sorting**: Shows newest submissions first by default.
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
 *         description: Number of pending products per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *       - name: type
 *         in: query
 *         description: Filter pending products by type
 *         schema:
 *           type: string
 *           enum: [Inverter, Panel, Battery, Accessory, Cable, Controller, Monitor, Other]
 *       - name: priority
 *         in: query
 *         description: Filter by urgency (based on submission time)
 *         schema:
 *           type: string
 *           enum: [high, medium, low]
 *           example: "high"
 *       - name: priceRange
 *         in: query
 *         description: Filter by price range for quality assessment
 *         schema:
 *           type: string
 *           enum: [low, medium, high, premium]
 *           example: "high"
 *     responses:
 *       200:
 *         description: Pending products retrieved successfully
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
 *                   example: "Pending products retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Product'
 *                           - type: object
 *                             properties:
 *                               waitingTime:
 *                                 type: string
 *                                 description: How long the product has been waiting for approval
 *                                 example: "2 days ago"
 *                               submissionQuality:
 *                                 type: object
 *                                 properties:
 *                                   score:
 *                                     type: number
 *                                     description: Quality score (1-10)
 *                                     example: 8
 *                                   hasImages:
 *                                     type: boolean
 *                                   hasDescription:
 *                                     type: boolean
 *                                   hasSpecifications:
 *                                     type: boolean
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *                     workflowStats:
 *                       type: object
 *                       properties:
 *                         totalPending:
 *                           type: number
 *                         highPriority:
 *                           type: number
 *                         averageWaitTime:
 *                           type: string
 *             examples:
 *               success:
 *                 value:
 *                   status: "success"
 *                   message: "Pending products retrieved successfully"
 *                   data:
 *                     products:
 *                       - id: "64abc123def456789012345"
 *                         name: "High Efficiency Solar Panel 300W"
 *                         type: "Panel"
 *                         price: 35000
 *                         status: "pending"
 *                         waitingTime: "2 days ago"
 *                         submissionQuality:
 *                           score: 9
 *                           hasImages: true
 *                           hasDescription: true
 *                           hasSpecifications: true
 *                         images: ["https://cloudinary.com/panel.jpg"]
 *                         submittedBy:
 *                           phone: "+967777123456"
 *                           name: "Ahmad Solar"
 *                         createdAt: "2024-01-13T10:30:00.000Z"
 *                     pagination:
 *                       currentPage: 1
 *                       totalPages: 2
 *                       totalItems: 23
 *                       itemsPerPage: 20
 *                     workflowStats:
 *                       totalPending: 23
 *                       highPriority: 8
 *                       averageWaitTime: "3.2 days"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/pending', authToken, isAdmin, adminApprovalController.getPendingProducts);

/**
 * @swagger
 * /api/v1/admin/update/{id}:
 *   patch:
 *     tags:
 *       - Product Approval Management
 *     summary: Update product approval status (Admin only)
 *     description: |
 *       Approve, reject, or modify the status of a product listing.
 *       **Admin Access Required**: Only administrators can change product approval status.
 *       **Status Workflow**:
 *       - `pending` → `approved`: Product becomes visible to users
 *       - `pending` → `rejected`: Product is hidden, user can resubmit with changes
 *       - `approved` → `sold`: Mark as sold (removes from active listings)
 *       - `approved` → `inactive`: Temporarily hide (user can reactivate)
 *       
 *       **Audit Trail**: All status changes are logged with admin ID and reason.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID to update
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected, sold, inactive]
 *                 description: New approval status for the product
 *                 example: "approved"
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Reason for status change (required for rejection)
 *                 example: "Product approved - meets all quality standards"
 *               adminNotes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Internal admin notes (not visible to user)
 *                 example: "High quality submission with complete specifications"
 *               featured:
 *                 type: boolean
 *                 description: Mark product as featured (only when approving)
 *                 example: false
 *               priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Display priority for approved products
 *                 example: 5
 *               qualityScore:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Admin quality assessment score
 *                 example: 8
 *           examples:
 *             approve_product:
 *               summary: Approve a product
 *               value:
 *                 status: "approved"
 *                 reason: "Product meets all quality standards and requirements"
 *                 qualityScore: 9
 *                 featured: true
 *             reject_product:
 *               summary: Reject a product
 *               value:
 *                 status: "rejected"
 *                 reason: "Images are unclear and product description is insufficient. Please provide better images and more detailed specifications."
 *                 adminNotes: "User should resubmit with clearer photos"
 *             mark_sold:
 *               summary: Mark product as sold
 *               value:
 *                 status: "sold"
 *                 reason: "Product marked as sold by seller"
 *             make_inactive:
 *               summary: Make product inactive
 *               value:
 *                 status: "inactive"
 *                 reason: "Temporarily hidden due to pricing concerns"
 *                 adminNotes: "User to update pricing and resubmit"
 *     responses:
 *       200:
 *         description: Product status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               approved:
 *                 summary: Product approved successfully
 *                 value:
 *                   status: "success"
 *                   message: "Product status updated successfully"
 *                   data:
 *                     product:
 *                       id: "64abc123def456789012345"
 *                       name: "High Efficiency Solar Panel 300W"
 *                       status: "approved"
 *                       featured: true
 *                       qualityScore: 9
 *                       updatedAt: "2024-01-15T12:30:00.000Z"
 *                     statusChange:
 *                       from: "pending"
 *                       to: "approved"
 *                       adminId: "64abc123def456789012340"
 *                       adminName: "Admin User"
 *                       reason: "Product meets all quality standards"
 *                       timestamp: "2024-01-15T12:30:00.000Z"
 *                     impact:
 *                       visibleToUsers: true
 *                       searchable: true
 *                       featured: true
 *               rejected:
 *                 summary: Product rejected
 *                 value:
 *                   status: "success"
 *                   message: "Product status updated successfully"
 *                   data:
 *                     product:
 *                       id: "64abc123def456789012345"
 *                       name: "Solar Panel"
 *                       status: "rejected"
 *                       updatedAt: "2024-01-15T12:30:00.000Z"
 *                     statusChange:
 *                       from: "pending"
 *                       to: "rejected"
 *                       reason: "Images unclear, description insufficient"
 *                       timestamp: "2024-01-15T12:30:00.000Z"
 *                     impact:
 *                       visibleToUsers: false
 *                       canResubmit: true
 *                       userNotified: true
 *       400:
 *         description: Invalid status transition or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_transition:
 *                 value:
 *                   status: "fail"
 *                   message: "Cannot change status from 'sold' to 'pending'"
 *               missing_reason:
 *                 value:
 *                   status: "fail"
 *                   message: "Reason is required when rejecting a product"
 *               invalid_status:
 *                 value:
 *                   status: "fail"
 *                   message: "Invalid status value. Must be one of: pending, approved, rejected, sold, inactive"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "Product not found with the provided ID"
 */
router.patch('/update/:id', authToken, isAdmin, adminApprovalController.updateProductStatus);

module.exports = router;
