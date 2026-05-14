import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const makeAdmin = async () => {
  const email = process.argv[2] || 'admin@test.com';

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI .env dosyasında bulunamadı!');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ Veritabanına bağlanıldı.');

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`🚀 BAŞARILI: ${email} artık bir ADMİN!`);
    } else {
      console.error(`❌ HATA: '${email}' e-postasına sahip bir kullanıcı bulunamadı.`);
      console.log('İpucu: Önce uygulamadan bu e-posta ile kayıt olmalısınız.');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Bir hata oluştu:', error);
    process.exit(1);
  }
};

makeAdmin();
