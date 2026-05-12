import dotenv from 'dotenv';
dotenv.config();

import { initRabbitMQ, consumeQueue } from '../services/queue.js';

// ── DekoHome Bildirim Worker'ı ───────────────────────────────────
// Bu process, ana uygulamadan bağımsız çalışır.
// Tüm bildirim kuyruklarını dinler ve gelen her mesajı işler.
// Docker Compose'da ayrı bir servis (container) olarak ayağa kalkar.

async function startWorker(): Promise<void> {
  console.log('🔄 DekoHome Bildirim Worker başlatılıyor...');

  // RabbitMQ bağlantısı kur
  await initRabbitMQ();

  // ── 1. Sipariş Bildirimleri ──
  await consumeQueue('order_notifications', (msg) => {
    const orderId = msg.orderId as string;
    const userId = msg.userId as string;
    const total = msg.total as number;
    const itemCount = msg.itemCount as number;
    const createdAt = msg.createdAt as string;

    console.log('─'.repeat(50));
    console.log('📧 YENİ SİPARİŞ BİLDİRİMİ');
    console.log(`   Sipariş ID : ${orderId}`);
    console.log(`   Kullanıcı  : ${userId}`);
    console.log(`   Ürün Sayısı: ${itemCount}`);
    console.log(`   Toplam     : ₺${total}`);
    console.log(`   Tarih      : ${createdAt}`);
    console.log('   ✅ Bildirim işlendi (email simülasyonu)');
    console.log('─'.repeat(50));
  });

  // ── 2. Sepet Bildirimleri ──
  await consumeQueue('cart_notifications', (msg) => {
    const userId = msg.userId as string;
    const productName = msg.productName as string;
    const quantity = msg.quantity as number;
    const price = msg.price as number;
    const cartTotal = msg.cartTotal as number;
    const createdAt = msg.createdAt as string;

    console.log('─'.repeat(50));
    console.log('🛒 SEPETE ÜRÜN EKLENDİ');
    console.log(`   Kullanıcı  : ${userId}`);
    console.log(`   Ürün       : ${productName}`);
    console.log(`   Adet       : ${quantity}`);
    console.log(`   Birim Fiyat: ₺${price}`);
    console.log(`   Sepet Top. : ₺${cartTotal}`);
    console.log(`   Tarih      : ${createdAt}`);
    console.log('   ✅ Sepet bildirimi işlendi');
    console.log('─'.repeat(50));
  });

  // ── 3. Giriş Bildirimleri ──
  await consumeQueue('login_notifications', (msg) => {
    const userId = msg.userId as string;
    const email = msg.email as string;
    const ad = msg.ad as string;
    const soyad = msg.soyad as string;
    const role = msg.role as string;
    const loginAt = msg.loginAt as string;

    console.log('─'.repeat(50));
    console.log('🔐 KULLANICI GİRİŞ YAPTI');
    console.log(`   Kullanıcı  : ${ad} ${soyad}`);
    console.log(`   E-posta    : ${email}`);
    console.log(`   Rol        : ${role}`);
    console.log(`   User ID    : ${userId}`);
    console.log(`   Giriş Zamanı: ${loginAt}`);
    console.log('   ✅ Giriş bildirimi işlendi');
    console.log('─'.repeat(50));
  });

  // ── 4. Yorum Bildirimleri ──
  await consumeQueue('review_notifications', (msg) => {
    const reviewId = msg.reviewId as string;
    const productId = msg.productId as string;
    const userId = msg.userId as string;
    const rating = msg.rating as number;
    const comment = msg.comment as string;
    const createdAt = msg.createdAt as string;

    console.log('─'.repeat(50));
    console.log('⭐ YENİ YORUM EKLENDİ');
    console.log(`   Yorum ID   : ${reviewId}`);
    console.log(`   Ürün ID    : ${productId}`);
    console.log(`   Kullanıcı  : ${userId}`);
    console.log(`   Puan       : ${'⭐'.repeat(rating)}`);
    console.log(`   Yorum      : ${comment}`);
    console.log(`   Tarih      : ${createdAt}`);
    console.log('   ✅ Yorum bildirimi işlendi');
    console.log('─'.repeat(50));
  });

  console.log('✅ Worker hazır — 4 kuyruk dinleniyor:');
  console.log('   📧 order_notifications');
  console.log('   🛒 cart_notifications');
  console.log('   🔐 login_notifications');
  console.log('   ⭐ review_notifications');
}

startWorker().catch((err: Error) => {
  console.error('❌ Worker başlatılamadı:', err.message);
  process.exit(1);
});
