const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const mongoose = require("mongoose");

// POST - Create a new contact message
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    // Validation
    if (!name || !phone || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Create new contact document
    const contact = new Contact({
      name,
      phone,
      email,
      subject,
      message
    });

    // Save to MongoDB
    await contact.save();

    res.status(201).json({ 
      success: true, 
      message: "Message saved successfully",
      data: {
        id: contact._id,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error("Endpoint error:", error);
    
    // Mongoose validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: "Validation error",
        errors: messages 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: "Server error: " + error.message 
    });
  }
});

// GET - Retrieve all contact messages (admin only)
router.get("/", async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    
    if (!isConnected) {
      return res.status(503).json({ 
        success: false, 
        message: "Database unavailable" 
      });
    }

    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ 
      success: true, 
      count: contacts.length,
      data: contacts 
    });
  } catch (error) {
    console.error("Error retrieving contacts:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + error.message 
    });
  }
});

// GET - Retrieve a single contact message by ID
router.get("/:id", async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    
    if (!isConnected) {
      return res.status(503).json({ 
        success: false, 
        message: "Database unavailable" 
      });
    }

    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid contact ID" 
      });
    }

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: "Contact not found" 
      });
    }

    res.json({ 
      success: true, 
      data: contact 
    });
  } catch (error) {
    console.error("Error retrieving contact:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + error.message 
    });
  }
});

// PATCH - Update contact status
router.patch("/:id", async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    
    if (!isConnected) {
      return res.status(503).json({ 
        success: false, 
        message: "Database unavailable" 
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid contact ID" 
      });
    }

    // Validate status
    const validStatuses = ["new", "read", "replied"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status. Must be one of: " + validStatuses.join(", ")
      });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ 
        success: false, 
        message: "Contact not found" 
      });
    }

    res.json({ 
      success: true, 
      message: "Contact updated successfully",
      data: updatedContact 
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + error.message 
    });
  }
});

// DELETE - Delete a contact message
router.delete("/:id", async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    
    if (!isConnected) {
      return res.status(503).json({ 
        success: false, 
        message: "Database unavailable" 
      });
    }

    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid contact ID" 
      });
    }

    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({ 
        success: false, 
        message: "Contact not found" 
      });
    }

    res.json({ 
      success: true, 
      message: "Contact deleted successfully",
      data: deletedContact 
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + error.message 
    });
  }
});

module.exports = router;
