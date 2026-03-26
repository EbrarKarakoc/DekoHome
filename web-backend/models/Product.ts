import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lütfen ürün adı giriniz'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Lütfen ürün fiyatı giriniz'],
  },
  description: {
    type: String,
    required: [true, 'Lütfen ürün açıklaması giriniz'],
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Lütfen kategori seçiniz'],
  },
  imageUrl: {
    type: String,
    default: 'https://picsum.photos/seed/furniture/400/400',
  },
  stock: {
    type: Number,
    default: 10,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);
