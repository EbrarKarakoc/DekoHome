

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: any | null = null; // using any to avoid type check errors without top-level import
let isRedisReady = false;


export async function initRedis(): Promise<void> {


  try {
    const { Redis } = await import('ioredis');

    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number): number | null {
        if (times > 5) {
          console.warn('⚠️  Redis: Yeniden bağlanma denemeleri tükendi, cache devre dışı.');
          return null;            // artık retry yapma
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: false,
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis bağlantısı kuruldu.');
      isRedisReady = true;
    });

    redisClient.on('error', (err: Error) => {
      console.error('❌ Redis hatası:', err.message);
      isRedisReady = false;
    });

    redisClient.on('close', () => {
      isRedisReady = false;
    });
  } catch (err) {
    console.error('❌ Redis başlatılamadı:', (err as Error).message);
  }
}


export async function getCache(key: string): Promise<string | null> {
  if (!redisClient || !isRedisReady) return null;
  try {
    return await redisClient.get(key);
  } catch {
    return null;
  }
}

/**
 * Cache'e veri yaz.
 * @param key   Anahtar (ör. "products:all")
 * @param value JSON string
 * @param ttl   Son kullanma süresi (saniye) – varsayılan 60
 */
export async function setCache(key: string, value: string, ttl = 60): Promise<void> {
  if (!redisClient || !isRedisReady) return;
  try {
    await redisClient.set(key, value, 'EX', ttl);
  } catch {
    // sessizce yoksay — cache yazılamazsa DB'den servis devam eder
  }
}


export async function deleteCache(key: string): Promise<void> {
  if (!redisClient || !isRedisReady) return;
  try {
    await redisClient.del(key);
  } catch {
    // sessizce yoksay
  }
}


export async function deleteByPattern(pattern: string): Promise<void> {
  if (!redisClient || !isRedisReady) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch {
    // sessizce yoksay
  }
}
