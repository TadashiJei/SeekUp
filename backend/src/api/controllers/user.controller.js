const User = require('../../models/user.model');
const Event = require('../../models/event.model');

/**
 * Get user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user and exclude sensitive information
    const user = await User.findById(userId).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: 'Profile retrieved successfully',
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    // Prevent updating sensitive fields
    delete updateData.password;
    delete updateData.email;
    delete updateData.userType;
    delete updateData.refreshToken;
    
    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get volunteer passport (history, hours, achievements)
 */
exports.getVolunteerPassport = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user is a volunteer
    const user = await User.findById(userId);
    if (!user || user.userType !== 'volunteer') {
      return res.status(403).json({ message: 'Access denied. User is not a volunteer' });
    }
    
    // Get all events the volunteer has participated in
    const events = await Event.find({
      'attendees.userId': userId,
      'attendees.status': 'attended'
    }).select('title startDate endDate location organization duration');
    
    // Calculate total volunteer hours
    const totalHours = events.reduce((sum, event) => sum + (event.duration || 0), 0);
    
    // Get user badges and achievements
    const badges = user.badges || [];
    const achievements = user.achievements || [];
    
    res.status(200).json({
      message: 'Volunteer passport retrieved successfully',
      passport: {
        volunteerId: userId,
        volunteerName: user.name,
        eventsAttended: events.length,
        totalHours,
        events,
        badges,
        achievements
      }
    });
  } catch (error) {
    console.error('Get volunteer passport error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
