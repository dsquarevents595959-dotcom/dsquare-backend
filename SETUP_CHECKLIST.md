# ✅ Setup Checklist - MongoDB Contact Form

Complete this checklist to ensure everything is properly configured.

---

## Phase 1: Initial Setup

### Backend Files
- [ ] `package.json` - Updated with mongoose dependency
- [ ] `db.js` - Migrated to MongoDB with Mongoose
- [ ] `models/Contact.js` - Created with full schema
- [ ] `routes/contactRoutes.js` - Updated with MongoDB methods
- [ ] `server.js` - Updated with db initialization
- [ ] `.env.example` - Created as template
- [ ] `.gitignore` - Updated with proper exclusions

### Documentation
- [ ] `MONGODB_SETUP.md` - Available for reference
- [ ] `MIGRATION_SUMMARY.md` - Available for reference
- [ ] `IMPLEMENTATION_GUIDE.md` - Available for reference
- [ ] `README_MONGODB.md` - Available for reference

---

## Phase 2: Dependency Installation

```bash
# Run this command
cd backend
npm install
```

### Verify Installation
- [ ] `node_modules/` folder created
- [ ] `mongoose` package installed (check `npm list mongoose`)
- [ ] `mysql2` package removed
- [ ] No error messages during installation

---

## Phase 3: MongoDB Setup

### Option A: MongoDB Atlas (Cloud)
1. [ ] Visit https://www.mongodb.com/cloud/atlas
2. [ ] Create free account
3. [ ] Create new project
4. [ ] Create new cluster
5. [ ] Create database user (save username & password)
6. [ ] Whitelist IP address (or use 0.0.0.0/0 for development)
7. [ ] Copy connection string
8. [ ] Replace placeholders: `<username>` and `<password>`

### Option B: Local MongoDB
1. [ ] Install MongoDB Community Edition
2. [ ] Start MongoDB service: `mongod`
3. [ ] Connection string: `mongodb://localhost:27017/dsquarevents`

### Verify MongoDB Connection
- [ ] MongoDB is running (verify with `mongosh` or MongoDB Compass)
- [ ] Connection string is valid
- [ ] Database is accessible

---

## Phase 4: Environment Configuration

### Create `.env` File
```bash
# In backend/ directory
cp .env.example .env
```

### Configure `.env` Variables
- [ ] `MONGODB_URI` - Set to your MongoDB connection string
- [ ] `EMAIL_USER` - Set to your Gmail address
- [ ] `EMAIL_PASS` - Set to Gmail App Password (not regular password)
- [ ] `ADMIN_EMAIL` - Set to admin email address
- [ ] `ADMIN_JWT_SECRET` - Set to a secure random string
- [ ] `ADMIN_PASSWORD` - Set to admin password
- [ ] `NODE_ENV` - Set to `development`
- [ ] `PORT` - Set to `5000` (or your preferred port)

### Gmail App Password
If you haven't already:
1. [ ] Enable 2-Factor Authentication: https://myaccount.google.com/security
2. [ ] Go to App Passwords: https://myaccount.google.com/apppasswords
3. [ ] Select "Mail" and "Windows Computer"
4. [ ] Generate and copy 16-character password
5. [ ] Paste as `EMAIL_PASS` in `.env`

### Verify `.env` File
- [ ] `.env` file exists in backend directory
- [ ] All required variables are set
- [ ] No quotes around values
- [ ] File is NOT committed to git (check `.gitignore`)

---

## Phase 5: Server Startup

### Start Development Server
```bash
cd backend
npm run dev
```

### Check Console Output
- [ ] No error messages
- [ ] See "✓ Contact routes loaded"
- [ ] See "✓ Connect routes loaded"
- [ ] See "✓ Admin routes loaded"
- [ ] See "MongoDB connected successfully"
- [ ] See "🚀 Server running at http://localhost:5000"

### If Connection Fails
- [ ] Check MONGODB_URI is correct
- [ ] Verify MongoDB is running
- [ ] Check IP whitelist in MongoDB Atlas
- [ ] Check internet connection

---

## Phase 6: Frontend Configuration

### Verify Frontend API URL
- [ ] Check `Frontend/src/lib/api.js` contains correct `API_BASE`
- [ ] For local development: `http://localhost:5000`
- [ ] For production: Set `VITE_API_URL` environment variable

### No Frontend Code Changes Needed
- [ ] Contact form component works as-is
- [ ] Email submission endpoint unchanged
- [ ] Response format unchanged

---

## Phase 7: API Testing

### Test POST Endpoint (Submit Contact)
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "+91-9876543210",
    "email": "test@example.com",
    "subject": "Test",
    "message": "This is a test message"
  }'
```

- [ ] Request succeeds (200 or 201 status)
- [ ] Response contains `success: true`
- [ ] Response contains `data.id` (MongoDB ID)
- [ ] Response contains `data.createdAt`

### Verify Admin Email
- [ ] Check admin email inbox
- [ ] Email received with contact details
- [ ] Email contains name, phone, email, subject, message
- [ ] Email timestamp is correct

### Test GET Endpoint (List All)
```bash
curl http://localhost:5000/api/contact
```

- [ ] Request succeeds
- [ ] Response contains array of contacts
- [ ] Most recent submission appears first
- [ ] Each contact has _id, name, email, subject, message, status, timestamps

### Test GET by ID
```bash
curl http://localhost:5000/api/contact/{id-from-above}
```

- [ ] Request succeeds
- [ ] Response contains single contact details
- [ ] ID matches requested ID

### Test PATCH (Update Status)
```bash
curl -X PATCH http://localhost:5000/api/contact/{id-from-above} \
  -H "Content-Type: application/json" \
  -d '{"status": "read"}'
