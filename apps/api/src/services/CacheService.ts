type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

class CacheServiceClass {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 500;

  set(key: string, value: unknown, ttlMs = 60_000): void {
    // Evict if at capacity before inserting
    if (this.cache.size >= this.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // LRU: re-insert to move to end of insertion order
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value as T;
  }

  del(key: string): void {
    this.cache.delete(key);
  }

  flush(): void {
    this.cache.clear();
  }

  /**
   * Evict expired entries first, then oldest entries until under maxSize.
   */
  private evict(): void {
    const now = Date.now();

    // Pass 1: remove all expired
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }

    // Pass 2: if still at capacity, remove oldest (front of Map insertion order)
    while (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      } else {
        break;
      }
    }
  }

  /** Returns current number of live (non-expired) entries. */
  get size(): number {
    return this.cache.size;
  }
}

export const CacheService = new CacheServiceClass();
