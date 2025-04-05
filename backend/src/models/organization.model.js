const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    contactEmail: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationDocument: {
      type: String,
    },
    memberCount: {
      type: Number,
      default: 1,
    },
    categories: [{
      type: String,
      enum: [
        'education',
        'environmental',
        'health',
        'animal-welfare',
        'community',
        'disaster-relief',
        'arts-culture',
        'technology',
        'sports-recreation',
        'social-services'
      ],
    }],
    createdEvents: [{
      type: Schema.Types.ObjectId,
      ref: 'Event',
    }],
  },
  {
    timestamps: true,
  }
);

// Virtual for total volunteers engaged
organizationSchema.virtual('totalVolunteers').get(function () {
  return this.createdEvents.reduce((total, event) => total + (event.attendees?.length || 0), 0);
});

// Method to check if organization is verified
organizationSchema.methods.isVerified = function () {
  return this.verificationStatus === 'verified';
};

// Static method to find active organizations
organizationSchema.statics.findActive = function () {
  return this.find({ verificationStatus: 'verified' });
};

// Add indexes for better query performance
organizationSchema.index({ name: 'text', description: 'text' });
organizationSchema.index({ 'address.city': 1, 'address.state': 1 });
organizationSchema.index({ categories: 1 });

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
