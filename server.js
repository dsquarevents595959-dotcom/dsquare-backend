const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Initialize database connection
const connectDB = require("./db");

// Call the database connection function
connectDB();

// Cleanup old broken video URLs on startup
async function cleanupOldVideoUrls() {
  try {
    const HeroVideo = require("./models/HeroVideo");
    const brokenUrl = 'https://res.cloudinary.com/dycvh4ct7/video/upload/v1745032365/courousel-hero.mp4';
    const workingUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
    
    const result = await HeroVideo.updateMany(
      { videoUrl: brokenUrl },
      { 
        videoUrl: workingUrl,
        publicId: 'default-hero-placeholder',
        videoTitle: 'DSquare Events Hero Video (Placeholder)'
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Cleaned up ${result.modifiedCount} broken video URL(s) in database`);
    }
  } catch (error) {
    console.error('Error cleaning up video URLs:', error);
  }
}

// Run cleanup after a short delay to ensure DB is connected
setTimeout(cleanupOldVideoUrls, 1000);

// Debug environment variables
console.log("=== Environment Variables Debug ===");
console.log("JWT_SECRET:", !!process.env.JWT_SECRET);
console.log("ADMIN_JWT_SECRET:", !!process.env.ADMIN_JWT_SECRET);
console.log("MONGODB_URI:", !!process.env.MONGODB_URI);
console.log("CLOUDINARY_CLOUD_NAME:", !!process.env.CLOUDINARY_CLOUD_NAME);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("=================================");

const contactRoutes = require("./routes/contactRoutes");
// const connectRoutes = require("./routes/ConnectRoute");
// const cmsPublicRoutes = require("./routes/cmsPublicRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { router: adminAuthRoutes } = require("./routes/admin");
const uploadRoutes = require("./routes/upload");
const mediaRoutes = require("./routes/media");
const serviceCardsRoutes = require("./routes/serviceCards");
const emailRoutes = require("./routes/email");
const heroRoutes = require("./routes/hero");
const reviewsRoutes = require("./routes/reviews");

const app = express();

// CORS configuration - must be first middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://www.dsquarevents.com/',
  'https://dsquarevents.com/',
  'https://dsquare-frontend.vercel.app/', // Add your frontend domain
  '*' // Allow all for Vercel compatibility
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Allow anyway for public API
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  maxAge: 86400
};

app.use(cors(corsOptions));

// Explicit CORS headers as fallback for Vercel serverless
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/* BODY PARSER */
// Set limit to 500 MB to allow for video uploads + metadata
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

/* ROUTES */
console.log("Loading routes...");
try {
  app.use("/api/contact", contactRoutes);
  console.log("✅ Contact routes loaded");
  
  // app.use("/api/connect", connectRoutes);
  // console.log("Connect routes loaded");
  
  // app.use("/api/cms", cmsPublicRoutes);
  // console.log("CMS public routes loaded");
  
  app.use("/api/admin", adminRoutes);
  console.log("✅ Admin routes loaded");
  
  app.use("/api/auth", adminAuthRoutes);
  console.log("✅ Admin auth routes loaded");
  
  app.use("/api/upload", uploadRoutes);
  console.log("✅ Upload routes loaded");
  
  app.use("/api/media", mediaRoutes);
  console.log("✅ Media routes loaded");
  
  app.use("/api/service-cards", serviceCardsRoutes);
  console.log("Service cards routes loaded");
  
  app.use("/api/email", emailRoutes);
  console.log("Email routes loaded");
  
  app.use("/api/hero", heroRoutes);
  console.log("Hero routes loaded");
  
  app.use("/api/reviews", reviewsRoutes);
  console.log("Reviews routes loaded");
  console.log("✅ ALL ROUTES LOADED SUCCESSFULLY");
} catch (error) {
  console.error("❌ Error loading routes:", error);
}

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "Dsquare Events Backend API is running", 
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// API health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "API is healthy",
    uptime: process.uptime()
  });
});

// 404 handler - before error handler
app.use((req, res) => {
  console.warn(`404: ${req.method} ${req.path}`);
  res.status(404).json({ success: false, message: 'Route not found', path: req.path });
});

// Error handling middleware - MUST be after all routes and 404 handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  // Handle multer errors
  if (error.name === 'MulterError') {
    return res.status(400).json({ 
      success: false, 
      message: `File upload error: ${error.message}` 
    });
  }
  
  if (error.status === 400) {
    return res.status(400).json({ success: false, message: 'Bad Request' });
  }
  if (error.status === 413) {
    return res.status(413).json({ success: false, message: 'File too large' });
  }
  
  res.status(error.status || 500).json({ 
    success: false, 
    message: error.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log(`✅ Server running successfully!`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log("=".repeat(60) + "\n");
});