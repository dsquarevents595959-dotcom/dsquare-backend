const mongoose = require('mongoose');

const ContactInfoSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    default: '+91 7032619629'
  },
  email: {
    type: String,
    required: true,
    default: 'dinesh@dsquarevents.com'
  },
  address: {
    type: String,
    default: '2nd floor, Ganesh Rd poojitha residency, D. No- #61-22/1-1, beside janasena party office, near padavalarevu, ramalingeswaranagar, Vijayawada, Andhra Pradesh 520013'
  },
  facebook: {
    type: String,
    default: 'https://www.facebook.com/share/1AzLuChNq1/'
  },
  whatsapp: {
    type: String,
    default: 'https://wa.me/917032619629'
  },
  instagram: {
    type: String,
    default: 'https://www.instagram.com/dsquare_events_?utm_source=qr&igsh=dWM2YWd2Y2dsaXQ1'
  },
  youtube: {
    type: String,
    default: 'https://www.youtube.com/@DSQUARE.EVENTS.DANCE.5959'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String,
    default: 'admin'
  }
});

module.exports = mongoose.model('ContactInfo', ContactInfoSchema);
