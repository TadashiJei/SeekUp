const Organization = require('../../models/organization.model');
const User = require('../../models/user.model');
const Event = require('../../models/event.model');

/**
 * Get a list of verified organizations
 */
exports.getOrganizations = async (req, res) => {
  try {
    const organizations = await User.find({
      userType: 'organization',
      'organizationDetails.isVerified': true
    }).select('name organizationDetails.description organizationDetails.logo organizationDetails.location');
    
    res.status(200).json({
      message: 'Organizations retrieved successfully',
      count: organizations.length,
      organizations
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get organization details by ID
 */
exports.getOrganizationById = async (req, res) => {
  try {
    const orgId = req.params.id;
    
    const organization = await User.findOne({
      _id: orgId,
      userType: 'organization'
    }).select('-password -refreshToken');
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Get events organized by this organization
    const events = await Event.find({ organization: orgId })
      .sort({ startDate: -1 })
      .limit(5)
      .select('title description startDate endDate location');
    
    res.status(200).json({
      message: 'Organization retrieved successfully',
      organization,
      recentEvents: events
    });
  } catch (error) {
    console.error('Get organization by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update organization profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      logo,
      website,
      contactInfo,
      location
    } = req.body;
    
    // Create update object
    const updateData = {};
    
    if (name) updateData.name = name;
    
    // Organization-specific fields
    if (description) updateData['organizationDetails.description'] = description;
    if (logo) updateData['organizationDetails.logo'] = logo;
    if (website) updateData['organizationDetails.website'] = website;
    if (contactInfo) updateData['organizationDetails.contactInfo'] = contactInfo;
    if (location) updateData['organizationDetails.location'] = location;
    
    // Update organization profile
    const organization = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    res.status(200).json({
      message: 'Profile updated successfully',
      organization
    });
  } catch (error) {
    console.error('Update organization profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get events organized by the current organization
 */
exports.getOrganizationEvents = async (req, res) => {
  try {
    const organizationId = req.user.id;
    
    // Find all events organized by this organization
    const events = await Event.find({ organization: organizationId })
      .sort({ startDate: -1 });
    
    res.status(200).json({
      message: 'Events retrieved successfully',
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Get organization events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get organization metrics and analytics
 */
exports.getMetrics = async (req, res) => {
  try {
    const organizationId = req.user.id;
    
    // Get all events by this organization
    const events = await Event.find({ organization: organizationId });
    
    // Calculate metrics
    const totalEvents = events.length;
    
    // Count volunteers who attended events
    let totalVolunteers = 0;
    let totalAttendance = 0;
    
    events.forEach(event => {
      totalAttendance += event.attendees.filter(a => a.status === 'attended').length;
    });
    
    // Get unique volunteers across all events
    const uniqueVolunteers = new Set();
    events.forEach(event => {
      event.attendees.forEach(attendee => {
        if (attendee.status === 'attended') {
          uniqueVolunteers.add(attendee.userId.toString());
        }
      });
    });
    
    totalVolunteers = uniqueVolunteers.size;
    
    // Get upcoming events
    const upcomingEvents = events.filter(e => new Date(e.startDate) > new Date()).length;
    
    // Get completed events
    const completedEvents = events.filter(e => new Date(e.endDate) < new Date()).length;
    
    // Calculate volunteer hours
    let totalVolunteerHours = 0;
    events.forEach(event => {
      const attendedCount = event.attendees.filter(a => a.status === 'attended').length;
      totalVolunteerHours += (event.duration || 0) * attendedCount;
    });
    
    res.status(200).json({
      message: 'Metrics retrieved successfully',
      metrics: {
        totalEvents,
        upcomingEvents,
        completedEvents,
        totalVolunteers,
        totalAttendance,
        totalVolunteerHours,
        averageAttendanceRate: totalEvents > 0 ? (totalAttendance / totalEvents) : 0
      }
    });
  } catch (error) {
    console.error('Get organization metrics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Request organization verification
 */
exports.requestVerification = async (req, res) => {
  try {
    const organizationId = req.user.id;
    const { documents } = req.body;
    
    if (!documents || documents.length === 0) {
      return res.status(400).json({ message: 'Verification documents are required' });
    }
    
    // Update organization verification status
    const organization = await User.findByIdAndUpdate(
      organizationId,
      { 
        $set: {
          'organizationDetails.verificationDocuments': documents,
          'organizationDetails.verificationStatus': 'pending'
        } 
      },
      { new: true }
    );
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    res.status(200).json({
      message: 'Verification request submitted successfully',
      verificationStatus: organization.organizationDetails.verificationStatus
    });
  } catch (error) {
    console.error('Request verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
