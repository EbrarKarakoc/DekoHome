import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  icon: {
    type: String,
    default: 'Sofa' // Sofa, Bed, Utensils, Briefcase, Package, Sparkles gibi Lucide ikon isimleri
  },
  imageUrl: {
    type: String,
    default: ''
  },
  parentCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  }
}, {
  timestamps: true
});

export default mongoose.model('Category', categorySchema);
