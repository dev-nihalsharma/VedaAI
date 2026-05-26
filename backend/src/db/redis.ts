import IORedis, { RedisOptions } from 'ioredis';
import { env } from '../config/env';

// Parse the REDIS_URL into options so BullMQ can build its own internal
// ioredis client (avoids dual-package issues with its bundled ioredis types).
function parseRedisUrl(url: string): RedisOptions {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port ? parseInt(u.port, 10) : 6379,
    password: u.password || undefined,
    username: u.username || undefined,
    // BullMQ requirement
    maxRetriesPerRequest: null,
  };
}

export const bullConnectionOpts = parseRedisUrl(env.REDIS_URL);

// Separate ioredis client for app caching.
export const cacheRedis = new IORedis(env.REDIS_URL);

cacheRedis.on('connect', () => console.log('[redis] cache connected'));
cacheRedis.on('error', (e) => console.error('[redis] cache error', e.message));
