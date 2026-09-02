import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let isRedisConnected = false;
let hasLoggedRedisWarning = false;

export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  enableOfflineQueue: false,
  retryStrategy(times) {
    if (env.NODE_ENV === 'development') {
      if (times >= 2) {
        if (!hasLoggedRedisWarning) {
          logger.warn('⚠️  Redis is not running on localhost:6379.');
          logger.warn('💡  Dev server will continue running. BullMQ background queues will be paused until Redis is started.');
          hasLoggedRedisWarning = true;
        }
        return null; // Stop reconnect loop in development
      }
    }
    return Math.min(times * 200, 3000);
  },
});

redisClient.on('error', (err: Error) => {
  if (isRedisConnected || env.NODE_ENV === 'production') {
    logger.error('Redis client error:', err);
  }
});

redisClient.on('connect', () => {
  isRedisConnected = true;
  logger.info('✅  Redis connected');
});

redisClient.on('reconnecting', () => {
  if (env.NODE_ENV === 'production') {
    logger.warn('Redis reconnecting...');
  }
});

export async function connectRedis(): Promise<void> {
  try {
    await redisClient.connect();
  } catch {
    // In dev, the retryStrategy will handle warning and stopping gracefully
  }
}

export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient.status === 'ready' || redisClient.status === 'connecting') {
      await redisClient.quit();
      logger.info('Redis disconnected gracefully');
    }
  } catch {
    // Ignore disconnect errors on shutdown
  }
}
