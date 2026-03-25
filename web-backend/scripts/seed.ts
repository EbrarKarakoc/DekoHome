import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

// Load environment variables
dotenv.config();

const mockCategories = [
  { name: 'Oturma Odası', description: 'Koltuk, kanepe, sehpa vb.' },
  { name: 'Aksesuar', description: 'Aydınlatma, dekorasyon vb.' },
  { name: 'Yatak Odası', description: 'Yatak, komodin, gardırop vb.' },
  { name: 'Mutfak', description: 'Mutfak dolabı, ada vb.' },
  { name: 'Ofis', description: 'Çalışma masası, ofis koltuğu vb.' },
  { name: 'Depolama', description: 'Raf, dolap vb.' }
];

const mockProductsData = [
  { name: 'Nordic Dinlenme Koltuğu', price: 4250, description: 'Kumaş, Meşe Ayaklar', categoryName: 'Oturma Odası', imageUrl: '/products/nordic_lounge_chair.png' },
  { name: 'Fjord Orta Sehpa', price: 2750, description: 'Doğal Ahşap, El Yapımı', categoryName: 'Oturma Odası', imageUrl: '/products/fjord_coffee_table.png' },
  { name: 'Lumi Sarkıt Avize', price: 1450, description: 'Mat Siyah, İskandinav Stil', categoryName: 'Aksesuar', imageUrl: '/products/lumi_pendant_light.png' },
  { name: 'Stockholm Üçlü Koltuk', price: 12900, description: 'Premium Antrasit Kumaş', categoryName: 'Oturma Odası', imageUrl: '/products/stockholm_sofa.png' },
  { name: 'Luxe Kadife Yatak', price: 14999, description: 'Bej - 160x200 cm', categoryName: 'Yatak Odası', imageUrl: '/products/luxe_velvet_bed.png' },
  { name: 'Nordic Meşe Komodin', price: 2450, description: 'Doğal Ahşap', categoryName: 'Yatak Odası', imageUrl: '/products/nordic_oak_nightstand.png' },
  { name: 'Vera Mutfak Dolabı', price: 24500, description: 'Mat Beyaz - Modüler', categoryName: 'Mutfak', imageUrl: '/products/vera_kitchen_cabinet.png' },
  { name: 'Marble Chef Mutfak Adası', price: 18900, description: 'Carrara Mermer - Meşe', categoryName: 'Mutfak', imageUrl: '/products/marble_kitchen_island.png' },
  { name: 'Minimalist Çalışma Masası', price: 2499, description: 'Doğal Meşe', categoryName: 'Ofis', imageUrl: '/products/minimalist_office_desk.png' },
  { name: 'Ergonomik Yönetici Koltuğu', price: 4150, description: 'Premium Mesh', categoryName: 'Ofis', imageUrl: '/products/ergonomic_office_chair.png' },
  { name: 'Nórdica Gardırop', price: 4299, description: 'Meşe ve Beyaz Lake, 2 Kapaklı', categoryName: 'Depolama', imageUrl: '/products/nordica_wardrobe.png' },
  { name: 'Industrial Raf Ünitesi', price: 1850, description: 'Siyah Metal ve Masif Ahşap', categoryName: 'Depolama', imageUrl: '/products/industrial_shelf.png' },
];

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
      console.error("❌ MONGODB_URI is missing or invalid. Cannot seed database.");
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected for Seeding');

    // Clear existing data
    await Product.deleteMany();
    await Category.deleteMany();
    console.log('🗑️  Cleared existing products and categories');

    // Insert categories
    const insertedCategories = await Category.insertMany(mockCategories);
    console.log('🌱 Successfully seeded categories');

    // Map category names to their new ObjectIds
    const categoryMap = insertedCategories.reduce((acc, cat) => {
      acc[cat.name] = cat._id;
      return acc;
    }, {} as Record<string, mongoose.Types.ObjectId>);

    // Prepare products with categoryId
    const productsToInsert = mockProductsData.map(p => {
      const { categoryName, ...rest } = p;
      return {
        ...rest,
        categoryId: categoryMap[categoryName]
      };
    });

    // Insert products
    await Product.insertMany(productsToInsert);
    console.log('🌱 Successfully seeded database with mock products');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
