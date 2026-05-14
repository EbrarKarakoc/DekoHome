import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const resetPassword = async () => {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('❌ Kullanım: npx tsx ortak-backend/scripts/reset-password.ts <email> <yeni_sifre>');
    process.exit(1);
  }

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI .env dosyasında bulunamadı!');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ Veritabanına bağlanıldı.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword },
      { new: true }
    );

    if (user) {
      console.log(`🚀 BAŞARILI: ${email} için şifre güncellendi!`);
      console.log(`Yeni şifreniz: ${newPassword}`);
    } else {
      console.error(`❌ HATA: '${email}' e-postasına sahip bir kullanıcı bulunamadı.`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Bir hata oluştu:', error);
    process.exit(1);
  }
};

resetPassword();
