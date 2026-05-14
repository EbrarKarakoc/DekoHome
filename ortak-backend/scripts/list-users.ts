import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const listUsers = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI not found');
      process.exit(1);
    }

    await mongoose.connect(uri);
    const users = await User.find({}, 'email ad soyad role').lean();
    
    console.log('\n--- KAYITLI KULLANICILAR ---');
    if (users.length === 0) {
      console.log('Henüz hiç kullanıcı kaydı yok.');
    } else {
      users.forEach((u, i) => {
        console.log(`${i+1}. [${u.role}] ${u.email} (${u.ad} ${u.soyad})`);
      });
    }
    console.log('---------------------------\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
};

listUsers();
