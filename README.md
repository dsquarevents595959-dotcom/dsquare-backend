# Dsquare Events Backend API

A clean, minimal Express.js API for serving services and reviews data.

## Overview
This backend provides only essential endpoints for the Dsquare Events website. All admin functionality has been removed for a simple, secure deployment.

## Available Endpoints

### Services
- `GET /api/services/:category` - Get services by category
- `GET /api/services/categories/overview` - Get categories overview

### Reviews
- `GET /api/reviews` - Get all active reviews

### Health
- `GET /api/health` - API health check
- `GET /` - Root endpoint with server info

## Categories
Services are organized by these categories:
- `weddings`
- `birthdays`
- `grand-entry`
- `entertainment`
- `stalls`
- `dj-lighting-visual`

## Environment Variables
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dsquare-events?retryWrites=true&w=majority
NODE_ENV=production
PORT=5000
```

## Database Models

### ServiceCard
```javascript
{
  serviceCategory: String (required),
  cardTitle: String (required),
  cardDescription: String (required),
  mediaType: String (enum: ['image', 'video']),
  mediaUrl: String (required),
  isActive: Boolean (default: true),
  sortOrder: Number (default: 0),
  isSubCard: Boolean (default: false),
  parentCardId: ObjectId (optional),
  tags: [String]
}
```

### Review
```javascript
{
  name: String (required),
  date: String (required),
  rating: Number (1-5, required),
  quote: String (required),
  response: String (required),
  avatar: String (required),
  isActive: Boolean (default: true),
  sortOrder: Number (default: 0)
}
```

## Deployment
This backend is configured for deployment on Render using the `render.yaml` file.

## Development
```bash
npm install
npm run dev
```

## Production
```bash
npm install
npm start
```

## Features Removed
- Admin authentication
- File upload functionality
- Cloudinary integration
- Admin dashboard APIs
- Contact form APIs
- Hero video management

## Security
- No authentication required (public API)
- CORS configured for frontend domains
- Input validation on all endpoints
- Error handling with proper HTTP status codes
