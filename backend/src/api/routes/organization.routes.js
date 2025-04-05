const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organization.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     summary: Get a list of verified organizations
 *     tags: [Organizations]
 *     responses:
 *       200:
 *         description: A list of organizations
 */
router.get('/', organizationController.getOrganizations);

/**
 * @swagger
 * /api/organizations/{id}:
 *   get:
 *     summary: Get organization details by ID
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization details retrieved successfully
 *       404:
 *         description: Organization not found
 */
router.get('/:id', organizationController.getOrganizationById);

/**
 * @swagger
 * /api/organizations/profile:
 *   put:
 *     summary: Update organization profile
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logo:
 *                 type: string
 *               website:
 *                 type: string
 *               contactInfo:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   country:
 *                     type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', authenticate, authorize(['organization']), organizationController.updateProfile);

/**
 * @swagger
 * /api/organizations/events:
 *   get:
 *     summary: Get events organized by the current organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/events', authenticate, authorize(['organization']), organizationController.getOrganizationEvents);

/**
 * @swagger
 * /api/organizations/metrics:
 *   get:
 *     summary: Get organization metrics and analytics
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/metrics', authenticate, authorize(['organization']), organizationController.getMetrics);

/**
 * @swagger
 * /api/organizations/verification:
 *   post:
 *     summary: Request organization verification
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documents
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [registration, taxId, otherProof]
 *                     documentUrl:
 *                       type: string
 *     responses:
 *       200:
 *         description: Verification request submitted successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/verification', authenticate, authorize(['organization']), organizationController.requestVerification);

module.exports = router;
