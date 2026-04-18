const express = require('express');
const router = express.Router();
const HeroVideo = require('../models/HeroVideo');
const { verifyToken } = require('../middleware/adminAuth');
const multer = require('multer');
const cloudinary = require('../middleware/cloudinary');

// Get current hero video
router.get('/video', async (req, res) => {
  try {
    let heroVideo = await HeroVideo.findOne({ isActive: true });
    
    // If no hero video exists, create default one
    if (!heroVideo) {
      heroVideo = new HeroVideo({
        videoUrl: 'https://res.cloudinary.com/dycvh4ct7/video/upload/v1745032365/courousel-hero.mp4',
        publicId: 'courousel-hero',
        videoTitle: 'DSquare Events Hero Video',
        isActive: true,
        uploadedBy: 'admin'
      });
      await heroVideo.save();
    }
    
    res.json({
      success: true,
      data: heroVideo
    });
  } catch (error) {
    console.error('Error fetching hero video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero video'
    });
  }
});

// Update hero video
router.put('/video', verifyToken, cloudinary.upload.single('video'), async (req, res) => {
  try {
    const { videoTitle } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    // Deactivate all existing hero videos
    await HeroVideo.updateMany({}, { isActive: false });

    // Create new hero video
    const newHeroVideo = new HeroVideo({
      videoUrl: req.file.path,
      publicId: req.file.filename,
      videoTitle: videoTitle || 'DSquare Events Hero Video',
      isActive: true,
      uploadedBy: 'admin'
    });

    await newHeroVideo.save();

    res.json({
      success: true,
      message: 'Hero video updated successfully',
      data: newHeroVideo
    });
  } catch (error) {
    console.error('Error updating hero video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update hero video'
    });
  }
});

// Delete hero video
router.delete('/video/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const heroVideo = await HeroVideo.findById(id);
    if (!heroVideo) {
      return res.status(404).json({
        success: false,
        message: 'Hero video not found'
      });
    }

    // Delete from Cloudinary
    if (heroVideo.publicId) {
      await cloudinary.uploader.destroy(heroVideo.publicId);
    }

    await HeroVideo.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Hero video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting hero video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hero video'
    });
  }
});

module.exports = router;
