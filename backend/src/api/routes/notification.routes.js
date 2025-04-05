const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/notifications/subscribe:
 *   post:
 *     summary: Save user's push notification subscription
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subscription
 *             properties:
 *               subscription:
 *                 type: object
 *                 description: Web Push subscription object
 *     responses:
 *       200:
 *         description: Subscription saved successfully
 *       400:
 *         description: Invalid subscription
 */
router.post('/subscribe', 
  authenticate, 
  notificationController.savePushSubscription
);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
router.get('/', 
  authenticate, 
  notificationController.getUserNotifications
);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.patch('/:notificationId/read', 
  authenticate, 
  notificationController.markNotificationRead
);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch('/read-all', 
  authenticate, 
  notificationController.clearAllNotifications
);

/**
 * @swagger
 * /api/notifications/system:
 *   post:
 *     summary: Send a system notification to users (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               userType:
 *                 type: string
 *                 enum: [volunteer, organization]
 *               specificUserId:
 *                 type: string
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       403:
 *         description: Access denied
 */
router.post('/system', 
  authenticate, 
  authorize(['admin']), 
  notificationController.sendSystemNotification
);

/**
 * @swagger
 * /api/notifications/events/{eventId}:
 *   post:
 *     summary: Send notification to event attendees
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Event not found
 */
router.post('/events/:eventId', 
  authenticate, 
  authorize(['organization', 'admin']), 
  notificationController.sendEventNotification
);

module.exports = router;
