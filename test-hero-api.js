// Test script to check hero video API
const mongoose = require('mongoose');
const HeroVideo = require('./models/HeroVideo');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://dsquarevents:Harshitha595959@dsquarevents.xi5g8.mongodb.net/dsquarevents?retryWrites=true&w=majority')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if any hero video exists
      const existingVideo = await HeroVideo.findOne({ isActive: true });
      
      if (existingVideo) {
        console.log('Found existing hero video:', existingVideo);
      } else {
        console.log('No hero video found, creating default...');
        
        // Create default hero video
        const defaultVideo = new HeroVideo({
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          publicId: 'default-hero-placeholder',
          videoTitle: 'DSquare Events Hero Video (Placeholder)',
          isActive: true,
          uploadedBy: 'admin'
        });
        
        await defaultVideo.save();
        console.log('Default hero video created:', defaultVideo);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
  });
