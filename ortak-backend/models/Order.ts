import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Onaylandı', 'Hazırlanıyor', 'Kargoya Verildi', 'Teslim Edildi', 'İptal Edildi'],
    default: 'Onaylandı',
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  note: {
    type: String,
  },
  items: [orderItemSchema]
}, {
  timestamps: true
});

export default mongoose.model('Order', orderSchema);
