import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Review from '../models/Review.js';

dotenv.config();

const mockReviews = [
  { rating: 5, comment: "Harika bir ürün, kalitesi gerçekten beklediğimden çok daha iyi. Kesinlikle tavsiye ederim." },
  { rating: 4, comment: "Fiyat/performans açısından gayet başarılı. Rengi fotoğraftaki gibi canli." },
  { rating: 5, comment: "Paketleme çok özenliydi ve zamanında teslim edildi. Evime çok yakıştı!" },
  { rating: 3, comment: "İdare eder bir ürün, kurulumu biraz zor oldu ama sonuç fena değil." },
  { rating: 5, comment: "Mükemmel tasarım! İskandinav tarzını yansıtan detayları çok şık." }
];

const mockUsers = [
  { name: "Ayşe Yılmaz", email: "ayse@example.com", password: "password123" },
  { name: "Mehmet Demir", email: "mehmet@example.com", password: "password123" },
  { name: "Canan Şahin", email: "canan@example.com", password: "password123" }
];

const seedReviews = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
      console.error("❌ MONGODB_URI is missing or invalid. Cannot seed reviews.");
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected for Seeding Reviews');

    // Create users if they don't exist
    let users = await User.find({ email: { $in: mockUsers.map(u => u.email) } });
    if (users.length === 0) {
      console.log('👤 Creating mock users...');
      const hashedUsers = await Promise.all(mockUsers.map(async u => ({
        ...u,
        password: await bcrypt.hash(u.password, 10)
      })));
      users = await User.insertMany(hashedUsers);
    }

    // Get all products
    const products = await Product.find();
    if (products.length === 0) {
      console.log('⚠️ No products found. Run seed.ts first.');
      process.exit(1);
    }

    // Clear existing reviews
    await Review.deleteMany({});
    console.log('🗑️  Cleared existing reviews');

    // Insert new reviews randomly for products
    const reviewsToInsert = [];
    for (const product of products) {
      // Add 2-3 reviews per product
      const numReviews = Math.floor(Math.random() * 2) + 2; 
      for (let i = 0; i < numReviews; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomReviewContent = mockReviews[Math.floor(Math.random() * mockReviews.length)];
        
        reviewsToInsert.push({
          productId: product._id,
          userId: randomUser._id,
          rating: randomReviewContent.rating,
          comment: randomReviewContent.comment
        });
      }
    }

    await Review.insertMany(reviewsToInsert);
    console.log(`🌱 Successfully seeded ${reviewsToInsert.length} reviews for ${products.length} products!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
    process.exit(1);
  }
};

seedReviews();
