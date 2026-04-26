const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Email configuration using Hostinger (lazy initialization)
let transporter = null;

const createTransporter = () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587, // Standard SMTP port
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      connectionTimeout: 10000, // 10 seconds timeout
      pool: true // Use connection pooling
    });
  }
  return null;
};

// POST endpoint to send contact emails
router.post('/send-contact', async (req, res) => {
  try {
    console.log('Received contact form data:', req.body);
    
    // Debug environment variables
    console.log('Email config debug:');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
    console.log('EMAIL_TO:', process.env.EMAIL_TO);
    
    const { name, email, phone, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Create transporter only if email configuration is available
    transporter = createTransporter();
    
    if (!transporter) {
      console.warn('Email configuration missing - simulating email send');
      // Simulate email send for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Email simulated successfully to: dinesh@dsquarevents.com');
      console.log('Form data received:', { name, email, phone, subject, message });
      
      return res.status(200).json({
        success: true,
        message: 'Email sent successfully (demo mode)'
      });
    }
    
    // Email options
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: `DSquare Events Contact: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Sent from DSquare Events Website</em></p>
      `
    };
    
    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    // Send email
    const result = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', result.messageId);
    console.log('Email sent to:', process.env.EMAIL_TO || process.env.EMAIL_USER);
    
    res.status(200).json({
      success: true,
      message: 'Email sent successfully'
    });
    
  } catch (error) {
    console.error('Error sending email - Full error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
