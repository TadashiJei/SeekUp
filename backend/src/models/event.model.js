const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    address: String,
    city: {
      type: String,
      required: true
    },
    state: String,
    country: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  category: {
    type: String,
    enum: [
      'education', 
      'environment', 
      'healthcare', 
      'social-services', 
      'disaster-relief',
      'animal-welfare',
      'community-development',
      'arts-culture',
      'sports-recreation',
      'other'
    ],
    default: 'other'
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  maxVolunteers: {
    type: Number
  },
  duration: {
    type: Number,  // in hours
  },
  pointsForAttendance: {
    type: Number,
    default: 10
  },
  attendees: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled', 'no-show'],
      default: 'registered'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    checkInTime: Date,
    qrCode: String
  }],
  image: {
    type: String
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for common queries
eventSchema.index({ startDate: 1 });
eventSchema.index({ 'location.city': 1 });
eventSchema.index({ organization: 1 });
eventSchema.index({ category: 1 });

// Virtual field for remaining spots
eventSchema.virtual('remainingSpots').get(function() {
  if (!this.maxVolunteers) return null;
  const registeredCount = this.attendees.filter(a => 
    a.status === 'registered' || a.status === 'attended'
  ).length;
  return Math.max(0, this.maxVolunteers - registeredCount);
});

// Update the updatedAt field before saving
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Set toJSON option to include virtuals
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
