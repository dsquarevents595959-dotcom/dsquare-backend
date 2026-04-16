const express = require('express');
const { upload, cloudinary } = require('../middleware/cloudinary');
const { verifyToken } = require('./admin');
const Media = require('../models/Media');
const router = express.Router();

// Upload single file
router.post('/single', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Extract public_id from Cloudinary URL
    const publicId = req.file.filename || req.file.path.split('/').pop().split('.')[0];

    // Save to database
    const media = new Media({
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: req.file.path,
      public_id: publicId,
      uploadedBy: req.admin.email || req.admin.id,
      category: req.body.category || 'general',
      description: req.body.description || '',
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
    });

    await media.save();

    res.json({
      success: true,
      data: {
        id: media._id,
        url: req.file.path,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        public_id: publicId,
        category: media.category,
        uploadedAt: media.createdAt
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// Upload multiple files
router.post('/multiple', verifyToken, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const savedMedia = [];

    for (const file of req.files) {
      const publicId = file.filename || file.path.split('/').pop().split('.')[0];
      
      const media = new Media({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: file.path,
        public_id: publicId,
        uploadedBy: req.admin.email || req.admin.id,
        category: req.body.category || 'general',
        description: req.body.description || '',
        tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
      });

      await media.save();
      
      savedMedia.push({
        id: media._id,
        url: file.path,
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        public_id: publicId,
        category: media.category,
        uploadedAt: media.createdAt
      });
    }

    res.json({
      success: true,
      data: savedMedia
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// Delete file
router.delete('/:publicId', verifyToken, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);
    
    // Delete from database
    const result = await Media.deleteOne({ public_id: publicId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'File not found in database' });
    }
    
    res.json({
      success: true,
      message: 'File deleted successfully from both Cloudinary and database'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});

module.exports = router;
