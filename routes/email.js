const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { sendContactEmail } = require('../services/emailService');

// Rate limiting for email sending
// Limit: 5 emails per minute per IP address
const emailLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many emails sent. Please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for test requests
    return req.query.test === 'true';
  }
});

// POST route to send contact form email
router.post('/send-contact', emailLimiter, async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Prepare form data
    const formData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      subject: subject ? subject.trim() : 'Contact Form Submission',
      message: message.trim()
    };
    
    // Send email
    const emailResult = await sendContactEmail(formData);
    
    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        messageId: emailResult.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: emailResult.error
      });
    }
  } catch (error) {
    console.error('Error in email route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET route to test email service
// router.get('/test', (req, res) => {
//   res.json({
//     success: true,
//     message: 'Email service is running',
//     timestamp: new Date().toISOString()
//   });
// });

module.exports = router;
