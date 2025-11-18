// Sistema de cache simples em memória para requisições CVSS

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milissegundos
}

class Cache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 24 * 60 * 60 * 1000; // 24 horas

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verifica se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  // Remove entradas expiradas
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new Cache();

// Limpa cache expirado a cada hora
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    cache.cleanup();
  }, 60 * 60 * 1000);
}

