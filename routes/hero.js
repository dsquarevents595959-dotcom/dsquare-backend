const express = require('express');
const router = express.Router();
const HeroVideo = require('../models/HeroVideo');
const { verifyToken } = require('../middleware/adminAuth');
const multer = require('multer');
const cloudinary = require('../middleware/cloudinary');

// Health check endpoint - simple test to verify API is accessible
router.get('/health', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  return res.status(200).json({ 
    ok: true, 
    message: 'Hero API is accessible',
    timestamp: new Date().toISOString()
  });
});

// Handle preflight requests for CORS
router.options('/video', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Get current hero video - PUBLIC ENDPOINT (no auth required)
router.get('/video', async (req, res) => {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Content-Type', 'application/json');
    
    let heroVideo = await HeroVideo.findOne({ isActive: true });
    
    // If video has old broken Cloudinary URL, replace it with working placeholder
    if (heroVideo && heroVideo.videoUrl.includes('res.cloudinary.com/dycvh4ct7/video/upload/v1745032365/courousel-hero.mp4')) {
      heroVideo.videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
      heroVideo.publicId = 'default-hero-placeholder';
      heroVideo.videoTitle = 'DSquare Events Hero Video (Placeholder)';
      await heroVideo.save();
      console.log('✅ Updated hero video URL to working placeholder');
    }
    
    // If no hero video exists, create default one
    if (!heroVideo) {
      heroVideo = new HeroVideo({
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        publicId: 'default-hero-placeholder',
        videoTitle: 'DSquare Events Hero Video (Placeholder)',
        isActive: true,
        uploadedBy: 'admin'
      });
      await heroVideo.save();
      console.log('✅ Created default hero video');
    }
    
    return res.status(200).json({
      success: true,
      data: heroVideo
    });
  } catch (error) {
    console.error('❌ Error fetching hero video:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch hero video',
      error: error.message
    });
  }
});

// Update hero video
router.put('/video', verifyToken, cloudinary.upload.single('video'), async (req, res) => {
  try {
    // Set CORS headers for response
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type', 'application/json');
    
    console.log('[Hero API] PUT /video request received');
    console.log('[Hero API] Admin:', req.admin);
    
    const { videoTitle } = req.body;
    
    if (!req.file) {
      console.warn('[Hero API] No video file provided');
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
    console.log('✅ [Hero API] Hero video uploaded successfully:', newHeroVideo._id);

    res.status(200).json({
      success: true,
      message: 'Hero video updated successfully',
      data: newHeroVideo
    });
  } catch (error) {
    console.error('❌ [Hero API] Error updating hero video:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update hero video',
      error: error.message
    });
  }
});

// Delete hero video
router.delete('/video/:id', verifyToken, async (req, res) => {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type', 'application/json');
    
    const { id } = req.params;
    console.log('[Hero API] DELETE /video/:id request:', id);
    
    const heroVideo = await HeroVideo.findById(id);
    if (!heroVideo) {
      console.warn('[Hero API] Hero video not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Hero video not found'
      });
    }

    // Delete from Cloudinary
    if (heroVideo.publicId) {
      await cloudinary.uploader.destroy(heroVideo.publicId);
      console.log('[Hero API] Deleted from Cloudinary:', heroVideo.publicId);
    }

    await HeroVideo.findByIdAndDelete(id);
    console.log('✅ [Hero API] Hero video deleted successfully:', id);

    res.status(200).json({
      success: true,
      message: 'Hero video deleted successfully'
    });
  } catch (error) {
    console.error('❌ [Hero API] Error deleting hero video:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hero video',
      error: error.message
    });
  }
});

module.exports = router;
