const express = require('express');
const { verifyToken } = require('./admin');
const ServiceCard = require('../models/ServiceCard');
const { upload, cloudinary } = require('../middleware/cloudinary');
const router = express.Router();

// Logging middleware for debugging
router.use((req, res, next) => {
  console.log(`[ServiceCards] ${req.method} ${req.path}`);
  next();
});

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
  console.log("[ServiceCards] Test endpoint hit!");
  res.json({ 
    success: true, 
    message: "Service Cards route is working",
    timestamp: new Date().toISOString()
  });
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

// Add new service card
router.post('/', verifyToken, upload.single('media'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    console.log('Admin:', req.admin);

    const { serviceCategory, cardTitle, cardDescription, mediaType, isSubCard, parentCardId, sortOrder } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No media file uploaded' });
    }

    if (!serviceCategory || !cardTitle || !cardDescription) {
      return res.status(400).json({ success: false, message: 'Missing required fields: serviceCategory, cardTitle, cardDescription' });
    }

    const serviceCard = new ServiceCard({
      serviceCategory,
      cardTitle,
      cardDescription,
      mediaType: mediaType || 'image',
      mediaUrl: req.file.path,
      publicId: req.file.filename,
      isSubCard: isSubCard === 'true',
      parentCardId: parentCardId || null,
      sortOrder: parseInt(sortOrder) || 0,
      uploadedBy: req.admin.email || req.admin.id
    });

    await serviceCard.save();

    res.status(201).json({
      success: true,
      data: serviceCard
    });
  } catch (error) {
    console.error('Add service card error:', error);
    res.status(500).json({ success: false, message: 'Failed to add service card', error: error.message });
  }
});

// Update service card with file upload
router.put('/:id', verifyToken, upload.single('media'), async (req, res) => {
  try {
    const { cardTitle, cardDescription, mediaType, isSubCard, parentCardId, sortOrder } = req.body;
    const { id } = req.params;

    // Find the existing card
    const existingCard = await ServiceCard.findById(id);
    if (!existingCard) {
      return res.status(404).json({ success: false, message: 'Service card not found' });
    }

    // Update fields
    const updateData = {
      cardTitle,
      cardDescription,
      mediaType: mediaType || 'image',
      isSubCard: isSubCard === 'true',
      parentCardId: parentCardId || null,
      sortOrder: parseInt(sortOrder) || 0
    };

    // If new file uploaded, update media info and delete old from Cloudinary
    if (req.file) {
      const { cloudinary } = require('../middleware/cloudinary');
      
      // Delete old media from Cloudinary
      if (existingCard.publicId) {
        try {
          await cloudinary.uploader.destroy(existingCard.publicId);
        } catch (cloudinaryError) {
          console.error('Failed to delete old media from Cloudinary:', cloudinaryError);
        }
      }

      updateData.mediaUrl = req.file.path;
      updateData.publicId = req.file.filename;
    }

    const updatedCard = await ServiceCard.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedCard
    });
  } catch (error) {
    console.error('Update service card error:', error);
    res.status(500).json({ success: false, message: 'Failed to update service card' });
  }
});


// Delete service card
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const serviceCard = await ServiceCard.findById(req.params.id);

    if (!serviceCard) {
      return res.status(404).json({ success: false, message: 'Service card not found' });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(serviceCard.publicId);
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
    }

    // Delete from database
    await ServiceCard.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Service card deleted successfully'
    });
  } catch (error) {
    console.error('Delete service card error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete service card' });
  }
});

module.exports = router;
