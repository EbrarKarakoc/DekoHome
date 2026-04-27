import dotenv from 'dotenv';
dotenv.config();

import { initRabbitMQ, consumeQueue } from '../services/queue.js';

// ── Sipariş Bildirim Worker'ı ───────────────────────────────────
// Bu process, ana uygulamadan bağımsız çalışır.
// "order_notifications" kuyruğunu dinler ve gelen her mesajı işler.
// Docker Compose'da ayrı bir servis (container) olarak ayağa kalkar.

const QUEUE_NAME = 'order_notifications';

async function startWorker(): Promise<void> {
  console.log('🔄 Sipariş Bildirim Worker başlatılıyor...');

  // RabbitMQ bağlantısı kur
  await initRabbitMQ();

  // Kuyruğu dinlemeye başla
  await consumeQueue(QUEUE_NAME, (msg) => {
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

  console.log('✅ Worker hazır — mesaj bekleniyor...');
}

startWorker().catch((err: Error) => {
  console.error('❌ Worker başlatılamadı:', err.message);
  process.exit(1);
});
