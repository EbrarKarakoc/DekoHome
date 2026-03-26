import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

const mockCategories = [
  { name: 'Oturma Odası', description: 'Koltuk, kanepe, sehpa vb.' },
  { name: 'Dekorasyon', description: 'Aydınlatma, saat, dekorasyon vb.' },
  { name: 'Yatak Odası', description: 'Yatak, komodin, gardırop vb.' },
  { name: 'Mutfak', description: 'Mutfak dolabı, ada vb.' },
  { name: 'Ofis', description: 'Çalışma masası, ofis koltuğu vb.' },
  { name: 'Depolama', description: 'Raf, dolap vb.' }
];

const mockProductsData = [
  { name: 'Nordic Dinlenme Koltuğu', price: 4250, description: 'Kumaş, Meşe Ayaklar', categoryName: 'Oturma Odası', imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80' },
  { name: 'Fjord Orta Sehpa', price: 2750, description: 'Doğal Ahşap, El Yapımı', categoryName: 'Oturma Odası', imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80' },
  { name: 'Lumi Sarkıt Avize', price: 1450, description: 'Mat Siyah, İskandinav Stil', categoryName: 'Dekorasyon', imageUrl: 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=800&q=80' },
  { name: 'Minimalist Duvar Saati', price: 850, description: 'Meşe Ahşap Kadran', categoryName: 'Dekorasyon', imageUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Stockholm Üçlü Koltuk', price: 12900, description: 'Premium Antrasit Kumaş', categoryName: 'Oturma Odası', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' },
  { name: 'Luxe Kadife Yatak', price: 14999, description: 'Bej - 160x200 cm', categoryName: 'Yatak Odası', imageUrl: 'https://images.unsplash.com/photo-1505673466370-e14514755291?auto=format&fit=crop&w=800&q=80' },
  { name: 'Nordic Meşe Komodin', price: 2450, description: 'Doğal Ahşap', categoryName: 'Yatak Odası', imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80' },
  { name: 'Vera Mutfak Dolabı', price: 24500, description: 'Mat Beyaz - Modüler', categoryName: 'Mutfak', imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Marble Chef Mutfak Adası', price: 18900, description: 'Carrara Mermer - Meşe', categoryName: 'Mutfak', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Minimalist Çalışma Masası', price: 2499, description: 'Doğal Meşe', categoryName: 'Ofis', imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80' },
  { name: 'Ergonomik Yönetici Koltuğu', price: 4150, description: 'Premium Mesh', categoryName: 'Ofis', imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80' },
  { name: 'Nórdica Gardırop', price: 4299, description: 'Meşe ve Beyaz Lake, 2 Kapaklı', categoryName: 'Depolama', imageUrl: 'https://images.unsplash.com/photo-1595428774223-efda33457007?auto=format&fit=crop&w=800&q=80' },
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

// POST /products
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, price, description, stock, categoryId, imageUrl } = req.body;

    if (!name || !price || !description || !categoryId) {
      return res.status(400).json({ message: 'Lütfen tüm zorunlu alanları doldurun' });
    }

    const product = new Product({
      name,
      price,
      description,
      stock: stock || 10,
      categoryId,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80'
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Ürün oluşturulamadı' });
  }
});

// GET /products
router.get('/', async (req, res) => {
  try {
    const { q, categoryId, minPrice, maxPrice, page = '1', limit = '10' } = req.query;
    
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

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .skip(skip)
      .limit(limitNumber);
    
    res.json({
      products: products.map((product: any) => ({
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId?._id,
      category: product.categoryId?.name || '',
      imageUrl: product.imageUrl
      })),
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
        limit: limitNumber
      }
    });
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
    const productId = req.params.productId;

    // Aktif bir siparişte bu ürün var mı kontrol et
    const activeOrder = await Order.findOne({
      'items.productId': productId,
      status: { $in: ['Hazırlanıyor', 'Kargoya Verildi'] }
    });

    if (activeOrder) {
      return res.status(400).json({ message: 'Sistem Uyarısı: Bu ürün aktif bir siparişte yer aldığı için silinemez!' });
    }

    const product = await Product.findByIdAndDelete(productId);
    
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

    // Check if user has bought it
    const hasBought = await Order.findOne({
      userId: req.user?.userId,
      'items.productId': req.params.productId,
      status: { $in: ['Onaylandı', 'Hazırlanıyor', 'Kargoya Verildi', 'Teslim Edildi'] }
    });

    if (!hasBought) {
      return res.status(403).json({ message: 'Sadece satın aldığınız ürünlere yorum yapabilirsiniz.' });
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
      userId: req.user?.userId,
      userName: `${req.user?.ad || ''} ${req.user?.soyad || ''}`.trim() || 'Kullanıcı',
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
