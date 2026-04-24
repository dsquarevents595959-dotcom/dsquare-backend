const express = require("express");
const router = express.Router();
// const cmsStore = require("../cmsStore");
const { getAdminCredentials, signToken, verifyToken } = require("../middleware/adminAuth");

// Test route to verify admin routes are loaded
router.get("/test", (req, res) => {
  // console.log("Admin test route accessed");
  res.json({ 
    ok: true, 
    message: "Admin routes are working", 
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Enhanced login route with comprehensive error handling
router.post("/login", async (req, res) => {
  try {
    // console.log("Admin login attempt started");
    
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ 
        ok: false, 
        message: "Invalid request format" 
      });
    }

    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "").trim();
    
    // console.log("Login attempt - Email provided:", !!email, "Password provided:", !!password);
    
    // Get admin credentials
    const { email: adminEmail, password: adminPass } = getAdminCredentials();
    // console.log("Expected admin email:", adminEmail);
    
    // Validate environment variables
    if (!process.env.ADMIN_JWT_SECRET) {
      console.error("JWT_SECRET environment variable is missing!");
      return res.status(500).json({ 
        ok: false, 
        message: "Server configuration error - JWT secret not set" 
      });
    }
    
    // Validate credentials
    if (!email || !password) {
      return res.status(400).json({ 
        ok: false, 
        message: "Email and password are required" 
      });
    }
    
    if (email !== adminEmail || password !== adminPass) {
      console.log("Login failed: invalid credentials");
      return res.status(401).json({ 
        ok: false, 
        message: "Invalid email or password" 
      });
    }
    
    // Generate token
    const token = signToken();
    // console.log("Login successful, token generated");
    
    res.json({ 
      ok: true, 
      token,
      message: "Login successful",
      expiresIn: "7d"
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      ok: false, 
      message: "Server error during login" 
    });
  }
});

// Enhanced me route
router.get("/me", verifyToken, (req, res) => {
  try {
    res.json({ 
      ok: true, 
      admin: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Me route error:", error);
    res.status(500).json({ 
      ok: false, 
      message: "Server error" 
    });
  }
});


// Contact Info Routes
const ContactInfo = require("../models/ContactInfo");

// GET contact info
router.get("/contact-info", verifyToken, async (req, res) => {
  try {
    console.log("Admin contact info GET route accessed");
    let contactInfo = await ContactInfo.findOne();
    
    if (!contactInfo) {
      // Create default contact info if it doesn't exist
      contactInfo = new ContactInfo();
      await contactInfo.save();
    }
    
    res.json({ 
      ok: true, 
      contactInfo,
      message: "Contact info retrieved successfully"
    });
  } catch (error) {
    console.error("Error getting contact info:", error);
    res.status(500).json({ 
      ok: false, 
      message: "Failed to get contact info: " + error.message 
    });
  }
});

// UPDATE contact info
router.put("/contact-info", verifyToken, async (req, res) => {
  try {
    console.log("Admin contact info PUT route accessed");
    const { phone, email, address, facebook, whatsapp, instagram, youtube } = req.body;
    
    let contactInfo = await ContactInfo.findOne();
    
    if (!contactInfo) {
      contactInfo = new ContactInfo();
    }
    
    if (phone) contactInfo.phone = phone;
    if (email) contactInfo.email = email;
    if (address) contactInfo.address = address;
    if (facebook) contactInfo.facebook = facebook;
    if (whatsapp) contactInfo.whatsapp = whatsapp;
    if (instagram) contactInfo.instagram = instagram;
    if (youtube) contactInfo.youtube = youtube;
    
    contactInfo.updatedAt = new Date();
    contactInfo.updatedBy = req.admin.email || 'admin';
    
    await contactInfo.save();
    
    res.json({ 
      ok: true, 
      contactInfo,
      message: "Contact info updated successfully"
    });
  } catch (error) {
    console.error("Error updating contact info:", error);
    res.status(500).json({ 
      ok: false, 
      message: "Failed to update contact info: " + error.message 
    });
  }
});

module.exports = router;
