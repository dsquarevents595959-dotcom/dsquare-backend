# Contact Form Implementation Guide

## 🎯 Objective
Handle contact form submissions using MongoDB with email notifications to admin.

---

## 📦 What's Been Set Up

### Backend Files
```
backend/
├── db.js                          # MongoDB connection (Mongoose)
├── models/
│   └── Contact.js                # Contact form schema
├── routes/
│   └── contactRoutes.js           # All contact endpoints
├── server.js                       # Express app setup
├── emailService.js                 # Email notifications
├── package.json                    # Dependencies (mongoose added)
├── .env.example                    # Environment template
├── .gitignore                      # Git exclusions
├── MONGODB_SETUP.md                # Setup instructions
└── MIGRATION_SUMMARY.md            # Migration details
```

---

## 🚀 Step-by-Step Implementation

### Step 1: Install Dependencies
```bash
cd backend
npm install
```
This installs `mongoose` and all required packages.

### Step 2: Create MongoDB Database

#### Option A: MongoDB Atlas (Cloud - Recommended for Production)
1. Visit https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new project and cluster
4. Generate a username and password
5. Whitelist your IP address
6. Copy connection string

#### Option B: Local MongoDB (Development)
```bash
# Install MongoDB Community Edition
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Or download from https://www.mongodb.com/try/download/community

# Start MongoDB
mongod

# Connection string: mongodb://localhost:27017/dsquarevents
```

### Step 3: Configure Environment Variables

Create `backend/.env` file:
```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://your-username:your-password@cluster-name.mongodb.net/dsquarevents?retryWrites=true&w=majority

# Gmail Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password

# Admin Configuration
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_JWT_SECRET=your-super-secret-key-change-this
ADMIN_PASSWORD=your-admin-password

# Server
NODE_ENV=development
PORT=5000
```

#### Getting Gmail App Password:
1. Enable 2-Factor Authentication: https://myaccount.google.com/security
2. Go to App Passwords: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Generate password (16 characters)
5. Use this as `EMAIL_PASS`

### Step 4: Start the Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Expected output:
# === Environment Variables Debug ===
# ADMIN_JWT_SECRET: true
# ADMIN_EMAIL: true
# ADMIN_PASSWORD: true
# MONGODB_URI: true
# NODE_ENV: development
# =================================
# ✓ Contact routes loaded
# ✓ Connect routes loaded
# ✓ Admin routes loaded
# MongoDB connected successfully
# 🚀 Server running at http://localhost:5000
```

### Step 5: Test the Endpoint

Using cURL:
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+91-9876543210",
    "email": "john@example.com",
    "subject": "Wedding Inquiry",
    "message": "I would like to inquire about your wedding services for an event in May."
  }'
```

Using JavaScript:
```javascript
const submitContact = async () => {
  const response = await fetch('http://localhost:5000/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'John Doe',
      phone: '+91-9876543210',
      email: 'john@example.com',
      subject: 'Wedding Inquiry',
      message: 'I would like to inquire about your wedding services for an event in May.'
    })
  });
  
  const data = await response.json();
  console.log(data);
  // {
  //   "success": true,
  //   "message": "Message saved & admin notified",
  //   "data": {
  //     "id": "507f1f77bcf86cd799439011",
  //     "createdAt": "2024-04-16T10:30:00Z"
  //   }
  // }
};
```

### Step 6: Verify in MongoDB

```bash
# Using MongoDB Compass (GUI)
# 1. Connect to your MongoDB
# 2. Select database: dsquarevents
# 3. Select collection: contacts
# 4. View your submitted data

# Or using MongoDB Shell
mongo "mongodb+srv://username:password@cluster.mongodb.net/dsquarevents"
db.contacts.find().pretty()
```

---

## 📡 API Reference

### POST /api/contact (Submit Form)
**Request:**
```json
{
  "name": "John Doe",
  "phone": "+91-9876543210",
  "email": "john@example.com",
  "subject": "Wedding Services",
  "message": "I'm interested in your wedding planning services..."
}
```

