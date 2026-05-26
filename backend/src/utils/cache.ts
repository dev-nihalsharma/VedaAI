import { cacheRedis } from '../db/redis';

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await cacheRedis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
  try {
    await cacheRedis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // best-effort cache; ignore failures
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await cacheRedis.del(key);
  } catch {
    // ignore
  }
}
