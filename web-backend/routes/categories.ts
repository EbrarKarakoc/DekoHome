import express from 'express';
import Category from '../models/Category.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

import mongoose from 'mongoose';

const router = express.Router();

const mockCategories = [
  { _id: '1', name: 'Oturma Odası', description: 'Koltuk, kanepe, sehpa vb.', parentCategoryId: null },
  { _id: '2', name: 'Yatak Odası', description: 'Yatak, komodin, gardırop vb.', parentCategoryId: null },
  { _id: '3', name: 'Mutfak', description: 'Mutfak dolabı, ada vb.', parentCategoryId: null },
  { _id: '4', name: 'Ofis', description: 'Çalışma masası, ofis koltuğu vb.', parentCategoryId: null },
  { _id: '5', name: 'Depolama', description: 'Raf, dolap vb.', parentCategoryId: null },
  { _id: '6', name: 'Dekorasyon', description: 'Aydınlatma, saat, dekorasyon vb.', parentCategoryId: null },
  { _id: '101', name: 'Koltuklar', description: 'Kanepe ve berjer modelleri', parentCategoryId: '1' },
  { _id: '102', name: 'Sehpalar', description: 'Zigon ve orta sehpalar', parentCategoryId: '1' },
  { _id: '201', name: 'Yataklar', description: 'Ortopedik yataklar', parentCategoryId: '2' },
  { _id: '202', name: 'Gardıroplar', description: 'Sürgülü ve kapaklı dolaplar', parentCategoryId: '2' }
];


// GET /categories
const buildCategoryTree = (categories: any[], parentId: any = null): any[] => {
  return categories
    .filter(cat => {
      const catParentId = cat.parentCategoryId ? cat.parentCategoryId.toString() : null;
      const targetParentId = parentId ? parentId.toString() : null;
      return catParentId === targetParentId;
    })
    .map(cat => ({
      ...cat,
      _id: cat._id.toString(),
      id: cat._id.toString(),
      children: buildCategoryTree(categories, cat._id)
    }));
};

router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn("⚠️ Veritabanı bağlı değil, örnek kategori verileri yükleniyor.");
      
      // Mock verileri de hiyerarşik döndür
      return res.json(buildCategoryTree(mockCategories));
    }

    const categories = await Category.find().lean();
    
    // Ağaç yapısını oluştur
    const categoryTree = buildCategoryTree(categories);

    res.json(categoryTree);
  } catch (error: any) {
    console.error('❌ GET /categories error:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// PUT /categories/:categoryId
router.put('/:categoryId', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, description, parentCategoryId } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const index = mockCategories.findIndex(c => c._id === req.params.categoryId);
      if (index !== -1) {
        mockCategories[index] = { 
          ...mockCategories[index], 
          name: name || mockCategories[index].name, 
          description: description || mockCategories[index].description,
          // @ts-ignore
          parentCategoryId: parentCategoryId || mockCategories[index].parentCategoryId
        };
        console.log("✅ Offline Mode: Kategori (Mock) güncellendi:", mockCategories[index]);
        return res.json({
          _id: mockCategories[index]._id,
          id: mockCategories[index]._id,
          name: mockCategories[index].name,
          description: mockCategories[index].description,
        });
      }
      return res.status(404).json({ message: 'Kategori bulunamadı' });
    }

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
      _id: category._id,
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
