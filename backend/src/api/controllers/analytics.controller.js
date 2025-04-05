const User = require('../../models/user.model');
const Event = require('../../models/event.model');
const mongoose = require('mongoose');

/**
 * Get organization dashboard analytics
 * Provides metrics for an organization's events and volunteer engagement
 */
exports.getOrganizationAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Ensure the user is an organization
    if (req.user.userType !== 'organization') {
      return res.status(403).json({ message: 'Access denied. Only organizations can access analytics.' });
    }
    
    // Get all events created by this organization
    const allEvents = await Event.find({ organization: userId });
    
    if (allEvents.length === 0) {
      return res.status(200).json({
        message: 'No events found for analytics',
        analytics: {
          totalEvents: 0,
          totalAttendees: 0,
          totalVolunteers: 0,
          averageAttendanceRate: 0,
          eventsByCategory: [],
          upcomingEvents: 0,
          pastEvents: 0,
          volunteerRetentionRate: 0,
          popularEvents: []
        }
      });
    }
    
    // Calculate basic metrics
    const now = new Date();
    const upcomingEvents = allEvents.filter(event => new Date(event.startDate) > now);
    const pastEvents = allEvents.filter(event => new Date(event.endDate) < now);
    
    // Calculate total registrations and attendees
    let totalRegistrations = 0;
    let totalAttendees = 0;
    const uniqueVolunteers = new Set();
    const repeatingVolunteers = new Set();
    
    // Track volunteers who have attended more than one event
    const volunteerEventCount = {};
    
    allEvents.forEach(event => {
      totalRegistrations += event.attendees.length;
      totalAttendees += event.attendees.filter(a => a.status === 'attended').length;
      
      event.attendees.forEach(attendee => {
        const volunteerId = attendee.userId.toString();
        uniqueVolunteers.add(volunteerId);
        
        // Count volunteer participation
        if (!volunteerEventCount[volunteerId]) {
          volunteerEventCount[volunteerId] = 1;
        } else {
          volunteerEventCount[volunteerId]++;
          repeatingVolunteers.add(volunteerId);
        }
      });
    });
    
    // Group events by category
    const eventsByCategory = allEvents.reduce((acc, event) => {
      const category = event.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category]++;
      return acc;
    }, {});
    
    // Find most popular events (by attendance)
    const popularEvents = [...allEvents]
      .sort((a, b) => 
        b.attendees.filter(att => att.status === 'attended').length - 
        a.attendees.filter(att => att.status === 'attended').length
      )
      .slice(0, 5)
      .map(event => ({
        id: event._id,
        title: event.title,
        startDate: event.startDate,
        registrations: event.attendees.length,
        attendees: event.attendees.filter(a => a.status === 'attended').length,
        category: event.category
      }));
    
    // Calculate attendance rate
    const attendanceRate = totalRegistrations > 0 
      ? (totalAttendees / totalRegistrations) * 100 
      : 0;
    
    // Calculate volunteer retention rate
    const retentionRate = uniqueVolunteers.size > 0 
      ? (repeatingVolunteers.size / uniqueVolunteers.size) * 100 
      : 0;
    
    // Format data for response
    const eventsByCategoryArray = Object.keys(eventsByCategory).map(category => ({
      category,
      count: eventsByCategory[category]
    }));
    
    res.status(200).json({
      message: 'Analytics retrieved successfully',
      analytics: {
        totalEvents: allEvents.length,
        totalRegistrations,
        totalAttendees,
        totalVolunteers: uniqueVolunteers.size,
        averageAttendanceRate: Math.round(attendanceRate * 10) / 10, // One decimal place
        eventsByCategory: eventsByCategoryArray,
        upcomingEvents: upcomingEvents.length,
        pastEvents: pastEvents.length,
        volunteerRetentionRate: Math.round(retentionRate * 10) / 10, // One decimal place
        popularEvents
      }
    });
  } catch (error) {
    console.error('Organization analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get volunteer metrics by event ID
 * Provides detailed analytics about volunteers for a specific event
 */
exports.getEventVolunteerMetrics = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    
    // Find the event and check if the requester is the organizer
    const event = await Event.findById(eventId)
      .populate('attendees.userId', 'name email skills');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Ensure the user is either the organization that created the event or an admin
    if (event.organization.toString() !== userId && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Calculate metrics
    const registrations = event.attendees.length;
    const attendees = event.attendees.filter(a => a.status === 'attended').length;
    const cancellations = event.attendees.filter(a => a.status === 'cancelled').length;
    const noShows = event.attendees.filter(a => a.status === 'no-show').length;
    
    // Calculate attendance rate
    const attendanceRate = registrations > 0 ? (attendees / registrations) * 100 : 0;
    
    // Analyze volunteer skills distribution
    const skillsDistribution = {};
    
    event.attendees.forEach(attendee => {
      if (attendee.userId && attendee.userId.skills) {
        attendee.userId.skills.forEach(skill => {
          if (!skillsDistribution[skill]) {
            skillsDistribution[skill] = 0;
          }
          skillsDistribution[skill]++;
        });
      }
    });
    
    // Format skills distribution for response
    const skillsArray = Object.keys(skillsDistribution).map(skill => ({
      skill,
      count: skillsDistribution[skill],
      percentage: Math.round((skillsDistribution[skill] / registrations) * 100)
    })).sort((a, b) => b.count - a.count);
    
    // Get check-in time distribution (by hour)
    const checkInTimes = event.attendees
      .filter(a => a.checkInTime)
      .map(a => {
        const checkInTime = new Date(a.checkInTime);
        return checkInTime.getHours();
      });
    
    const checkInDistribution = checkInTimes.reduce((acc, hour) => {
      if (!acc[hour]) {
        acc[hour] = 0;
      }
      acc[hour]++;
      return acc;
    }, {});
    
    // Format check-in distribution for response
    const checkInArray = Object.keys(checkInDistribution).map(hour => ({
      hour: parseInt(hour),
      count: checkInDistribution[hour],
      percentage: Math.round((checkInDistribution[hour] / attendees) * 100)
    })).sort((a, b) => a.hour - b.hour);
    
    res.status(200).json({
      message: 'Event volunteer metrics retrieved successfully',
      metrics: {
        eventId,
        title: event.title,
        date: event.startDate,
        registrations,
        attendees,
        cancellations,
        noShows,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        fillRate: event.maxVolunteers ? Math.round((registrations / event.maxVolunteers) * 100) : null,
        skillsDistribution: skillsArray,
        checkInDistribution: checkInArray
      }
    });
  } catch (error) {
    console.error('Event volunteer metrics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get volunteer impact report
 * Provides metrics about volunteer's impact and participation
 */
exports.getVolunteerImpact = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Ensure the user is a volunteer
    if (req.user.userType !== 'volunteer') {
      return res.status(403).json({ message: 'Access denied. Only volunteers can access impact reports.' });
    }
    
    // Get all events the volunteer has attended
    const events = await Event.find({ 'attendees.userId': userId })
      .populate('organization', 'name');
    
    if (events.length === 0) {
      return res.status(200).json({
        message: 'No volunteer activity found',
        impact: {
          totalEventsAttended: 0,
          totalHoursVolunteered: 0,
          totalPoints: 0,
          categoriesDistribution: [],
          organizationsWorkedWith: [],
          upcomingEvents: []
        }
      });
    }
    
    // Calculate metrics
    const now = new Date();
    const attendedEvents = events.filter(event => {
      const attendeeRecord = event.attendees.find(
        a => a.userId.toString() === userId && a.status === 'attended'
      );
      return attendeeRecord && new Date(event.endDate) < now;
    });
    
    const upcomingEvents = events.filter(event => {
      const attendeeRecord = event.attendees.find(
        a => a.userId.toString() === userId && a.status === 'registered'
      );
      return attendeeRecord && new Date(event.startDate) > now;
    });
    
    // Calculate total hours volunteered
    const totalHours = attendedEvents.reduce((total, event) => {
      return total + (event.duration || 0);
    }, 0);
    
    // Get points from user record
    const user = await User.findById(userId);
    const totalPoints = user ? user.points || 0 : 0;
    
    // Calculate categories distribution
    const categoriesCount = attendedEvents.reduce((acc, event) => {
      const category = event.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category]++;
      return acc;
    }, {});
    
    // Format categories for response
    const categoriesArray = Object.keys(categoriesCount).map(category => ({
      category,
      count: categoriesCount[category],
      percentage: Math.round((categoriesCount[category] / attendedEvents.length) * 100)
    }));
    
    // Calculate organizations worked with
    const organizationsMap = {};
    attendedEvents.forEach(event => {
      if (event.organization) {
        const orgId = event.organization._id.toString();
        const orgName = event.organization.name;
        
        if (!organizationsMap[orgId]) {
          organizationsMap[orgId] = { 
            id: orgId, 
            name: orgName, 
            eventsCount: 0,
            hours: 0
          };
        }
        
        organizationsMap[orgId].eventsCount++;
        organizationsMap[orgId].hours += (event.duration || 0);
      }
    });
    
    const organizationsArray = Object.values(organizationsMap)
      .sort((a, b) => b.eventsCount - a.eventsCount);
    
    // Format upcoming events for response
    const upcomingEventsArray = upcomingEvents.map(event => ({
      id: event._id,
      title: event.title,
      startDate: event.startDate,
      organization: event.organization ? event.organization.name : 'Unknown',
      category: event.category
    }));
    
    res.status(200).json({
      message: 'Volunteer impact report retrieved successfully',
      impact: {
        totalEventsAttended: attendedEvents.length,
        totalHoursVolunteered: totalHours,
        totalPoints,
        categoriesDistribution: categoriesArray,
        organizationsWorkedWith: organizationsArray,
        upcomingEvents: upcomingEventsArray
      }
    });
  } catch (error) {
    console.error('Volunteer impact report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get platform-wide analytics (admin only)
 * Provides overall metrics about the platform usage and growth
 */
exports.getPlatformAnalytics = async (req, res) => {
  try {
    // Ensure the user is an admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can access platform analytics.' });
    }
    
    // Get counts from collections
    const usersCount = await User.countDocuments();
    const volunteersCount = await User.countDocuments({ userType: 'volunteer' });
    const organizationsCount = await User.countDocuments({ userType: 'organization' });
    const eventsCount = await Event.countDocuments();
    
    // Get events by month (for the past year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const eventsByMonth = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: oneYearAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Get users by month (for the past year)
    const usersByMonth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: oneYearAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            userType: '$userType'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Format events by month for response
    const eventsGrowth = eventsByMonth.map(item => ({
      year: item._id.year,
      month: item._id.month,
      count: item.count
    }));
    
    // Format users growth by type and month
    const usersGrowth = {};
    
    usersByMonth.forEach(item => {
      const yearMonth = `${item._id.year}-${item._id.month}`;
      const userType = item._id.userType;
      
      if (!usersGrowth[yearMonth]) {
        usersGrowth[yearMonth] = {
          year: item._id.year,
          month: item._id.month,
          volunteer: 0,
          organization: 0,
          admin: 0,
          total: 0
        };
      }
      
      usersGrowth[yearMonth][userType] = item.count;
      usersGrowth[yearMonth].total += item.count;
    });
    
    // Calculate total volunteer hours
    const totalHoursResult = await Event.aggregate([
      {
        $match: {
          'attendees.status': 'attended'
        }
      },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          totalHours: { $sum: '$duration' }
        }
      }
    ]);
    
    const totalHours = totalHoursResult.length > 0 ? totalHoursResult[0].totalHours || 0 : 0;
    const totalEvents = totalHoursResult.length > 0 ? totalHoursResult[0].totalEvents || 0 : 0;
    
    // Get most active categories
    const categoriesResult = await Event.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    const categoriesDistribution = categoriesResult.map(item => ({
      category: item._id,
      count: item.count,
      percentage: Math.round((item.count / eventsCount) * 100)
    }));
    
    res.status(200).json({
      message: 'Platform analytics retrieved successfully',
      analytics: {
        users: {
          total: usersCount,
          volunteers: volunteersCount,
          organizations: organizationsCount
        },
        events: {
          total: eventsCount,
          volunteeredHours: totalHours,
          averageHoursPerEvent: totalEvents > 0 ? Math.round((totalHours / totalEvents) * 10) / 10 : 0
        },
        growth: {
          events: eventsGrowth,
          users: Object.values(usersGrowth)
        },
        categoriesDistribution
      }
    });
  } catch (error) {
    console.error('Platform analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
