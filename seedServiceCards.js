const mongoose = require('mongoose');
const ServiceCard = require('./models/ServiceCard');
require('dotenv').config();

const sampleServiceCards = [
  // Weddings
  {
    serviceCategory: 'weddings',
    cardTitle: 'Flower Decoration',
    cardDescription: 'Beautiful floral arrangements for your special day',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'weddings/flower-decoration',
    sortOrder: 1,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'weddings',
    cardTitle: 'Haldi Flower Decoration',
    cardDescription: 'Traditional haldi ceremony with vibrant flower decorations',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'weddings/haldi-decoration',
    sortOrder: 2,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'weddings',
    cardTitle: 'Mehandi Flower Decoration',
    cardDescription: 'Elegant mehandi ceremony adorned with flowers',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'weddings/mehandi-decoration',
    sortOrder: 3,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'weddings',
    cardTitle: 'Reception Flower Decoration',
    cardDescription: 'Stunning reception venue floral decorations',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'weddings/reception-decoration',
    sortOrder: 4,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'weddings',
    cardTitle: 'Half Saree Flower Decoration',
    cardDescription: 'Traditional half saree ceremony with floral themes',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'weddings/half-saree-decoration',
    sortOrder: 5,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'weddings',
    cardTitle: 'Cloth Decoration',
    cardDescription: 'Luxurious fabric and cloth decorations',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'weddings/cloth-decoration',
    sortOrder: 6,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'weddings',
    cardTitle: 'Passage Decoration',
    cardDescription: 'Beautifully decorated walkways and passages',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'weddings/passage-decoration',
    sortOrder: 7,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'weddings',
    cardTitle: 'Arch Decoration',
    cardDescription: 'Stunning ceremonial arches and entryways',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'weddings/arch-decoration',
    sortOrder: 8,
    uploadedBy: 'admin@dsquarevents.com'
  },

  // Birthdays
  {
    serviceCategory: 'birthdays',
    cardTitle: '1st Birthday',
    cardDescription: 'Special first birthday celebration services',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'birthdays/1st-birthday',
    sortOrder: 1,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'birthdays',
    cardTitle: 'Any Birthday',
    cardDescription: 'General birthday celebration services',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'birthdays/any-birthday',
    sortOrder: 2,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'birthdays',
    cardTitle: 'Vuyyala',
    cardDescription: 'Traditional vuyyala ceremony services',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'birthdays/vuyyala',
    sortOrder: 3,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'birthdays',
    cardTitle: 'Corporate Event',
    cardDescription: 'Professional corporate birthday event services',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'birthdays/corporate-event',
    sortOrder: 4,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'birthdays',
    cardTitle: 'Cloth Decoration',
    cardDescription: 'Beautiful cloth decorations for birthday events',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'birthdays/cloth-decoration',
    sortOrder: 5,
    uploadedBy: 'admin@dsquarevents.com'
  },

  // Grand Entry
  {
    serviceCategory: 'grand-entry',
    cardTitle: 'Flower Decoration',
    cardDescription: 'Beautiful floral arrangements for grand entrance',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'grand-entry/flower-decoration',
    sortOrder: 1,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'grand-entry',
    cardTitle: 'Haldi Flower Decoration',
    cardDescription: 'Traditional haldi ceremony with vibrant flowers',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'grand-entry/haldi-decoration',
    sortOrder: 2,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'grand-entry',
    cardTitle: 'Mehandi Flower Decoration',
    cardDescription: 'Elegant mehandi ceremony adorned with flowers',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'grand-entry/mehandi-decoration',
    sortOrder: 3,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'grand-entry',
    cardTitle: 'Reception Flower Decoration',
    cardDescription: 'Stunning reception venue floral decorations',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'grand-entry/reception-decoration',
    sortOrder: 4,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'grand-entry',
    cardTitle: 'Half Saree Flower Decoration',
    cardDescription: 'Traditional half saree ceremony with floral themes',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'grand-entry/half-saree-decoration',
    sortOrder: 5,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'grand-entry',
    cardTitle: 'Cloth Decoration',
    cardDescription: 'Luxurious fabric and cloth decorations',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'grand-entry/cloth-decoration',
    sortOrder: 6,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'grand-entry',
    cardTitle: 'Passage Decoration',
    cardDescription: 'Beautifully decorated walkways and passages',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'grand-entry/passage-decoration',
    sortOrder: 7,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'grand-entry',
    cardTitle: 'Arch Decoration',
    cardDescription: 'Stunning ceremonial arches and entryways',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'grand-entry/arch-decoration',
    sortOrder: 8,
    uploadedBy: 'admin@dsquarevents.com'
  },

  // Entertainment
  {
    serviceCategory: 'entertainment',
    cardTitle: 'Anchor',
    cardDescription: 'Professional event anchor and host services',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'entertainment/anchor',
    sortOrder: 1,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'entertainment',
    cardTitle: 'Dancers',
    cardDescription: 'Professional dance performances for your events',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'entertainment/dancers',
    sortOrder: 2,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'entertainment',
    cardTitle: 'Singers',
    cardDescription: 'Live musical performances and singing acts',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'entertainment/singers',
    sortOrder: 3,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'entertainment',
    cardTitle: 'Live Band',
    cardDescription: 'Professional live band performances',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'entertainment/live-band',
    sortOrder: 4,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'entertainment',
    cardTitle: 'Magician',
    cardDescription: 'Amazing magic shows and performances',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'entertainment/magician',
    sortOrder: 5,
    uploadedBy: 'admin@dsquarevents.com'
  },

  // Stalls
  {
    serviceCategory: 'stalls',
    cardTitle: 'Mehandi',
    cardDescription: 'Traditional mehandi services with beautiful decorations',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'stalls/mehandi',
    sortOrder: 1,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'stalls',
    cardTitle: 'Nail Art',
    cardDescription: 'Professional nail art services and designs',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'stalls/nail-art',
    sortOrder: 2,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'stalls',
    cardTitle: 'Food Stalls',
    cardDescription: 'Complete food stall setup for your events',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'stalls/food-stalls',
    sortOrder: 3,
    uploadedBy: 'admin@dsquarevents.com'
  },

  // DJ & Lighting & Visual
  {
    serviceCategory: 'dj-lighting-visual',
    cardTitle: 'House Lighting',
    cardDescription: 'Professional house lighting services',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'dj-lighting/house-lighting',
    sortOrder: 1,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'dj-lighting-visual',
    cardTitle: 'Any Event Lighting',
    cardDescription: 'Custom lighting solutions for any event type',
    mediaType: 'image',
    mediaUrl: 'https://picsum.photos/seed/weddings/400/300.jpg',
    publicId: 'dj-lighting/any-event-lighting',
    sortOrder: 2,
    uploadedBy: 'admin@dsquarevents.com'
  },
  // Sample video entries for testing
  {
    serviceCategory: 'weddings',
    cardTitle: 'Wedding Ceremony Video',
    cardDescription: 'Professional wedding ceremony video coverage',
    mediaType: 'video',
    mediaUrl: 'https://archive.org/download/BigBuckBunny_328/BigBuckBunny_328_512kb.mp4',
    publicId: 'weddings/wedding-ceremony-video',
    sortOrder: 9,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'entertainment',
    cardTitle: 'Dance Performance Video',
    cardDescription: 'Amazing dance performance video showcase',
    mediaType: 'video',
    mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    publicId: 'entertainment/dance-performance-video',
    sortOrder: 6,
    uploadedBy: 'admin@dsquarevents.com'
  },
  {
    serviceCategory: 'dj-lighting-visual',
    cardTitle: 'DJ Performance Video',
    cardDescription: 'Professional DJ performance with lighting effects',
    mediaType: 'video',
    mediaUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    publicId: 'dj-lighting/dj-performance-video',
    sortOrder: 3,
    uploadedBy: 'admin@dsquarevents.com'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing data
    await ServiceCard.deleteMany({});
    
    // Insert sample data
    await ServiceCard.insertMany(sampleServiceCards);
    
    console.log('✅ Database seeded with sample service cards');
    console.log(`📊 Total cards inserted: ${sampleServiceCards.length}`);
    
    // Disconnect
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run the seeding function
seedDatabase();
