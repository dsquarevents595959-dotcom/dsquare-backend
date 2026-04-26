const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Initialize database connection
const connectDB = require("./db");

// Call the database connection function
connectDB();

// Debug environment variables
console.log("=== Environment Variables Debug ===");
console.log("MONGODB_URI:", !!process.env.MONGODB_URI);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("=================================");

const serviceCardsRoutes = require("./routes/serviceCards");
const reviewsRoutes = require("./routes/reviews");

const app = express();

// CORS configuration - must be first middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://www.dsquarevents.com/',
  'https://dsquarevents.com/',
  // 'https://dsquare-frontend.vercel.app/',
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/* ROUTES */
console.log("Loading routes...");
try {
  app.use("/api/services", serviceCardsRoutes);
  console.log("✅ Services routes loaded");
  
  app.use("/api/reviews", reviewsRoutes);
  console.log("✅ Reviews routes loaded");
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