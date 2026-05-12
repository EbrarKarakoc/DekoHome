import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { getCache, setCache, deleteByPattern } from '../services/cache.js';
import { publishToQueue } from '../services/queue.js';

const router = express.Router();
const PRODUCTS_CACHE_KEY = 'products:all';

const mockCategories = [
  { name: 'Oturma Odası', description: 'Koltuk, kanepe, sehpa vb.', icon: 'Sofa' },
  { name: 'Dekorasyon', description: 'Aydınlatma, saat, dekorasyon vb.', icon: 'Sparkles' },
  { name: 'Yatak Odası', description: 'Yatak, komodin, gardırop vb.', icon: 'Bed' },
  { name: 'Mutfak', description: 'Mutfak dolabı, ada vb.', icon: 'Utensils' },
  { name: 'Ofis', description: 'Çalışma masası, ofis koltuğu vb.', icon: 'Briefcase' },
  { name: 'Depolama', description: 'Raf, dolap vb.', icon: 'Package' },
  // Alt kategoriler
  { name: 'Koltuklar', description: 'Kanepe ve berjer modelleri', parentCategoryName: 'Oturma Odası' },
  { name: 'Sehpalar', description: 'Zigon ve orta sehpalar', parentCategoryName: 'Oturma Odası' },
  { name: 'Yataklar', description: 'Ortopedik yataklar', parentCategoryName: 'Yatak Odası' },
  { name: 'Gardıroplar', description: 'Sürgülü ve kapaklı dolaplar', parentCategoryName: 'Yatak Odası' }
];

