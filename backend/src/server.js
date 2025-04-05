const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SEEKUP API',
      version: '1.0.0',
      description: 'API documentation for SEEKUP volunteer management platform',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/api/routes/*.js'], // Path to the API routes
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API Routes
const authRoutes = require('./api/routes/auth.routes');
const userRoutes = require('./api/routes/user.routes');
const eventRoutes = require('./api/routes/event.routes');
const organizationRoutes = require('./api/routes/organization.routes');
const analyticsRoutes = require('./api/routes/analytics.routes');
const notificationRoutes = require('./api/routes/notification.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SEEKUP API' });
});

// Database connection setup
const connectDB = async () => {
  try {
    if (process.env.NODE_ENV === 'test') {
      // Use in-memory MongoDB for testing
      const dbMemory = require('./config/db-memory');
      await dbMemory.connect();
    } else {
      // Use real MongoDB for development and production
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
    }

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`API Documentation: http://localhost:${port}/api-docs`);
      
      // Schedule event reminders for notifications
      if (process.env.NODE_ENV !== 'test') {
        const { scheduleEventReminders } = require('./api/controllers/notification.controller');
        scheduleEventReminders()
          .then(success => {
            if (success) {
              console.log('Event reminders scheduled successfully');
            } else {
              console.warn('Failed to schedule event reminders');
            }
          })
          .catch(err => console.error('Error scheduling reminders:', err));
      }
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something broke!', error: err.message });
});

module.exports = app; // For testing
