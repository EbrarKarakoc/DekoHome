import express from 'express';
import User from '../models/User.js';
import UserCategoryPreference from '../models/UserCategoryPreference.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// GET /users/:userId
router.get('/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.userId !== req.params.userId && req.user?.role !== 'admin') {
      return res.status(401).json({ message: 'Kimlik doğrulama başarısız' });
    }

    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.json({
      id: user._id,
      email: user.email,
      ad: user.ad,
      soyad: user.soyad
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// PUT /users/:userId
router.put('/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.userId !== req.params.userId && req.user?.role !== 'admin') {
      return res.status(401).json({ message: 'Kimlik doğrulama başarısız' });
    }

    const { ad, soyad } = req.body;
    
    if (!ad && !soyad) {
      return res.status(400).json({ message: 'Geçersiz istek verisi' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { ad, soyad } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.json({
      id: user._id,
      email: user.email,
      ad: user.ad,
      soyad: user.soyad
    });
  } catch (error) {
    res.status(400).json({ message: 'Geçersiz istek verisi' });
  }
});

// DELETE /users/:userId
router.delete('/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.userId !== req.params.userId && req.user?.role !== 'admin') {
      return res.status(401).json({ message: 'Kimlik doğrulama başarısız' });
    }

    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// POST /users/:userId/preferences/categories
router.post('/:userId/preferences/categories', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.userId !== req.params.userId && req.user?.role !== 'admin') {
      return res.status(401).json({ message: 'Kimlik doğrulama başarısız' });
    }

    const { categoryId } = req.body;
    if (!categoryId) {
      return res.status(400).json({ message: 'Geçersiz istek verisi' });
    }

    const preference = new UserCategoryPreference({
      userId: req.params.userId,
      categoryId
    });

    await preference.save();

    res.json({
      userId: preference.userId,
      categoryId: preference.categoryId
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Bu kategori zaten seçili' });
    }
    res.status(400).json({ message: 'Geçersiz istek verisi' });
  }
});

// DELETE /users/:userId/preferences/categories/:categoryId
router.delete('/:userId/preferences/categories/:categoryId', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.userId !== req.params.userId && req.user?.role !== 'admin') {
      return res.status(401).json({ message: 'Kimlik doğrulama başarısız' });
    }

    const preference = await UserCategoryPreference.findOneAndDelete({
      userId: req.params.userId,
      categoryId: req.params.categoryId
    });

    if (!preference) {
      return res.status(404).json({ message: 'Kayıt bulunamadı' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

export default router;
