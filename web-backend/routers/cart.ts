import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// GET /cart
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user?.userId });
    
    if (!cart) {
      cart = new Cart({ userId: req.user?.userId, items: [], total: 0 });
      await cart.save();
    }

    res.json({
      items: cart.items.map(item => ({
        itemId: item._id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      total: cart.total
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// POST /cart/items
router.post('/items', authenticate, async (req: AuthRequest, res) => {
  try {
    const { productId, quantity } = req.body;

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

    res.status(201).json({
      items: cart.items.map(item => ({
        itemId: item._id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      total: cart.total
    });
  } catch (error) {
    console.error('Sepete ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// PUT /cart/items/:itemId
router.put('/items/:itemId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { quantity } = req.body;

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

    cart.items[itemIndex].quantity = quantity;
    cart.total = cart.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    await cart.save();

    res.json({
      items: cart.items.map(item => ({
        itemId: item._id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      total: cart.total
    });
  } catch (error) {
    console.error('Sepet güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// DELETE /cart/items/:itemId
router.delete('/items/:itemId', authenticate, async (req: AuthRequest, res) => {
  try {
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
