const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const router = express.Router();
const Review = require('../models/Review');
const { verifyToken } = require('../middleware/adminAuth');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// GET all active reviews (for frontend)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 });
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// GET all reviews (for admin)
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ sortOrder: 1, createdAt: -1 });
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// POST new review (admin only)
router.post('/', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    const { name, date, rating, quote, response, sortOrder = 0 } = req.body;
    const avatar = req.file ? req.file.path : req.body.avatarUrl;
    
    // Validate required fields
    if (!name || !date || !rating || !quote || !response || !avatar) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const review = new Review({
      name,
      date,
      rating,
      quote,
      response,
      avatar,
      sortOrder,
      addedBy: req.admin.email
    });
    
    await review.save();
    
    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: review
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review'
    });
  }
});

// PUT update review (admin only)
router.put('/:id', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, rating, quote, response, sortOrder, isActive } = req.body;
    const avatar = req.file ? req.file.path : req.body.avatarUrl;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }
    
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Update fields
    if (name) review.name = name;
    if (date) review.date = date;
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
      review.rating = rating;
    }
    if (quote) review.quote = quote;
    if (response) review.response = response;
    if (avatar) review.avatar = avatar;
    if (sortOrder !== undefined) review.sortOrder = sortOrder;
    if (isActive !== undefined) review.isActive = isActive;
    
    await review.save();
    
    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
});

// DELETE review (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
    }
    
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

module.exports = router;

module.exports = router;