const mockProductsData = [
  { name: 'Nordic Dinlenme Koltuğu', price: 4250, description: 'Kumaş, Meşe Ayaklar', categoryName: 'Koltuklar', imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80' },
  { name: 'Fjord Orta Sehpa', price: 2750, description: 'Doğal Ahşap, El Yapımı', categoryName: 'Sehpalar', imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80' },
  { name: 'Lumi Sarkıt Avize', price: 1450, description: 'Mat Siyah, İskandinav Stil', categoryName: 'Dekorasyon', imageUrl: 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=800&q=80' },
  { name: 'Minimalist Duvar Saati', price: 850, description: 'Meşe Ahşap Kadran', categoryName: 'Dekorasyon', imageUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Stockholm Üçlü Koltuk', price: 12900, description: 'Premium Antrasit Kumaş', categoryName: 'Koltuklar', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' },
  { name: 'Luxe Kadife Yatak', price: 14999, description: 'Bej - 160x200 cm', categoryName: 'Yataklar', imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80' },
  { name: 'Nordic Meşe Komodin', price: 2450, description: 'Doğal Ahşap', categoryName: 'Yatak Odası', imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80' },
  { name: 'Vera Mutfak Dolabı', price: 24500, description: 'Mat Beyaz - Modüler', categoryName: 'Mutfak', imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Marble Chef Mutfak Adası', price: 18900, description: 'Carrara Mermer - Meşe', categoryName: 'Mutfak', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Minimalist Çalışma Masası', price: 2499, description: 'Doğal Meşe', categoryName: 'Ofis', imageUrl: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=800&q=80' },
  { name: 'Ergonomik Yönetici Koltuğu', price: 4150, description: 'Premium Mesh', categoryName: 'Ofis', imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80' },
  { name: 'Nórdica Gardırop', price: 4299, description: 'Meşe ve Beyaz Lake, 2 Kapaklı', categoryName: 'Gardıroplar', imageUrl: 'https://images.unsplash.com/photo-1595428774223-efda33457007?auto=format&fit=crop&w=800&q=80' },
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

    // Insert top-level categories first
    const topLevelCats = mockCategories.filter(c => !c.parentCategoryName);
    const subCats = mockCategories.filter(c => c.parentCategoryName);

    const insertedTopLevel = await Category.insertMany(topLevelCats);

    // Build map for parent IDs
    const categoryMap = insertedTopLevel.reduce((acc, cat) => {
      acc[cat.name] = cat._id;
      return acc;
    }, {} as Record<string, mongoose.Types.ObjectId>);

    // Prepare subcategories with parentCategoryId
    const subToInsert = subCats.map(sc => ({
      name: sc.name,
      description: sc.description,
      parentCategoryId: categoryMap[sc.parentCategoryName as string]
    }));

    const insertedSubLevel = await Category.insertMany(subToInsert);

    // Final category map including subcategories
    insertedSubLevel.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

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
      categoriesCount: insertedTopLevel.length + insertedSubLevel.length,
      productsCount: insertedProducts.length
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({ message: 'Tohumlama sırasında hata oluştu', error: String(error) });
  }
});

// @route   POST /v1/products
// @desc    Create a new product (Admin only)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    let { name, price, description, stock, categoryId, imageUrl, images } = req.body;

    if (!name || !price || !description || !categoryId) {
      return res.status(400).json({ message: 'Lütfen tüm zorunlu alanları (name, price, description, categoryId) doldurun' });
    }

    // CategoryId doğrulama ve isimle arama desteği
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      const cat = await Category.findOne({ name: categoryId });
      if (cat) {
        categoryId = cat._id;
      } else {
        return res.status(400).json({ message: 'Geçersiz kategori ID veya ismi' });
      }
    } else {
      // ID geçerli olsa bile kategorinin varlığını kontrol et
      const catExists = await Category.findById(categoryId);
      if (!catExists) {
        return res.status(404).json({ message: 'Belirtilen kategori bulunamadı' });
      }
    }

    const finalImages = images && Array.isArray(images) && images.length > 0 ? images : (imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80']);
    const finalImageUrl = imageUrl || finalImages[0];

    // Ürün adı kontrolü (Opsiyonel: Aynı isimde ürün var mı?)
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ message: 'Bu isimde bir ürün zaten mevcut' });
    }

    const product = new Product({
      name,
      price: Number(price),
      description,
      stock: stock !== undefined ? Number(stock) : 10,
      categoryId,
      imageUrl: finalImageUrl,
      images: finalImages
    });

    await product.save();
    // Cache invalidation — yeni ürün eklendi, listeyi temizle
    await deleteByPattern('products:*');

    res.status(201).json({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      desc: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId?.toString(),
      imageUrl: product.imageUrl,
      images: product.images
    });
  } catch (error: any) {
    console.error('❌ POST /products error:', error);
    res.status(400).json({ message: 'Ürün oluşturulamadı', error: error.message });
  }
});

