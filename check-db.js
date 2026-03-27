import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const productSchema = new mongoose.Schema({
  name: String,
  category: String
});

const Product = mongoose.model('Product', productSchema);

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  const count = await Product.countDocuments();
  const products = await Product.find().limit(20);
  console.log('Total Products:', count);
  console.log('Sample Products:', JSON.stringify(products, null, 2));
  await mongoose.disconnect();
}

check().catch(console.error);
