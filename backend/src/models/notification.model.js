const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['event-reminder', 'event-update', 'system', 'achievement'],
    required: true,
    default: 'system'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  url: {
    type: String
  },
  data: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for common queries
notificationSchema.index({ userId: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
