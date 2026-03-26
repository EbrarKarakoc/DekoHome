import express from 'express';
import Category from '../models/Category.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// GET /categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories.map(cat => ({
      id: cat._id,
      name: cat.name,
      description: cat.description,
      parentCategoryId: cat.parentCategoryId
    })));
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// PUT /categories/:categoryId
router.put('/:categoryId', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, description, parentCategoryId } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Kategori adı gereklidir' });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.categoryId,
      { $set: { name, description, parentCategoryId } },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Kategori bulunamadı' });
    }

    res.json({
      id: category._id,
      name: category.name,
      description: category.description,
      parentCategoryId: category.parentCategoryId
    });
  } catch (error) {
    res.status(400).json({ message: 'Geçersiz istek verisi' });
  }
});

export default router;
