import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
      console.warn("⚠️ MONGODB_URI is missing or invalid (must start with mongodb:// or mongodb+srv://).");
      console.warn("⚠️ Running without MongoDB connection. Mock data will be used.");
      return;
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${(error as Error).message}`);
    // We don't exit the process here so the frontend can still run with mock data
  }
};
