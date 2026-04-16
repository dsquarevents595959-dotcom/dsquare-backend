# MongoDB Setup Guide

This backend now uses **MongoDB** instead of MySQL for storing contact form submissions and other data.

## What Changed

### Removed
- ❌ `mysql2` package (MySQL driver)
- ❌ MySQL connection configuration
- ❌ SQL queries for contact form

### Added
- ✅ `mongoose` package (MongoDB ODM)
- ✅ MongoDB connection with automatic reconnection
- ✅ Mongoose schema validation for Contact model
- ✅ RESTful API endpoints for contact management

## Installation & Setup

### 1. Update Dependencies
```bash
cd backend
npm install
```

This installs `mongoose` and removes the MySQL dependency.

### 2. Create MongoDB Database

#### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

#### Option B: Local MongoDB
Install MongoDB Community Edition and run:
```bash
mongod
```
Connection string: `mongodb://localhost:27017/dsquarevents`

### 3. Configure Environment Variables

Create or update `.env` file in the `backend` folder:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your-username:your-password@cluster-name.mongodb.net/dsquarevents?retryWrites=true&w=majority

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_JWT_SECRET=your-secret-key
ADMIN_PASSWORD=your-admin-password

# Server
NODE_ENV=development
PORT=5000
```

**Get Gmail App Password:**
1. Enable 2-factor authentication on your Gmail account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password for "Mail" and "Windows Computer"
4. Use this 16-character password as `EMAIL_PASS`

### 4. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

You should see:
```
✓ Contact routes loaded
✓ Connect routes loaded
✓ Admin routes loaded
MongoDB connected successfully
🚀 Server running at http://localhost:5000
```

## API Endpoints

### POST /api/contact
Submit a new contact form

**Request:**
```json
{
  "name": "John Doe",
  "phone": "+91-9876543210",
  "email": "john@example.com",
  "subject": "Event Inquiry",
  "message": "I would like to know about your wedding services..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message saved & admin notified",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "createdAt": "2024-04-16T10:30:00Z"
  }
}
```

### GET /api/contact
Retrieve all contact messages (admin only)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "phone": "+91-9876543210",
      "email": "john@example.com",
      "subject": "Event Inquiry",
      "message": "...",
      "status": "new",
      "createdAt": "2024-04-16T10:30:00Z",
      "updatedAt": "2024-04-16T10:30:00Z"
    }
  ]
}
```

### GET /api/contact/:id
Retrieve a single contact message

### PATCH /api/contact/:id
Update contact status (`new`, `read`, `replied`)

**Request:**
```json
{
  "status": "read"
}
```

### DELETE /api/contact/:id
Delete a contact message

## Database Schema

The Contact model includes:
- **name** (String) - Required, 2-50 characters
- **phone** (String) - Required, valid phone format
- **email** (String) - Required, valid email format
- **subject** (String) - Required, 3-100 characters
- **message** (String) - Required, 10-5000 characters
- **status** (String) - "new", "read", or "replied" (default: "new")
- **createdAt** (Date) - Automatically set
- **updatedAt** (Date) - Automatically updated

## Features

✅ **Automatic Validation** - Mongoose validates all data before saving
✅ **Email Notifications** - Admin notified when contact form submitted
✅ **Error Handling** - Graceful handling if database is unavailable
✅ **Timestamps** - Auto-tracked creation and update times
✅ **Status Tracking** - Track contact status (new, read, replied)
✅ **Indexing** - Optimized queries for email and date

## Troubleshooting

### Connection Failed
```
Error: MongoDB connection failed: Network error
```
- Check if MONGODB_URI is correct
- Ensure your IP is whitelisted in MongoDB Atlas
- Check internet connection

### Validation Error
```
"Message must be at least 10 characters"
```
- Check all required fields are provided
- Follow character limits

### Email Not Sending
- Verify EMAIL_USER and EMAIL_PASS are correct
- Check if Gmail account has 2FA enabled
- Generate a new App Password

## Migration Notes

- Old MySQL data is **not** automatically migrated
- All new submissions will be stored in MongoDB
- To migrate old data, contact support or manually import

## Next Steps

1. ✅ Install dependencies
2. ✅ Set up MongoDB
3. ✅ Configure .env file
4. ✅ Start the server
5. ✅ Test contact form on frontend
6. ✅ Monitor email notifications

For more help, check the error logs or contact the development team.
