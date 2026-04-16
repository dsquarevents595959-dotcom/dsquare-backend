const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalname: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  public_id: {
    type: String,
    required: true
  },
  folder: {
    type: String,
    default: 'dsquarevents'
  },
  uploadedBy: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['weddings', 'birthdays', 'grand-entry', 'entertainment', 'stalls', 'dj-lighting', 'general'],
    default: 'general'
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ category: 1 });
mediaSchema.index({ mimetype: 1 });
mediaSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Media', mediaSchema);
