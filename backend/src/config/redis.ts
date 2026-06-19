import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
let redisClient: any;

class InMemoryMockRedis {
  private cache = new Map<string, string>();
  
  async connect() {
    console.warn('⚠️ Redis not running. Initialized InMemory Redis Mock cache.');
  }
  async get(key: string) {
    return this.cache.get(key) || null;
  }
  async set(key: string, value: string, options?: any) {
    this.cache.set(key, value);
    if (options && options.EX) {
      setTimeout(() => this.cache.delete(key), options.EX * 1000);
    }
    return 'OK';
  }
  async del(key: string) {
    this.cache.delete(key);
    return 1;
  }
  on(event: string, callback: Function) {
    // mock emitter
  }
}

if (process.env.NODE_ENV === 'test') {
  redisClient = new InMemoryMockRedis();
} else {
  redisClient = createClient({ url: redisUrl });
  
  redisClient.on('error', (err: any) => {
    console.error('❌ Redis Connection Error:', err.message);
  });
  
  redisClient.connect().catch((err: any) => {
    console.warn('⚠️ Redis connection failed, switching to InMemory cache mock.');
    redisClient = new InMemoryMockRedis();
    redisClient.connect();
  });
}

export default redisClient;
