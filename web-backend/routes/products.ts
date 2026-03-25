import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

const mockCategories = [
  { name: 'Oturma Odası', description: 'Koltuk, kanepe, sehpa vb.' },
  { name: 'Aksesuar', description: 'Aydınlatma, dekorasyon vb.' },
  { name: 'Yatak Odası', description: 'Yatak, komodin, gardırop vb.' },
  { name: 'Mutfak', description: 'Mutfak dolabı, ada vb.' },
  { name: 'Ofis', description: 'Çalışma masası, ofis koltuğu vb.' },
  { name: 'Depolama', description: 'Raf, dolap vb.' }
];

const mockProductsData = [
  { name: 'Nordic Dinlenme Koltuğu', price: 4250, description: 'Kumaş, Meşe Ayaklar', categoryName: 'Oturma Odası', imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80' },
  { name: 'Fjord Orta Sehpa', price: 2750, description: 'Doğal Ahşap, El Yapımı', categoryName: 'Oturma Odası', imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80' },
  { name: 'Lumi Sarkıt Avize', price: 1450, description: 'Mat Siyah, İskandinav Stil', categoryName: 'Aksesuar', imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a22fd0cca?auto=format&fit=crop&w=800&q=80' },
  { name: 'Stockholm Üçlü Koltuk', price: 12900, description: 'Premium Antrasit Kumaş', categoryName: 'Oturma Odası', imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aef936ce?auto=format&fit=crop&w=800&q=80' },
  { name: 'Luxe Kadife Yatak', price: 14999, description: 'Bej - 160x200 cm', categoryName: 'Yatak Odası', imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80' },
  { name: 'Nordic Meşe Komodin', price: 2450, description: 'Doğal Ahşap', categoryName: 'Yatak Odası', imageUrl: 'https://images.unsplash.com/photo-1532372231-643078ac9eb4?auto=format&fit=crop&w=800&q=80' },
  { name: 'Vera Mutfak Dolabı', price: 24500, description: 'Mat Beyaz - Modüler', categoryName: 'Mutfak', imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Marble Chef Mutfak Adası', price: 18900, description: 'Carrara Mermer - Meşe', categoryName: 'Mutfak', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Minimalist Çalışma Masası', price: 2499, description: 'Doğal Meşe', categoryName: 'Ofis', imageUrl: 'https://images.unsplash.com/photo-1518455027372-b553a8c357b0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Ergonomik Yönetici Koltuğu', price: 4150, description: 'Premium Mesh', categoryName: 'Ofis', imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80' },
  { name: 'Nórdica Gardırop', price: 4299, description: 'Meşe ve Beyaz Lake, 2 Kapaklı', categoryName: 'Depolama', imageUrl: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Industrial Raf Ünitesi', price: 1850, description: 'Siyah Metal ve Masif Ahşap', categoryName: 'Depolama', imageUrl: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=800&q=80' },
];

// @route   GET /api/products/seed
// @desc    Veritabanını örnek ürünlerle doldur
router.get('/seed', async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    if (state === 2) {
      return res.status(503).json({ 
        success: false, 
        message: 'MongoDB bağlantısı şu anda kurulmaya çalışılıyor (Hala bağlanıyor). Eğer bu durum uzun sürüyorsa, MongoDB Atlas\'ta "Network Access" kısmından IP adresinize (0.0.0.0/0) izin verdiğinizden emin olun.' 
      });
    }
    if (state !== 1) {
      return res.status(500).json({ success: false, message: 'MongoDB bağlantısı yok. Lütfen MONGODB_URI ayarını kontrol edin.' });
    }

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    
    // Insert categories
    const insertedCategories = await Category.insertMany(mockCategories);
    
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
    const insertedProducts = await Product.insertMany(productsToInsert);
    
    res.json({ 
      message: 'Veritabanı başarıyla güncellendi!',
      categoriesCount: insertedCategories.length,
      productsCount: insertedProducts.length 
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({ message: 'Tohumlama sırasında hata oluştu', error: String(error) });
  }
});

// POST /products
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, price, description, stock, categoryId, imageUrl } = req.body;

    if (!name || !price || !stock || !categoryId) {
      return res.status(400).json({ message: 'Eksik alanlar var' });
    }

    const product = new Product({
      name,
      price,
      description,
      stock,
      categoryId,
      imageUrl
    });

    await product.save();

    res.status(201).json({
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl
    });
  } catch (error) {
    res.status(400).json({ message: 'Geçersiz istek verisi' });
  }
});

// GET /products
router.get('/', async (req, res) => {
  try {
    const { q, categoryId, minPrice, maxPrice } = req.query;
    
    let query: any = {};
    
    if (q) {
      query.$or = [
        { name: { $regex: q as string, $options: 'i' } },
        { description: { $regex: q as string, $options: 'i' } }
      ];
    }
    
    if (categoryId) {
      query.categoryId = categoryId;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query).populate('categoryId', 'name');
    
    res.json(products.map((product: any) => ({
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId?._id,
      category: product.categoryId?.name || '',
      imageUrl: product.imageUrl
    })));
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// PUT /products/:productId
router.put('/:productId', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, price, description, stock, categoryId, imageUrl } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { $set: { name, price, description, stock, categoryId, imageUrl } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    res.json({
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl
    });
  } catch (error) {
    res.status(400).json({ message: 'Geçersiz istek verisi' });
  }
});

// DELETE /products/:productId
router.delete('/:productId', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// GET /products/:productId/reviews
router.get('/:productId/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    const reviews = await Review.find({ productId: req.params.productId }).populate('userId', 'ad soyad');
    
    res.json(reviews.map((review: any) => ({
      id: review._id,
      productId: review.productId,
      userId: review.userId?._id,
      userName: review.userId ? `${review.userId.ad} ${review.userId.soyad}` : 'Kullanıcı',
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    })));
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// POST /products/:productId/reviews
router.post('/:productId/reviews', authenticate, async (req: AuthRequest, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Eksik alanlar var' });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    const review = new Review({
      productId: req.params.productId,
      userId: req.user?.userId,
      rating,
      comment
    });

    await review.save();

    res.status(201).json({
      id: review._id,
      productId: review.productId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    });
  } catch (error) {
    res.status(400).json({ message: 'Geçersiz istek verisi' });
  }
});

// PUT /products/:productId/reviews/:reviewId
router.put('/:productId/reviews/:reviewId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findOne({
      _id: req.params.reviewId,
      productId: req.params.productId
    });

    if (!review) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }

    if (review.userId.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      return res.status(401).json({ message: 'Kimlik doğrulama başarısız' });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();

    res.json({
      id: review._id,
      productId: review.productId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    });
  } catch (error) {
    res.status(400).json({ message: 'Geçersiz istek verisi' });
  }
});

// DELETE /products/:productId/reviews/:reviewId
router.delete('/:productId/reviews/:reviewId', authenticate, async (req: AuthRequest, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.reviewId,
      productId: req.params.productId
    });

    if (!review) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }

    if (review.userId.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      return res.status(401).json({ message: 'Kimlik doğrulama başarısız' });
    }

    await review.deleteOne();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

export default router;
