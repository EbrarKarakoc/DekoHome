import express from 'express';
import Review from '../models/Review.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// GET /reviews?productId=...
router.get('/', async (req, res) => {
  try {
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({ message: 'Ürün ID gereklidir' });
    }

    const reviews = await Review.find({ productId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// POST /reviews
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Tüm alanlar gereklidir' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Puan 1-5 arasında olmalıdır' });
    }

    // Kullanıcının bu ürün için zaten yorumu var mı kontrol et
    const existingReview = await Review.findOne({
      productId,
      userId: req.user!.userId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Bu ürün için zaten yorum yapmışsınız' });
    }

    const review = new Review({
      productId,
      userId: req.user!.userId,
      rating,
      comment
    });

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name');

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// PUT /reviews/:reviewId
router.put('/:reviewId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Puan ve yorum gereklidir' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Puan 1-5 arasında olmalıdır' });
    }

    const review = await Review.findOneAndUpdate(
      { _id: req.params.reviewId, userId: req.user!.userId },
      { $set: { rating, comment } },
      { new: true }
    ).populate('userId', 'name');

    if (!review) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// DELETE /reviews/:reviewId
router.delete('/:reviewId', authenticate, async (req: AuthRequest, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.reviewId,
      userId: req.user!.userId
    });

    if (!review) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }

    res.json({ message: 'Yorum silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

export default router;