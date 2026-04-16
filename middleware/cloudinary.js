const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Validate Cloudinary configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ CLOUDINARY CONFIGURATION ERROR:');
  console.error('Missing required environment variables:');
  console.error('  - CLOUDINARY_CLOUD_NAME:', !!process.env.CLOUDINARY_CLOUD_NAME);
  console.error('  - CLOUDINARY_API_KEY:', !!process.env.CLOUDINARY_API_KEY);
  console.error('  - CLOUDINARY_API_SECRET:', !!process.env.CLOUDINARY_API_SECRET);
  if (process.env.CLOUDINARY_API_SECRET) {
    console.error('  - API_SECRET length:', process.env.CLOUDINARY_API_SECRET.length, '(should be ~40 characters)');
  }
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('✅ Cloudinary configured:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key_length: process.env.CLOUDINARY_API_KEY?.length,
  api_secret_length: process.env.CLOUDINARY_API_SECRET?.length
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    return {
      folder: 'dsquarevents',
      allowed_formats: isVideo ? ['mp4', 'mov', 'avi', 'webm'] : ['jpg', 'jpeg', 'png', 'gif'],
      resource_type: isVideo ? 'video' : 'image',
      public_id: file.fieldname + '-' + uniqueSuffix
    };
  }
});

// Initialize upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit (Cloudinary free tier limit)
  },
  fileFilter: (req, file, cb) => {
    // Accept specific image formats
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    // Accept specific video formats
    const videoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    
    if (imageTypes.includes(file.mimetype) || videoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF images and MP4, MOV, AVI, WEBM videos are allowed'), false);
    }
  }
});

module.exports = { cloudinary, upload };
