const mongoose = require('mongoose');

const serviceCardSchema = new mongoose.Schema({
  serviceCategory: {
    type: String,
    required: true,
    enum: ['weddings', 'birthdays', 'grand-entry', 'entertainment', 'stalls', 'dj-lighting-visual']
  },
  cardTitle: {
    type: String,
    required: true
  },
  cardDescription: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  mediaUrl: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  isSubCard: {
    type: Boolean,
    default: false
  },
  parentCardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCard',
    default: null
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
serviceCardSchema.index({ serviceCategory: 1, sortOrder: 1 });
serviceCardSchema.index({ isActive: 1 });
serviceCardSchema.index({ parentCardId: 1 });
serviceCardSchema.index({ cardTitle: 'text', cardDescription: 'text' });

module.exports = mongoose.model('ServiceCard', serviceCardSchema);
