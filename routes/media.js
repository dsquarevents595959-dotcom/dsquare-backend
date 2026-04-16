const express = require('express');
const { verifyToken } = require('./admin');
const Media = require('../models/Media');
const router = express.Router();

// Get all media with pagination and filtering
router.get('/', verifyToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      mimetype,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (mimetype) {
      if (mimetype === 'image') {
        filter.mimetype = { $regex: '^image/' };
      } else if (mimetype === 'video') {
        filter.mimetype = { $regex: '^video/' };
      }
    }
    if (search) {
      filter.$or = [
        { originalname: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const media = await Media.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Media.countDocuments(filter);

    res.json({
      success: true,
      data: media,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch media' });
  }
});

// Get media by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error('Get media by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch media' });
  }
});

// Update media metadata
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { category, description, tags, isActive } = req.body;
    
    const updateData = {};
    if (category) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (tags) updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    if (isActive !== undefined) updateData.isActive = isActive;

    const media = await Media.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({ success: false, message: 'Failed to update media' });
  }
});

// Get media statistics
router.get('/stats/overview', verifyToken, async (req, res) => {
  try {
    const stats = await Media.aggregate([
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$size' },
          imageCount: {
            $sum: {
              $cond: [{ $regexMatch: { input: '$mimetype', regex: '^image/' } }, 1, 0]
            }
          },
          videoCount: {
            $sum: {
              $cond: [{ $regexMatch: { input: '$mimetype', regex: '^video/' } }, 1, 0]
            }
          },
          activeFiles: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      }
    ]);

    const categoryStats = await Media.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalFiles: 0,
          totalSize: 0,
          imageCount: 0,
          videoCount: 0,
          activeFiles: 0
        },
        categories: categoryStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

module.exports = router;
