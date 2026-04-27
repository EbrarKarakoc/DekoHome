import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { publishToQueue } from '../services/queue.js';

const router = express.Router();

// POST /orders
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { address, note, paymentMethod } = req.body;

    if (!address) {
      return res.status(400).json({ message: 'Adres gereklidir' });
    }
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Ödeme yöntemi gereklidir' });
    }

    const cart = await Cart.findOne({ userId: req.user?.userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Sepetiniz boş' });
    }

    // Check stock for each item
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Ürün bulunamadı: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `${product.name} için yetersiz stok` });
      }
    }

    // Process order and reduce stock
    const order = new Order({
      userId: req.user?.userId,
      status: 'Onaylandı',
      total: cart.total,
      address,
      note,
      paymentMethod,
      items: cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    });

    await order.save();

    // Reduce stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart after order
    cart.items.splice(0, cart.items.length);
    cart.total = 0;
    await cart.save();

    // ── RabbitMQ: Sipariş bildirimi kuyruğa gönder ──
    // Başarısız olursa sipariş yine kabul edilir (fire-and-forget)
    await publishToQueue('order_notifications', {
      orderId: order._id.toString(),
      userId: order.userId.toString(),
      total: order.total,
      itemCount: order.items.length,
      createdAt: order.createdAt.toISOString(),
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Geçersiz istek verisi' });
  }
});

// GET /orders
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    let query: any = {};
    if (req.user?.role !== 'admin') {
      query.userId = req.user?.userId;
    }

    const orders = await Order.find(query).populate('items.productId').sort({ createdAt: -1 });

    res.json(orders.map(order => ({
      id: order._id,
      status: order.status,
      total: order.total,
      address: order.address,
      paymentMethod: order.paymentMethod,
      note: order.note,
      createdAt: order.createdAt,
      items: order.items.map(item => {
        const product = item.productId as any;
        return {
          itemId: item._id,
          productId: product?._id || item.productId,
          name: product?.name,
          imageUrl: product?.imageUrl,
          quantity: item.quantity,
          price: item.price
        };
      })
    })));
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// PUT /orders/:orderId
router.put('/:orderId', authenticate, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' });
    }

    const isAdmin = req.user?.role === 'admin';
    const isOwner = order.userId.toString() === req.user?.userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Yetkiniz yok' });
    }

    const { status, address } = req.body;

    if (isAdmin) {
      if (status) order.status = status;
      if (address) order.address = address;
    } else {
      // User can only update address if not yet shipped
      if (order.status !== 'Onaylandı' && order.status !== 'Hazırlanıyor') {
        return res.status(400).json({ message: 'Kargoya verilmiş sipariş güncellenemez' });
      }
      if (address) order.address = address;
      if (status) return res.status(403).json({ message: 'Durum güncelleme yetkiniz yok' });
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Güncelleme hatası' });
  }
});

// DELETE /orders/:orderId (Sipariş İptali)
router.delete('/:orderId', authenticate, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' });
    }

    const isAdmin = req.user?.role === 'admin';
    const isOwner = order.userId.toString() === req.user?.userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Yetkiniz yok' });
    }

    if (order.status === 'İptal Edildi') {
       return res.status(400).json({ message: 'Sipariş zaten iptal edilmiş' });
    }

    // If 'Onaylandı' is a cancelable status, it should not be in this condition.
    // The current condition correctly identifies non-cancelable statuses.
    // If the intent was to make 'Onaylandı' non-cancelable, it would be added here.
    // As per the instruction "adding 'Onaylandı' to the cancelable statuses",
    // it means 'Onaylandı' should pass this check and proceed to cancellation.
    if (order.status === 'Kargoya Verildi' || order.status === 'Teslim Edildi') {
      return res.status(400).json({ message: 'Bu aşamadaki sipariş iptal edilemez' });
    }

    // Set status to cancelled
    order.status = 'İptal Edildi';
    await order.save();

    // Recover stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    res.status(200).json({ message: 'Sipariş iptal edildi', order });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

export default router;
