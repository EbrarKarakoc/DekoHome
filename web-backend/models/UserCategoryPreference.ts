import mongoose from 'mongoose';

const userCategoryPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  }
}, {
  timestamps: true
});

// Ensure a user can only prefer a category once
userCategoryPreferenceSchema.index({ userId: 1, categoryId: 1 }, { unique: true });

export default mongoose.model('UserCategoryPreference', userCategoryPreferenceSchema);
