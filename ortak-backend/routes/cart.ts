import express from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { publishToQueue } from '../services/queue.js';

const router = express.Router();

// GET /cart
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn("⚠️ Veritabanı bağlı değil, boş sepet dönülüyor.");
      return res.json({ items: [], total: 0 });
    }

    let cart = await Cart.findOne({ userId: req.user?.userId }).populate('items.productId', 'name imageUrl');
    
    if (!cart) {
      cart = new Cart({ userId: req.user?.userId, items: [], total: 0 });
      await cart.save();
    }

    res.json({
      items: cart.items.map((item: any) => ({
        itemId: item._id,
        productId: item.productId?._id || item.productId,
        name: item.productId?.name || '',
        imageUrl: item.productId?.imageUrl || '',
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price
      })),
      total: cart.total
    });
  } catch (error) {
    console.error('❌ GET /cart error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// POST /cart/items
router.post('/items', authenticate, async (req: AuthRequest, res) => {
  try {
    const { productId, quantity } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Veritabanı bağlı değil. Sepet işlemleri şu an yapılamıyor.' });
    }

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Geçersiz istek verisi' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    let cart = await Cart.findOne({ userId: req.user?.userId });
    if (!cart) {
      cart = new Cart({ userId: req.user?.userId, items: [], total: 0 });
    }

    const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    // Stok kontrolü
    const currentQuantity = existingItemIndex > -1 ? cart.items[existingItemIndex].quantity : 0;
    if (currentQuantity + quantity > product.stock) {
      return res.status(409).json({ message: 'Stok yetersiz. Mevcut stok: ' + product.stock });
    }

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.price
      });
    }

    cart.total = cart.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.productId', 'name imageUrl');

    // ── RabbitMQ: Sepete ürün ekleme bildirimi kuyruğa gönder ──
    await publishToQueue('cart_notifications', {
      userId: req.user?.userId,
      productId,
      productName: product.name,
      quantity,
      price: product.price,
      cartTotal: cart.total,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      items: (populatedCart as any).items.map((item: any) => ({
        itemId: item._id,
        productId: item.productId?._id || item.productId,
        name: item.productId?.name || 'Bilinmeyen Ürün',
        imageUrl: item.productId?.imageUrl || '',
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price
      })),
      total: cart.total
    });
  } catch (error: any) {
    console.error('❌ POST /cart/items error:', error);
    
    // Mongoose CastError (invalid ID)
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Geçersiz ürün ID formatı' });
    }
    
    // Mongoose ValidationError
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Veri doğrulama hatası: ' + error.message });
    }

    res.status(500).json({ message: 'Sepete eklenirken sunucu hatası oluştu', error: error.message });
  }
});

// PUT /cart/items/:itemId
router.put('/items/:itemId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { quantity } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Veritabanı bağlı değil. Güncelleme yapılamıyor.' });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Geçersiz istek verisi' });
    }

    const cart = await Cart.findOne({ userId: req.user?.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Sepet bulunamadı' });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === req.params.itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Sepet kalemi bulunamadı' });
    }

    // Stok kontrolü
    const product = await Product.findById(cart.items[itemIndex].productId);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    if (quantity > product.stock) {
      return res.status(409).json({ message: 'Stok yetersiz. Mevcut stok: ' + product.stock });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.total = cart.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.productId', 'name imageUrl');

    res.json({
      items: (populatedCart as any).items.map((item: any) => ({
        itemId: item._id,
        productId: item.productId?._id || item.productId,
        name: item.productId?.name || 'Bilinmeyen Ürün',
        imageUrl: item.productId?.imageUrl || '',
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price
      })),
      total: cart.total
    });
  } catch (error: any) {
    console.error('❌ PUT /cart/items error:', error);
    res.status(400).json({ message: 'Miktar güncellenirken hata oluştu', error: error.message });
  }
});

// DELETE /cart/items/:itemId
router.delete('/items/:itemId', authenticate, async (req: AuthRequest, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Veritabanı bağlı değil. Silme işlemi yapılamıyor.' });
    }

    const cart = await Cart.findOne({ userId: req.user?.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Sepet bulunamadı' });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === req.params.itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Sepet kalemi bulunamadı' });
    }

    cart.items.splice(itemIndex, 1);
    cart.total = cart.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    await cart.save();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

export default router;
