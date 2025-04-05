const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get a list of events with filtering options
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date
 *     responses:
 *       200:
 *         description: A list of events
 */
router.get('/', eventController.getEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event details by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details retrieved successfully
 *       404:
 *         description: Event not found
 */
router.get('/:id', eventController.getEventById);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
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
 *               - description
 *               - startDate
 *               - endDate
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
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
 *               requiredSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *               maxVolunteers:
 *                 type: number
 *     responses:
 *       201:
 *         description: Event created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, authorize(['organization', 'admin']), eventController.createEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
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
 *               requiredSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *               maxVolunteers:
 *                 type: number
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
router.put('/:id', authenticate, authorize(['organization', 'admin']), eventController.updateEvent);

/**
 * @swagger
 * /api/events/{id}/register:
 *   post:
 *     summary: Register as a volunteer for an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Registered successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 *       409:
 *         description: Already registered or event is full
 */
router.post('/:id/register', authenticate, authorize(['volunteer']), eventController.registerForEvent);

/**
 * @swagger
 * /api/events/{id}/check-in:
 *   post:
 *     summary: Check-in to an event using QR code
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - qrCode
 *             properties:
 *               qrCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Check-in successful
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found or not registered
 */
router.post('/:id/check-in', authenticate, eventController.checkInToEvent);

module.exports = router;
