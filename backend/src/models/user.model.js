const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['volunteer', 'organization', 'admin'],
    required: true
  },
  refreshToken: {
    type: String
  },
  pushSubscription: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Volunteer-specific fields
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  badges: [{
    type: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    imageUrl: String,
    awardedDate: {
      type: Date,
      default: Date.now
    }
  }],
  achievements: [{
    type: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    criteria: String,
    completedDate: {
      type: Date,
      default: Date.now
    }
  }],
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  registeredEvents: [{
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event'
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
    checkInTime: Date
  }],
  
  // Organization-specific fields
  organizationDetails: {
    description: String,
    logo: String,
    website: String,
    contactInfo: {
      email: String,
      phone: String,
      address: String
    },
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'not-submitted'],
      default: 'not-submitted'
    },
    verificationDocuments: [{
      type: {
        type: String,
        enum: ['registration', 'taxId', 'otherProof'],
        required: true
      },
      documentUrl: {
        type: String,
        required: true
      },
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
