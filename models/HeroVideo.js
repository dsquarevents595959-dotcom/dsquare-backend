const mongoose = require('mongoose');

const heroVideoSchema = new mongoose.Schema({
  videoUrl: {
    type: String,
    required: true,
    default: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  publicId: {
    type: String,
    required: true,
    default: 'default-hero-placeholder'
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
