const Event = require('../../models/event.model');
const User = require('../../models/user.model');
const { generateQRCode } = require('../../utils/qrcode.util');

/**
 * Get a list of events with filtering options
 */
exports.getEvents = async (req, res) => {
  try {
    const { location, category, date, keyword } = req.query;
    
    // Build query object for filtering
    const query = {};
    
    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (date) {
      const eventDate = new Date(date);
      query.startDate = { $lte: new Date(eventDate.setHours(23, 59, 59)) };
      query.endDate = { $gte: new Date(new Date(date).setHours(0, 0, 0)) };
    }
    
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    // Find events based on query
    const events = await Event.find(query)
      .populate('organization', 'name logo')
      .sort({ startDate: 1 })
      .select('-attendees');
    
    res.status(200).json({
      message: 'Events retrieved successfully',
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get event details by ID
 */
exports.getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const event = await Event.findById(eventId)
      .populate('organization', 'name description logo contactInfo')
      .populate('attendees.userId', 'name');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json({
      message: 'Event retrieved successfully',
      event
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a new event
 */
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      requiredSkills,
      maxVolunteers,
      category
    } = req.body;
    
    const userId = req.user.id;
    
    // Calculate event duration in hours
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationHours = (end - start) / (1000 * 60 * 60);
    
    // Create new event
    const event = new Event({
      title,
      description,
      startDate,
      endDate,
      location,
      requiredSkills,
      maxVolunteers,
      category,
      organization: userId,
      duration: durationHours
    });
    
    await event.save();
    
    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update an event
 */
exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const updateData = req.body;
    
    // Calculate duration if dates are provided
    if (updateData.startDate && updateData.endDate) {
      const start = new Date(updateData.startDate);
      const end = new Date(updateData.endDate);
      updateData.duration = (end - start) / (1000 * 60 * 60);
    }
    
    // Find event and check ownership
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the organization that created the event or an admin
    if (event.organization.toString() !== userId && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Register as a volunteer for an event
 */
exports.registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    
    // Find event
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if event is already full
    if (event.maxVolunteers && event.attendees.length >= event.maxVolunteers) {
      return res.status(409).json({ message: 'Event is already at maximum capacity' });
    }
    
    // Check if user is already registered
    const alreadyRegistered = event.attendees.some(attendee => 
      attendee.userId.toString() === userId
    );
    
    if (alreadyRegistered) {
      return res.status(409).json({ message: 'You are already registered for this event' });
    }
    
    // Generate unique QR code for check-in
    const qrCodeData = {
      eventId,
      userId,
      timestamp: new Date().toISOString()
    };
    
    const qrCode = await generateQRCode(JSON.stringify(qrCodeData));
    
    // Add user to event attendees
    event.attendees.push({
      userId,
      status: 'registered',
      registrationDate: new Date(),
      qrCode
    });
    
    await event.save();
    
    // Add event to user's registered events
    await User.findByIdAndUpdate(userId, {
      $push: { registeredEvents: { eventId, status: 'registered', registrationDate: new Date() } }
    });
    
    res.status(200).json({
      message: 'Successfully registered for the event',
      qrCode
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Check-in to an event using QR code
 */
exports.checkInToEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { qrCode } = req.body;
    const userId = req.user.id;
    
    // Find event
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Find the attendee
    const attendeeIndex = event.attendees.findIndex(attendee => 
      attendee.qrCode === qrCode && attendee.userId.toString() === userId
    );
    
    if (attendeeIndex === -1) {
      return res.status(404).json({ message: 'Not registered for this event or invalid QR code' });
    }
    
    // Update attendee status to 'attended'
    event.attendees[attendeeIndex].status = 'attended';
    event.attendees[attendeeIndex].checkInTime = new Date();
    
    await event.save();
    
    // Update user's event status
    await User.findOneAndUpdate(
      { _id: userId, 'registeredEvents.eventId': eventId },
      { 
        $set: { 
          'registeredEvents.$.status': 'attended',
          'registeredEvents.$.checkInTime': new Date()
        } 
      }
    );
    
    // Award points for attendance
    await User.findByIdAndUpdate(userId, {
      $inc: { points: event.pointsForAttendance || 10 }
    });
    
    res.status(200).json({
      message: 'Successfully checked in to the event'
    });
  } catch (error) {
    console.error('Check-in to event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
