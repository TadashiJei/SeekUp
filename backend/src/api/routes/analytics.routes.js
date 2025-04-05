const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/analytics/organization:
 *   get:
 *     summary: Get organization analytics dashboard data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *       403:
 *         description: Access denied
 */
router.get('/organization', 
  authenticate, 
  authorize(['organization']), 
  analyticsController.getOrganizationAnalytics
);

/**
 * @swagger
 * /api/analytics/events/{eventId}/volunteers:
 *   get:
 *     summary: Get volunteer metrics for a specific event
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Volunteer metrics retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Event not found
 */
router.get('/events/:eventId/volunteers', 
  authenticate, 
  authorize(['organization', 'admin']), 
  analyticsController.getEventVolunteerMetrics
);

/**
 * @swagger
 * /api/analytics/volunteer/impact:
 *   get:
 *     summary: Get volunteer impact report
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Volunteer impact report retrieved successfully
 *       403:
 *         description: Access denied
 */
router.get('/volunteer/impact', 
  authenticate, 
  authorize(['volunteer']), 
  analyticsController.getVolunteerImpact
);

/**
 * @swagger
 * /api/analytics/platform:
 *   get:
 *     summary: Get platform-wide analytics (admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform analytics retrieved successfully
 *       403:
 *         description: Access denied
 */
router.get('/platform', 
  authenticate, 
  authorize(['admin']), 
  analyticsController.getPlatformAnalytics
);

module.exports = router;
