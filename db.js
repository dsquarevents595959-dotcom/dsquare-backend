const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI is missing in environment variables!");
      console.error("Available variables:", Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('mongodb')));
      throw new Error("MONGODB_URI is missing in .env");
    }

    console.log("Attempting to connect to MongoDB...");
    console.log("MONGODB_URI starts with:", process.env.MONGODB_URI.substring(0, 30) + "...");

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      retryWrites: true
    });

    console.log("✅ MongoDB Connected Successfully ✅");

  } catch (error) {
    console.error("❌ MongoDB connection failed ❌");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    
    // Log but don't exit - allow API to run without DB for debugging
    console.warn("⚠️  Starting server without DB connection - API calls will fail");
    // Uncomment below to crash on DB failure:
    // process.exit(1);
  }
};

module.exports = connectDB;