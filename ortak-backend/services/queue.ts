// amqplib importu dinamik olarak yapılacak

// ── RabbitMQ Client ─────────────────────────────────────────────
// Producer (sunucu) ve Consumer (worker) tarafından paylaşılan yardımcı modül.
// Bağlantı kurulamazsa uygulama çökmez — mesaj sadece loglanır.

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

// type AmqpConnection = Awaited<ReturnType<typeof amqplib.connect>>;
// type AmqpChannel = Awaited<ReturnType<AmqpConnection['createChannel']>>;

let connection: any | null = null;
let channel: any | null = null;
let isRabbitReady = false;

/**
 * RabbitMQ bağlantısını ve kanalı başlatır.
 * Server başlarken bir kez çağrılmalıdır.
 */
export async function initRabbitMQ(retries = 5): Promise<void> {
  // Geliştirme modunda da çalışabilmesi için production kısıtlaması kaldırıldı

  try {
    const amqplib = (await import('amqplib')).default;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const conn = await amqplib.connect(RABBITMQ_URL);
        const ch = await conn.createChannel();

        connection = conn;
        channel = ch;
        isRabbitReady = true;
        console.log('✅ RabbitMQ bağlantısı kuruldu.');

        conn.on('error', (err: Error) => {
          console.error('❌ RabbitMQ bağlantı hatası:', err.message);
          isRabbitReady = false;
        });

        conn.on('close', () => {
          console.warn('⚠️  RabbitMQ bağlantısı kapandı.');
          isRabbitReady = false;
          channel = null;
          connection = null;
        });
        return; // başarılı — döngüden çık
      } catch (err) {
        console.warn(`⚠️  RabbitMQ bağlantı denemesi ${attempt}/${retries} başarısız:`, (err as Error).message);
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 3000)); // 3 saniye bekle
        }
      }
    }
    console.error('❌ RabbitMQ başlatılamadı — tüm denemeler tükendi. Uygulama kuyruksuz devam ediyor.');
  } catch (err) {
    console.error('Failed to import amqplib', err);
  }
}

/**
 * Kuyruğa mesaj gönder (Producer).
 * @param queueName  Kuyruk adı (ör. "order_notifications")
 * @param message    Gönderilecek obje — JSON.stringify yapılır
 */
export async function publishToQueue(queueName: string, message: Record<string, unknown>): Promise<boolean> {
  if (!channel || !isRabbitReady) {
    console.warn(`⚠️  RabbitMQ bağlı değil — mesaj gönderilmedi (queue: ${queueName}).`);
    return false;
  }
  try {
    await channel.assertQueue(queueName, { durable: true });
    const buffer = Buffer.from(JSON.stringify(message));
    channel.sendToQueue(queueName, buffer, { persistent: true });
    console.log(`📤 Mesaj kuyruğa gönderildi → [${queueName}]`);
    return true;
  } catch (err) {
    console.error('❌ Kuyruğa mesaj gönderim hatası:', (err as Error).message);
    return false;
  }
}

/**
 * Kuyruktan mesaj tüket (Consumer / Worker).
 * @param queueName  Dinlenecek kuyruk adı
 * @param callback   Gelen her mesaj için çağrılacak fonksiyon
 */
export async function consumeQueue(
  queueName: string,
  callback: (msg: Record<string, unknown>) => void | Promise<void>,
): Promise<void> {
  if (!channel || !isRabbitReady) {
    throw new Error('RabbitMQ kanalı hazır değil.');
  }

  await channel.assertQueue(queueName, { durable: true });
  await channel.prefetch(1);
  console.log(`👂 Kuyruk dinleniyor → [${queueName}]`);

  await channel.consume(queueName, async (msg: import('amqplib').ConsumeMessage | null) => {
    if (!msg || !channel) return;
    try {
      const data = JSON.parse(msg.content.toString()) as Record<string, unknown>;
      await callback(data);
      channel.ack(msg);
    } catch (err) {
      console.error('❌ Mesaj işleme hatası:', (err as Error).message);
      // Hatalı mesajı tekrar kuyruğa koyma (nack + requeue:false)
      if (channel) channel.nack(msg, false, false);
    }
  });
}

/**
 * Bağlantıyı düzgünce kapat (graceful shutdown).
 */
export async function closeRabbitMQ(): Promise<void> {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
  } catch {
    // sessizce yoksay
  }
}
