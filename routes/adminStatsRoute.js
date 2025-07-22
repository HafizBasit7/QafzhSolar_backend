const express = require('express');
const router = express.Router();
const  adminStatsController  = require('../controllers/adminStatsController');
const { authToken, isAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * /api/v1/admin/stats/dashboard-stats:
 *   get:
 *     tags:
 *       - Admin Dashboard & Analytics
 *     summary: Get comprehensive dashboard statistics (Admin only)
 *     description: |
 *       Retrieve comprehensive statistics for the admin dashboard.
 *       **Admin Access Required**: Only administrators can access dashboard statistics.
 *       **Real-time Data**: Provides up-to-date metrics for informed decision making.
 *       **Comprehensive Metrics**: Includes user activity, product stats, revenue insights, and system health.
 *       
 *       **Dashboard Sections:**
 *       - **Overview Metrics**: Total users, products, shops, engineers
 *       - **Activity Metrics**: Recent registrations, product submissions, approvals
 *       - **Performance Metrics**: Conversion rates, popular categories, regional distribution
 *       - **Quality Metrics**: Approval rates, rejection reasons, user satisfaction
 *       - **Growth Metrics**: Trends over time, month-over-month growth
 *       - **System Health**: Database status, API performance, error rates
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: timeRange
 *         in: query
 *         description: Time range for statistics
 *         schema:
 *           type: string
 *           enum: [today, week, month, quarter, year, all]
 *           default: "month"
 *           example: "month"
 *       - name: includeTrends
 *         in: query
 *         description: Include historical trend data
 *         schema:
 *           type: boolean
 *           default: true
 *           example: true
 *       - name: includeRegionalData
 *         in: query
 *         description: Include governorate-wise breakdown
 *         schema:
 *           type: boolean
 *           default: true
 *           example: true
 *       - name: includePerformanceMetrics
 *         in: query
 *         description: Include detailed performance metrics
 *         schema:
 *           type: boolean
 *           default: true
 *           example: true
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
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
 *                   example: "Dashboard statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       description: High-level overview metrics
 *                       properties:
 *                         totalUsers:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: number
 *                               example: 1250
 *                             growth:
 *                               type: object
 *                               properties:
 *                                 percentage:
 *                                   type: number
 *                                   example: 15.5
 *                                 period:
 *                                   type: string
 *                                   example: "month"
 *                         totalProducts:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: number
 *                               example: 450
 *                             pending:
 *                               type: number
 *                               example: 23
 *                             approved:
 *                               type: number
 *                               example: 378
 *                             rejected:
 *                               type: number
 *                               example: 49
 *                         totalShops:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: number
 *                               example: 28
 *                             verified:
 *                               type: number
 *                               example: 23
 *                         totalEngineers:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: number
 *                               example: 45
 *                             verified:
 *                               type: number
 *                               example: 38
 *                             available:
 *                               type: number
 *                               example: 32
 *                     activity:
 *                       type: object
 *                       description: Recent activity metrics
 *                       properties:
 *                         recentRegistrations:
 *                           type: object
 *                           properties:
 *                             today:
 *                               type: number
 *                               example: 12
 *                             week:
 *                               type: number
 *                               example: 85
 *                             month:
 *                               type: number
 *                               example: 340
 *                         recentSubmissions:
 *                           type: object
 *                           properties:
 *                             products:
 *                               type: object
 *                               properties:
 *                                 today:
 *                                   type: number
 *                                   example: 8
 *                                 week:
 *                                   type: number
 *                                   example: 56
 *                                 pendingApproval:
 *                                   type: number
 *                                   example: 23
 *                         adminActions:
 *                           type: object
 *                           properties:
 *                             approvalsToday:
 *                               type: number
 *                               example: 15
 *                             rejectionsToday:
 *                               type: number
 *                               example: 3
 *                             averageResponseTime:
 *                               type: string
 *                               example: "4.2 hours"
 *                     performance:
 *                       type: object
 *                       description: Performance and quality metrics
 *                       properties:
 *                         approvalRates:
 *                           type: object
 *                           properties:
 *                             overall:
 *                               type: number
 *                               example: 84.2
 *                             byCategory:
 *                               type: object
 *                               properties:
 *                                 Panel:
 *                                   type: number
 *                                   example: 87.5
 *                                 Inverter:
 *                                   type: number
 *                                   example: 82.1
 *                                 Battery:
 *                                   type: number
 *                                   example: 89.3
 *                         popularCategories:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               category:
 *                                 type: string
 *                                 example: "Panel"
 *                               count:
 *                                 type: number
 *                                 example: 180
 *                               percentage:
 *                                 type: number
 *                                 example: 40.0
 *                         qualityMetrics:
 *                           type: object
 *                           properties:
 *                             averageQualityScore:
 *                               type: number
 *                               example: 7.8
 *                             completeSubmissions:
 *                               type: number
 *                               description: Percentage of submissions with all required fields
 *                               example: 92.5
 *                     regional:
 *                       type: object
 *                       description: Geographic distribution
 *                       properties:
 *                         byGovernorate:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               governorate:
 *                                 type: string
 *                                 example: "Sana'a"
 *                               users:
 *                                 type: number
 *                                 example: 425
 *                               products:
 *                                 type: number
 *                                 example: 156
 *                               shops:
 *                                 type: number
 *                                 example: 8
 *                               engineers:
 *                                 type: number
 *                                 example: 12
 *                         topRegions:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Sana'a"
 *                               activity:
 *                                 type: string
 *                                 example: "high"
 *                               growth:
 *                                 type: number
 *                                 example: 22.5
 *                     trends:
 *                       type: object
 *                       description: Historical trends and growth
 *                       properties:
 *                         userGrowth:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               period:
 *                                 type: string
 *                                 example: "2024-01"
 *                               users:
 *                                 type: number
 *                                 example: 1250
 *                               growth:
 *                                 type: number
 *                                 example: 15.5
 *                         productSubmissions:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               period:
 *                                 type: string
 *                                 example: "2024-01"
 *                               submissions:
 *                                 type: number
 *                                 example: 85
 *                               approvals:
 *                                 type: number
 *                                 example: 72
 *                     systemHealth:
 *                       type: object
 *                       description: System health and performance
 *                       properties:
 *                         database:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               example: "healthy"
 *                             responseTime:
 *                               type: string
 *                               example: "12ms"
 *                             connections:
 *                               type: number
 *                               example: 15
 *                         apiPerformance:
 *                           type: object
 *                           properties:
 *                             averageResponseTime:
 *                               type: string
 *                               example: "125ms"
 *                             errorRate:
 *                               type: number
 *                               example: 0.02
 *                             requestsPerMinute:
 *                               type: number
 *                               example: 45
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T12:30:00.000Z"
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T12:30:15.123Z"
 *             examples:
 *               comprehensive_stats:
 *                 summary: Complete dashboard statistics
 *                 value:
 *                   status: "success"
 *                   message: "Dashboard statistics retrieved successfully"
 *                   data:
 *                     overview:
 *                       totalUsers:
 *                         count: 1250
 *                         growth:
 *                           percentage: 15.5
 *                           period: "month"
 *                       totalProducts:
 *                         count: 450
 *                         pending: 23
 *                         approved: 378
 *                         rejected: 49
 *                       totalShops:
 *                         count: 28
 *                         verified: 23
 *                       totalEngineers:
 *                         count: 45
 *                         verified: 38
 *                         available: 32
 *                     activity:
 *                       recentRegistrations:
 *                         today: 12
 *                         week: 85
 *                         month: 340
 *                       recentSubmissions:
 *                         products:
 *                           today: 8
 *                           week: 56
 *                           pendingApproval: 23
 *                       adminActions:
 *                         approvalsToday: 15
 *                         rejectionsToday: 3
 *                         averageResponseTime: "4.2 hours"
 *                     performance:
 *                       approvalRates:
 *                         overall: 84.2
 *                         byCategory:
 *                           Panel: 87.5
 *                           Inverter: 82.1
 *                           Battery: 89.3
 *                       popularCategories:
 *                         - category: "Panel"
 *                           count: 180
 *                           percentage: 40.0
 *                         - category: "Inverter"
 *                           count: 120
 *                           percentage: 26.7
 *                         - category: "Battery"
 *                           count: 95
 *                           percentage: 21.1
 *                     regional:
 *                       byGovernorate:
 *                         - governorate: "Sana'a"
 *                           users: 425
 *                           products: 156
 *                           shops: 8
 *                           engineers: 12
 *                         - governorate: "Aden"
 *                           users: 320
 *                           products: 118
 *                           shops: 6
 *                           engineers: 9
 *                     systemHealth:
 *                       database:
 *                         status: "healthy"
 *                         responseTime: "12ms"
 *                         connections: 15
 *                       apiPerformance:
 *                         averageResponseTime: "125ms"
 *                         errorRate: 0.02
 *                         requestsPerMinute: 45
 *                     lastUpdated: "2024-01-15T12:30:00.000Z"
 *                     generatedAt: "2024-01-15T12:30:15.123Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Error retrieving statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               database_error:
 *                 value:
 *                   status: "error"
 *                   message: "Unable to retrieve statistics due to database connectivity issues"
 *               calculation_error:
 *                 value:
 *                   status: "error"
 *                   message: "Error calculating performance metrics"
 */
router.get('/dashboard-stats', authToken ,isAdmin, adminStatsController.getAdminDashboardStats);

module.exports = router;
