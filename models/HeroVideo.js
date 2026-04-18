const mongoose = require('mongoose');

const heroVideoSchema = new mongoose.Schema({
  videoUrl: {
    type: String,
    required: true,
    default: 'https://res.cloudinary.com/dycvh4ct7/video/upload/v1745032365/courousel-hero.mp4'
  },
  publicId: {
    type: String,
    required: true,
    default: 'courousel-hero'
  },
  videoTitle: {
    type: String,
    default: 'DSquare Events Hero Video'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  uploadedBy: {
    type: String,
    required: true,
    default: 'admin'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HeroVideo', heroVideoSchema);
