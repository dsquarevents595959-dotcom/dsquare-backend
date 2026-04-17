const nodemailer = require('nodemailer');

// Create transporter for nodemailer
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'mail.dsquarevents.com',
    port: process.env.EMAIL_PORT || 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'dinesh@dsquarevents.com',
      pass: process.env.EMAIL_PASSWORD || 'your-email-password'
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    }
  });
};

// Email template
const createEmailTemplate = (formData) => {
  return {
    from: `DSquare Events Website <${process.env.EMAIL_USER || 'dinesh@dsquarevents.com'}>`,
    to: process.env.EMAIL_TO || 'dinesh@dsquarevents.com',
    subject: `New Contact Form Submission - ${formData.subject || 'No Subject'}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #0B132B, #0A1F44, #123C69);
            color: white;
            padding: 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
            margin: -30px -30px 20px -30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #FFD700;
            margin-bottom: 10px;
          }
          .field {
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f9f9f9;
            border-left: 4px solid #FFD700;
            border-radius: 5px;
          }
          .field-label {
            font-weight: bold;
            color: #0B132B;
            margin-bottom: 5px;
          }
          .field-value {
            color: #555;
            word-wrap: break-word;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #777;
            font-size: 12px;
          }
          .timestamp {
            background-color: #e9ecef;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">DSquare Events</div>
            <h2>New Contact Form Submission</h2>
          </div>
          
          <div class="field">
            <div class="field-label">Name:</div>
            <div class="field-value">${formData.name || 'Not provided'}</div>
          </div>
          
          <div class="field">
            <div class="field-label">Email:</div>
            <div class="field-value">${formData.email || 'Not provided'}</div>
          </div>
          
          <div class="field">
            <div class="field-label">Phone:</div>
            <div class="field-value">${formData.phone || 'Not provided'}</div>
          </div>
          
          <div class="field">
            <div class="field-label">Subject:</div>
            <div class="field-value">${formData.subject || 'Not provided'}</div>
          </div>
          
          <div class="field">
            <div class="field-label">Message:</div>
            <div class="field-value">${formData.message || 'Not provided'}</div>
          </div>
          
          <div class="timestamp">
            Submitted on: ${new Date().toLocaleString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
          
          <div class="footer">
            <p>This email was sent from the DSquare Events website contact form.</p>
            <p>Please respond to the sender at: ${formData.email || 'No email provided'}</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Send email function
const sendContactEmail = async (formData) => {
  try {
    const transporter = createTransporter();
    const mailOptions = createEmailTemplate(formData);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send email'
    };
  }
};

module.exports = {
  sendContactEmail,
  createEmailTemplate
};
