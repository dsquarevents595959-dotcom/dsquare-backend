const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
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
      console.log(' Updated hero video URL to working placeholder');
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

// Update hero video with Cloudinary connectivity fallback
router.put('/video', verifyToken, cloudinary.upload.single('video'), async (req, res) => {
  try {
    // Set CORS headers for response
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type', 'application/json');
    
    // console.log('[Hero API] PUT /video request received');
    // console.log('[Hero API] Admin:', req.admin);
    // console.log('[Hero API] Request body:', req.body);
    // console.log('[Hero API] File details:', req.file ? {
    //   originalname: req.file.originalname,
    //   mimetype: req.file.mimetype,
    //   size: req.file.size,
    //   path: req.file.path,
    //   filename: req.file.filename
    // } : 'No file');
    
    const { videoTitle } = req.body;
    
    if (!req.file) {
      console.warn('[Hero API] No video file provided');
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    // Validate file type
    const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    if (!allowedVideoTypes.includes(req.file.mimetype)) {
      console.warn('[Hero API] Invalid file type:', req.file.mimetype);
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only MP4, MOV, AVI, and WEBM videos are allowed'
      });
    }

    // Deactivate all existing hero videos
    // console.log('[Hero API] Deactivating existing hero videos...');
    const deactivateResult = await HeroVideo.updateMany({}, { isActive: false });
    //  console.log('[Hero API] Deactivated videos:', deactivateResult.modifiedCount);

    // Create new hero video
    // console.log('[Hero API] Creating new hero video...');
    const newHeroVideo = new HeroVideo({
      videoUrl: req.file.path,
      publicId: req.file.filename,
      videoTitle: videoTitle || 'DSquare Events Hero Video',
      isActive: true,
      uploadedBy: 'admin'
    });

    await newHeroVideo.save();
    // console.log('Success [Hero API] Hero video uploaded successfully:', newHeroVideo._id);

    res.status(200).json({
      success: true,
      message: 'Hero video updated successfully',
      data: newHeroVideo
    });
  } catch (error) {
    console.error('Error [Hero API] Error updating hero video:', error.message);
    console.error('Error [Hero API] Full error details:', error);
    
    // Handle specific multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum size is 100MB for Cloudinary free tier',
        error: error.message
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files',
        error: error.message
      });
    }
    
    // Handle Cloudinary specific errors
    if (error.message && (error.message.includes('Cloudinary') || error.code === 'ETIMEDOUT' || error.code === 'ENETUNREACH')) {
      console.error('[Hero API] Cloudinary connectivity error:', error.message);
      return res.status(503).json({
        success: false,
        message: 'Cloudinary service temporarily unavailable. Please try again later.',
        error: 'Cloudinary connectivity issue',
        retry: true
      });
    }
    
    // Handle Cloudinary 413 errors (file too large for Cloudinary)
    if (error.message && error.message.includes('413') || error.http_code === 413) {
      console.error('[Hero API] Cloudinary file size limit exceeded:', error.message);
      return res.status(413).json({
        success: false,
        message: 'File too large for Cloudinary. Please use a video file under 100MB.',
        error: 'Cloudinary file size limit exceeded',
        max_size: '100MB'
      });
    }
    
    // Handle network connectivity issues
    if (error.code === 'ETIMEDOUT' || error.code === 'ENETUNREACH') {
      console.error('[Hero API] Network connectivity error:', error.message);
      return res.status(503).json({
        success: false,
        message: 'Network connectivity issue. Please check your internet connection.',
        error: 'Network connectivity issue',
        retry: true
      });
    }
    
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
    // console.log('[Hero API] DELETE /video/:id request:', id);
    // console.log('[Hero API] Request params:', req.params);
    
    // Validate ID format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.error('[Hero API] Invalid ID format:', id);
      return res.status(400).json({
        success: false,
        message: 'Invalid video ID format'
      });
    }
    
    const heroVideo = await HeroVideo.findById(id);
    if (!heroVideo) {
      console.warn('[Hero API] Hero video not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Hero video not found'
      });
    }
    
    console.log('[Hero API] Found hero video:', heroVideo._id, 'publicId:', heroVideo.publicId);

    // Delete from Cloudinary
    if (heroVideo.publicId && heroVideo.publicId !== 'courousel-hero') {
      try {
        await cloudinary.uploader.destroy(heroVideo.publicId);
        // console.log('[Hero API] Deleted from Cloudinary:', heroVideo.publicId);
      } catch (cloudinaryError) {
        console.warn('[Hero API] Cloudinary deletion failed:', cloudinaryError.message);
        // Continue with database deletion even if Cloudinary fails
      }
    } else {
      console.log('[Hero API] Skipping Cloudinary deletion for default video:', heroVideo.publicId);
    }

    await HeroVideo.findByIdAndDelete(id);
    // console.log('Success [Hero API] Hero video deleted successfully:', id);

    res.status(200).json({
      success: true,
      message: 'Hero video deleted successfully'
    });
  } catch (error) {
    console.error('Error [Hero API] Error deleting hero video:', error.message);
    console.error('Error [Hero API] Full error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hero video',
      error: error.message
    });
  }
});

module.exports = router;
