const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

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

module.exports = router;
