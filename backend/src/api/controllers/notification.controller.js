const User = require('../../models/user.model');
const Event = require('../../models/event.model');
const Notification = require('../../models/notification.model');
const webpush = require('web-push');
const schedule = require('node-schedule');

// Configure web push with VAPID keys
webpush.setVapidDetails(
  process.env.WEB_PUSH_CONTACT || 'mailto:contact@seekup-app.com',
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

/**
 * Save a user's push subscription
 */
exports.savePushSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user.id;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: 'Invalid subscription object' });
    }
    
    // Update user with subscription
    await User.findByIdAndUpdate(userId, {
      $set: { pushSubscription: subscription }
    });
    
    res.status(200).json({ message: 'Push subscription saved successfully' });
  } catch (error) {
    console.error('Save push subscription error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get notifications for the authenticated user
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get notifications for this user, sorted by creation date (newest first)
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to most recent 50 notifications
    
    res.status(200).json({
      message: 'Notifications retrieved successfully',
      notifications
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Mark a notification as read
 */
exports.markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    // Find notification and check ownership
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Mark as read
    notification.isRead = true;
    await notification.save();
    
    res.status(200).json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Clear all notifications for a user
 */
exports.clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Update all notifications for this user to isRead: true
    await Notification.updateMany(
      { userId },
      { $set: { isRead: true } }
    );
    
    res.status(200).json({
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Send a push notification
 * 
 * @param {string} userId - User ID to send notification to
 * @param {Object} notification - Notification data
 * @param {string} notification.title - Notification title
 * @param {string} notification.body - Notification body
 * @param {string} notification.type - Notification type (event, system, etc.)
 * @param {string} notification.icon - Optional icon URL
 * @param {string} notification.url - Optional URL to open when clicked
 * @param {Object} notification.data - Optional additional data
 * @returns {Promise<boolean>} - Success status
 */
const sendPushNotification = async (userId, notification) => {
  try {
    // Get user with push subscription
    const user = await User.findById(userId).select('pushSubscription');
    
    if (!user || !user.pushSubscription) {
      return false;
    }
    
    // Store notification in database
    const newNotification = new Notification({
      userId,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      url: notification.url,
      data: notification.data
    });
    
    await newNotification.save();
    
    // Send push notification
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/logo192.png',
      badge: '/logo192.png',
      vibrate: [100, 50, 100],
      data: {
        url: notification.url || '/',
        notificationId: newNotification._id,
        ...notification.data
      }
    });
    
    await webpush.sendNotification(user.pushSubscription, payload);
    return true;
  } catch (error) {
    console.error('Send push notification error:', error);
    return false;
  }
};

/**
 * Schedule event reminders for upcoming events
 * This should be called on server start and periodically
 */
exports.scheduleEventReminders = async () => {
  try {
    // Cancel any existing scheduled jobs
    Object.keys(schedule.scheduledJobs).forEach(jobName => {
      if (jobName.startsWith('reminder-')) {
        schedule.cancelJob(jobName);
      }
    });
    
    // Get upcoming events starting in the next 48 hours
    const now = new Date();
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    
    const upcomingEvents = await Event.find({
      startDate: { $gt: now, $lt: in48Hours }
    }).populate('attendees.userId', 'pushSubscription');
    
    console.log(`Scheduling reminders for ${upcomingEvents.length} upcoming events`);
    
    // Schedule reminders for each event
    upcomingEvents.forEach(event => {
      // Schedule reminder 24 hours before event
      const reminderTime = new Date(event.startDate);
      reminderTime.setHours(reminderTime.getHours() - 24);
      
      // Only schedule if reminder time is in the future
      if (reminderTime > now) {
        schedule.scheduleJob(`reminder-24h-${event._id}`, reminderTime, async () => {
          // Send reminder to all registered attendees
          const registeredAttendees = event.attendees.filter(a => 
            a.status === 'registered' && a.userId && a.userId.pushSubscription
          );
          
          console.log(`Sending 24h reminders for event ${event.title} to ${registeredAttendees.length} attendees`);
          
          for (const attendee of registeredAttendees) {
            await sendPushNotification(attendee.userId._id, {
              title: 'Event Reminder: Tomorrow',
              body: `Don't forget: "${event.title}" starts tomorrow!`,
              type: 'event-reminder',
              url: `/events/${event._id}`,
              data: {
                eventId: event._id,
                eventTitle: event.title
              }
            });
          }
        });
      }
      
      // Schedule reminder 1 hour before event
      const hourReminderTime = new Date(event.startDate);
      hourReminderTime.setHours(hourReminderTime.getHours() - 1);
      
      if (hourReminderTime > now) {
        schedule.scheduleJob(`reminder-1h-${event._id}`, hourReminderTime, async () => {
          // Send reminder to all registered attendees
          const registeredAttendees = event.attendees.filter(a => 
            a.status === 'registered' && a.userId && a.userId.pushSubscription
          );
          
          console.log(`Sending 1h reminders for event ${event.title} to ${registeredAttendees.length} attendees`);
          
          for (const attendee of registeredAttendees) {
            await sendPushNotification(attendee.userId._id, {
              title: 'Event Starting Soon',
              body: `"${event.title}" starts in about an hour!`,
              type: 'event-reminder',
              url: `/events/${event._id}`,
              data: {
                eventId: event._id,
                eventTitle: event.title
              }
            });
          }
        });
      }
    });
    
    console.log('Event reminders scheduled successfully');
    return true;
  } catch (error) {
    console.error('Schedule event reminders error:', error);
    return false;
  }
};

/**
 * Send a system notification to a specific user or all users of a type
 */
exports.sendSystemNotification = async (req, res) => {
  try {
    // Ensure sender is an admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can send system notifications.' });
    }
    
    const {
      title,
      body,
      userType,
      specificUserId,
      url
    } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }
    
    // Handle single user notification
    if (specificUserId) {
      const user = await User.findById(specificUserId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const success = await sendPushNotification(specificUserId, {
        title,
        body,
        type: 'system',
        url: url || '/',
        data: { type: 'system' }
      });
      
      return res.status(200).json({
        message: success ? 'Notification sent successfully' : 'User has no push subscription',
        success
      });
    }
    
    // Handle notification to all users of a type
    if (!userType) {
      return res.status(400).json({ message: 'Either specificUserId or userType is required' });
    }
    
    // Get all users of specified type with push subscriptions
    const users = await User.find({
      userType,
      pushSubscription: { $ne: null }
    }).select('_id');
    
    if (users.length === 0) {
      return res.status(200).json({
        message: 'No users found with push subscriptions',
        success: false
      });
    }
    
    // Send to each user
    let successCount = 0;
    for (const user of users) {
      const success = await sendPushNotification(user._id, {
        title,
        body,
        type: 'system',
        url: url || '/',
        data: { type: 'system' }
      });
      
      if (success) successCount++;
    }
    
    res.status(200).json({
      message: `Notification sent to ${successCount} out of ${users.length} users`,
      success: successCount > 0
    });
  } catch (error) {
    console.error('Send system notification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Send event notification to all registered attendees
 */
exports.sendEventNotification = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, body } = req.body;
    const userId = req.user.id;
    
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }
    
    // Find the event and check if the requester is the organizer
    const event = await Event.findById(eventId)
      .populate('attendees.userId', 'pushSubscription');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.organization.toString() !== userId && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Filter users with push subscriptions
    const registeredAttendees = event.attendees.filter(a => 
      a.status === 'registered' && a.userId && a.userId.pushSubscription
    );
    
    if (registeredAttendees.length === 0) {
      return res.status(200).json({
        message: 'No attendees found with push subscriptions',
        success: false
      });
    }
    
    // Send notification to each attendee
    let successCount = 0;
    for (const attendee of registeredAttendees) {
      const success = await sendPushNotification(attendee.userId._id, {
        title,
        body,
        type: 'event-update',
        url: `/events/${eventId}`,
        data: {
          eventId,
          eventTitle: event.title
        }
      });
      
      if (success) successCount++;
    }
    
    res.status(200).json({
      message: `Notification sent to ${successCount} out of ${registeredAttendees.length} attendees`,
      success: successCount > 0
    });
  } catch (error) {
    console.error('Send event notification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
