const express = require('express');
const ServiceCard = require('../models/ServiceCard');
const router = express.Router();

// Logging middleware for debugging
router.use((req, res, next) => {
  console.log(`[ServiceCards] ${req.method} ${req.path}`);
  next();
});

// Get all categories with card counts - MUST be before /:category route
router.get('/categories/overview', async (req, res) => {
  try {
    console.log("[ServiceCards] Fetching categories overview");
    const categories = await ServiceCard.aggregate([
      {
        $match: { isSubCard: false }
      },
      {
        $group: {
          _id: '$serviceCategory',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      }
    ]);

    console.log(`[ServiceCards] Found ${categories.length} categories`);
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories overview', error: error.message });
  }
});

// Get all service cards by category
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { includeInactive = false } = req.query;
    
    console.log(`[ServiceCards] Fetching cards for category: ${category}, includeInactive: ${includeInactive}`);

    const filter = { 
      serviceCategory: category,
      isSubCard: false
    };

    if (includeInactive !== 'true') {
      filter.isActive = true;
    }

    console.log(`[ServiceCards] Filter:`, filter);
    
    const cards = await ServiceCard.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();

    console.log(`[ServiceCards] Found ${cards.length} cards for ${category}`);

    res.json({
      success: true,
      data: cards
    });
  } catch (error) {
    console.error('Get service cards error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch service cards', error: error.message });
  }
});

// Get sub-cards for a parent card
router.get('/sub-cards/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;
    const { includeInactive = false } = req.query;

    const filter = { 
      parentCardId: parentId,
      isSubCard: true
    };

    if (includeInactive !== 'true') {
      filter.isActive = true;
    }

    const subCards = await ServiceCard.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();

    res.json({
      success: true,
      data: subCards
    });
  } catch (error) {
    console.error('Get sub-cards error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sub-cards' });
  }
});

module.exports = router;
