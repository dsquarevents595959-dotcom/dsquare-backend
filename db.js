const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000
    });

    console.log("MongoDB Connected ✅");

  } catch (error) {
    console.error("MongoDB connection failed ❌");
    console.error(error.message);

    // Stop app if DB fails (VERY IMPORTANT)
    process.exit(1);
  }
};

module.exports = connectDB;