// GET /products
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn("⚠️ Veritabanı bağlı değil, örnek ürün verileri yükleniyor.");
      return res.json({
        products: mockProductsData.map((p, index) => ({
          ...p,
          id: String(index + 1),
          _id: String(index + 1),
          desc: p.description,
          category: p.categoryName,
          // Mock categoryId based on name for offline filtering
          categoryId: p.categoryName === 'Koltuklar' ? '101' :
            p.categoryName === 'Sehpalar' ? '102' :
              p.categoryName === 'Yataklar' ? '201' :
                p.categoryName === 'Gardıroplar' ? '202' : '1',
          stock: 10
        })),
        pagination: { total: mockProductsData.length, page: 1, pages: 1, limit: 100 }
      });
    }

    // ── Redis Cache Kontrolü ──
    // Sadece filtresiz istek (tüm ürünler) cache'lenir
    const hasFilters = req.query.q || req.query.categoryId || req.query.minPrice || req.query.maxPrice;
    if (!hasFilters) {
      const cached = await getCache(PRODUCTS_CACHE_KEY);
      if (cached) {
        console.log('⚡ Redis Cache HIT → products:all');
        return res.json(JSON.parse(cached));
      }
      console.log('🔍 Redis Cache MISS → products:all (DB\'den çekilecek)');
    }

    const { q, categoryId, minPrice, maxPrice, page = '1', limit = '10' } = req.query;

    let query: any = {};

    if (q) {
      query.$or = [
        { name: { $regex: q as string, $options: 'i' } },
        { description: { $regex: q as string, $options: 'i' } }
      ];
    }

    if (categoryId) {
      const categoryIds = Array.isArray(categoryId)
        ? categoryId
        : (typeof categoryId === 'string' && categoryId.includes(',') ? categoryId.split(',') : [categoryId]);

      const validObjectIds: string[] = [];
      const namesToSearch: string[] = [];

      categoryIds.forEach((cat: any) => {
        const catStr = String(cat).trim();
        if (mongoose.Types.ObjectId.isValid(catStr)) {
          validObjectIds.push(catStr);
        } else {
          namesToSearch.push(catStr);
        }
      });

      const finalIds: string[] = [...validObjectIds];
      if (namesToSearch.length > 0) {
        const cats = await Category.find({ name: { $in: namesToSearch } });
        cats.forEach(c => finalIds.push(c._id.toString()));
      }

      if (finalIds.length > 0) {
        if (finalIds.length === 1) {
          query.categoryId = finalIds[0];
        } else {
          query.categoryId = { $in: finalIds };
        }
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 100;
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const responseBody = {
      products: products.map((product: any) => ({
        id: product._id.toString(),
        name: product.name,
        description: product.description,
        desc: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: (product.categoryId as any)?._id?.toString() || product.categoryId?.toString() || null,
        category: (product.categoryId as any)?.name || '',
        imageUrl: product.imageUrl,
        images: product.images && product.images.length > 0 ? product.images : [product.imageUrl]
      })),
      pagination: {
        total,
        page: pageNumber,
        pages: limitNumber > 0 ? Math.ceil(total / limitNumber) : 1,
        limit: limitNumber
      }
    };

    // Filtresiz istekte sonucu Redis'e yaz (60 saniye TTL)
    if (!hasFilters) {
      await setCache(PRODUCTS_CACHE_KEY, JSON.stringify(responseBody), 60);
    }

    res.json(responseBody);
  } catch (error: any) {
    console.error('❌ GET /products error:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// GET /products/:productId
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Geçersiz ürün ID formatı' });
    }

    const product = await Product.findById(productId).populate('categoryId', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    res.json({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      desc: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: (product.categoryId as any)?._id?.toString() || product.categoryId?.toString() || null,
      category: (product.categoryId as any)?.name || '',
      imageUrl: product.imageUrl,
      images: product.images && product.images.length > 0 ? product.images : [product.imageUrl]
    });
  } catch (error: any) {
    console.error('❌ GET /products/:id error:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// PUT /products/:productId
router.put('/:productId', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).json({ message: 'Geçersiz ürün ID formatı' });
    }
    const { name, price, description, stock, categoryId, imageUrl, images } = req.body;

    const updateData: any = { name, price, description, stock, categoryId, imageUrl, images };
    if (images && Array.isArray(images) && images.length > 0) {
      updateData.imageUrl = imageUrl || images[0];
    } else if (imageUrl) {
      updateData.images = [imageUrl];
    }

    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { $set: updateData },
      { new: true }
    );
    // Cache invalidation — ürün güncellendi
    await deleteByPattern('products:*');

    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    res.json({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      desc: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId?.toString() || null,
      imageUrl: product.imageUrl,
      images: product.images
    });
  } catch (error: any) {
    console.error('❌ PUT /products/:id error:', error);
    res.status(400).json({ message: 'Geçersiz istek verisi', error: error.message });
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

    // Cache invalidation — ürün silindi
    await deleteByPattern('products:*');

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

    // ── RabbitMQ: Yorum ekleme bildirimi kuyruğa gönder ──
    await publishToQueue('review_notifications', {
      reviewId: review._id.toString(),
      productId: req.params.productId,
      userId: req.user?.userId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    });

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
