/**
 * Tek seferlik: MongoDB'de admin kullanıcı oluşturur veya mevcut e-postayı admin yapar.
 * Kök .env içinde tanımla:
 *   ADMIN_BOOTSTRAP_EMAIL=senin@mail.com
 *   ADMIN_BOOTSTRAP_PASSWORD=güçlüŞifre
 *   ADMIN_BOOTSTRAP_AD=Admin (isteğe bağlı)
 *   ADMIN_BOOTSTRAP_SOYAD=User (isteğe bağlı)
 *
 * Çalıştır: npm run create-admin
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { connectDB, isMongoConnected } from '../config/db.js';

dotenv.config();

async function waitForMongo(ms = 20000): Promise<boolean> {
  const step = 200;
  for (let t = 0; t < ms; t += step) {
    if (isMongoConnected()) return true;
    await new Promise((r) => setTimeout(r, step));
  }
  return isMongoConnected();
}

async function main() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  const ad = process.env.ADMIN_BOOTSTRAP_AD?.trim() || 'Admin';
  const soyad = process.env.ADMIN_BOOTSTRAP_SOYAD?.trim() || 'User';

  if (!email || !password) {
    console.error(
      '❌ .env içinde ADMIN_BOOTSTRAP_EMAIL ve ADMIN_BOOTSTRAP_PASSWORD tanımlayın.'
    );
    process.exit(1);
  }

  await connectDB();
  const ok = await waitForMongo();
  if (!ok) {
    console.error('❌ MongoDB bağlı değil. .env ve ağı kontrol edin.');
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      password: hashedPassword,
      ad,
      soyad,
      role: 'admin',
    });
    console.log(`✅ Admin kullanıcı oluşturuldu: ${email}`);
  } else {
    user.role = 'admin';
    user.password = hashedPassword;
    user.ad = ad;
    user.soyad = soyad;
    await user.save();
    console.log(`✅ Kullanıcı admin yapıldı ve şifre güncellendi: ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