```

- [ ] Request succeeds
- [ ] Status updated to "read"
- [ ] Response shows updated contact

### Test DELETE Endpoint
```bash
curl -X DELETE http://localhost:5000/api/contact/{id-from-above}
```

- [ ] Request succeeds
- [ ] Contact is deleted
- [ ] GET list no longer shows this contact

---

## Phase 8: MongoDB Data Verification

### Using MongoDB Compass (GUI)
1. [ ] Download and install MongoDB Compass
2. [ ] Connect to your MongoDB URI
3. [ ] Select database: `dsquarevents`
4. [ ] Select collection: `contacts`
5. [ ] View submitted contacts
6. [ ] Verify fields match schema
7. [ ] Check timestamps are correct

### Using MongoDB Shell (CLI)
```bash
# Connect
mongosh "mongodb+srv://user:password@cluster.mongodb.net/dsquarevents"

# View all
db.contacts.find().pretty()

# Count
db.contacts.countDocuments()

# Find specific
db.contacts.find({email: "test@example.com"}).pretty()
```

- [ ] MongoDB connection works
- [ ] Contacts collection exists
- [ ] Submitted data appears
- [ ] Fields are correctly formatted

---

## Phase 9: Frontend Testing

### Test Contact Form Submission
1. [ ] Open frontend application
2. [ ] Navigate to contact form
3. [ ] Fill in all fields
4. [ ] Submit form
5. [ ] See success message
6. [ ] No error messages in console

### Verify Full Flow
1. [ ] Contact submitted from frontend
2. [ ] Backend receives and validates
3. [ ] Data saved to MongoDB
4. [ ] Admin receives email
5. [ ] Data visible in MongoDB

---

## Phase 10: Error Handling

### Test Validation Errors
- [ ] Submit with missing fields → See validation error
- [ ] Submit with invalid email → See validation error
- [ ] Submit with short message → See validation error
- [ ] Submit with long name → See validation error

### Test Database Unavailability
- [ ] Stop MongoDB
- [ ] Submit form
- [ ] See "Database unavailable" message
- [ ] Email still sent if database down (graceful fallback)

### Test Email Errors
- [ ] Invalid email credentials → Clear error message
- [ ] Wrong app password → Clear error message
- [ ] Email service down → Graceful handling

---

## Phase 11: Production Preparation

### Security
- [ ] `.env` file is NOT in git (check `.gitignore`)
- [ ] Secrets are not hardcoded in code
- [ ] MONGODB_URI uses strong password
- [ ] ADMIN_JWT_SECRET is secure random string
- [ ] EMAIL_PASS is app-specific, not main password

### Performance
- [ ] Database indexes created (automatic)
- [ ] Connection pooling configured (automatic)
- [ ] Query optimization (automatic with Mongoose)

### Monitoring
- [ ] Server logs show connection status
- [ ] Error messages are descriptive
- [ ] Validation messages are user-friendly

---

## Phase 12: Deployment

### Before Deploying
- [ ] All local tests pass
- [ ] `.env` configured for production
- [ ] MongoDB Atlas cluster ready
- [ ] Email credentials verified
- [ ] Frontend API URL configured

### Deploy Backend
- [ ] Push code to repository (`.env` excluded)
- [ ] Deploy to hosting (Vercel, Heroku, etc.)
- [ ] Set production environment variables
- [ ] Verify "MongoDB connected successfully" in logs

### Verify Deployment
- [ ] Backend accessible at production URL
- [ ] Contact form endpoint works
- [ ] Email notifications working
- [ ] Data persists in MongoDB

---

## Quick Troubleshooting

| Issue | Checklist |
|-------|-----------|
| "MongoDB connection failed" | ✓ MONGODB_URI correct ✓ MongoDB running ✓ IP whitelisted |
| "Email not sending" | ✓ EMAIL_USER correct ✓ EMAIL_PASS is app-specific ✓ 2FA enabled |
| "Route not found" | ✓ Server started ✓ API_BASE correct ✓ Port accessible |
| "Validation errors" | ✓ All fields provided ✓ Email format valid ✓ Message length correct |
| "Data not saving" | ✓ MongoDB running ✓ Connection string valid ✓ Database writable |

---

## Final Verification

- [ ] All files properly updated
- [ ] All dependencies installed
- [ ] MongoDB connected
- [ ] Environment variables configured
- [ ] Server starts without errors
- [ ] Contact form submits successfully
- [ ] Admin receives emails
- [ ] Data visible in MongoDB
- [ ] All CRUD operations work
- [ ] Ready for production

---

## ✅ Setup Complete!

When all checkboxes are checked, you're ready to:
- ✅ Accept contact form submissions
- ✅ Store in MongoDB
- ✅ Send admin notifications
- ✅ Manage contacts via API

**Congratulations!** 🎉