**Response (Success):**
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

**Response (Validation Error):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Email must be a valid email address",
    "Message must be at least 10 characters"
  ]
}
```

### GET /api/contact (List All)
**Query Parameters:**
- None required

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
      "subject": "Wedding Services",
      "message": "I'm interested...",
      "status": "new",
      "createdAt": "2024-04-16T10:30:00Z",
      "updatedAt": "2024-04-16T10:30:00Z"
    }
  ]
}
```

### GET /api/contact/:id (Get Single)
**Response:**
```json
{
  "success": true,
  "data": { /* contact object */ }
}
```

### PATCH /api/contact/:id (Update Status)
**Request:**
```json
{
  "status": "read"
}
```

**Valid statuses:** `"new"`, `"read"`, `"replied"`

### DELETE /api/contact/:id (Delete)
**Response:**
```json
{
  "success": true,
  "message": "Contact deleted successfully",
  "data": { /* deleted contact object */ }
}
```

---

## 🔍 Database Schema

```javascript
Contact {
  _id: ObjectId,                    // Auto-generated MongoDB ID
  name: String,                     // 2-50 chars, required
  phone: String,                    // Valid phone format, required
  email: String,                    // Valid email, required, lowercase
  subject: String,                  // 3-100 chars, required
  message: String,                  // 10-5000 chars, required
  status: "new" | "read" | "replied", // Default: "new"
  createdAt: Date,                  // Auto-set
  updatedAt: Date,                  // Auto-updated
  __v: Number                       // Version field (Mongoose internal)
}
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `MONGODB_URI not defined` | Add `MONGODB_URI` to `.env` file |
| `Connection refused` | Check MongoDB is running, URI is correct |
| `Email not sending` | Verify Gmail credentials, generate new app password |
| `Validation error` | Check field lengths and formats |
| `404 on /api/contact` | Ensure backend server is running |
| `CORS error` | Already configured in server.js for localhost and production |

---

## 📊 Monitoring & Debugging

### View Server Logs
```bash
# Development mode
npm run dev

# Look for:
# ✓ Connection established
# MongoDB connected successfully
# Contact saved: [ID]
# Email sent to: admin@example.com
```

### Check MongoDB Data
**Using MongoDB Compass:**
1. Connect to your MongoDB URI
2. Navigate to: `dsquarevents` → `contacts`
3. View all documents

**Using MongoDB Shell:**
```bash
# Connect
mongo "your-mongodb-uri"

# List all contacts
db.contacts.find().pretty()

# Find by email
db.contacts.find({email: "john@example.com"}).pretty()

# Count total
db.contacts.countDocuments()

# Delete old entries
db.contacts.deleteMany({createdAt: {$lt: new Date("2024-01-01")}})
```

---

## 🚀 Deployment Checklist

- [ ] MongoDB Atlas cluster created and running
- [ ] MongoDB URI added to production `.env`
- [ ] Gmail app password generated
- [ ] Admin email configured
- [ ] Backend dependencies installed (`npm install`)
- [ ] Server starts without errors (`npm start`)
- [ ] Contact form submission works
- [ ] Admin receives email notification
- [ ] Data appears in MongoDB
- [ ] All validations working
- [ ] CORS configured for frontend domain
- [ ] `.env` file is in `.gitignore`

---

## 📝 Notes

- **No data migration:** Old MySQL data is not automatically migrated
- **First time:** Initial MongoDB connection may take a few seconds
- **Email delays:** Email delivery can take 1-5 minutes
- **Local testing:** Use `mongodb://localhost:27017/dsquarevents` for local MongoDB
- **Cloud testing:** Use MongoDB Atlas URI for cloud-based database

---

## 🆘 Need Help?

1. Check `MONGODB_SETUP.md` for detailed setup
2. Check `MIGRATION_SUMMARY.md` for what changed
3. Review server logs for error messages
4. Verify all environment variables are set
5. Test with cURL or Postman to isolate issues

---

**Happy coding! 🎉**
