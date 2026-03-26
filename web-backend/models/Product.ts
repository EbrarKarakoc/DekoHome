import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);
