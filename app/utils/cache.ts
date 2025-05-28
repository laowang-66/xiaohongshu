// 简单的内存缓存工具
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 100; // 最多缓存100个项目
  private defaultTTL = 30 * 60 * 1000; // 默认30分钟过期

  // 生成缓存键
  private generateKey(prefix: string, data: any): string {
    const hash = this.simpleHash(JSON.stringify(data));
    return `${prefix}:${hash}`;
  }

  // 简单哈希函数
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }

  // 设置缓存
  set<T>(prefix: string, key: any, value: T, ttl: number = this.defaultTTL): void {
    const cacheKey = this.generateKey(prefix, key);
    
    // 如果缓存已满，删除最旧的项目
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(cacheKey, {
      data: value,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });

    console.log(`📦 缓存已设置: ${cacheKey.substring(0, 20)}...`);
  }

  // 获取缓存
  get<T>(prefix: string, key: any): T | null {
    const cacheKey = this.generateKey(prefix, key);
    const item = this.cache.get(cacheKey);

    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.cache.delete(cacheKey);
      console.log(`🗑️ 缓存已过期: ${cacheKey.substring(0, 20)}...`);
      return null;
    }

    console.log(`✅ 缓存命中: ${cacheKey.substring(0, 20)}...`);
    return item.data;
  }

  // 删除特定缓存
  delete(prefix: string, key: any): void {
    const cacheKey = this.generateKey(prefix, key);
    this.cache.delete(cacheKey);
  }

  // 清空所有缓存
  clear(): void {
    this.cache.clear();
    console.log('🧹 所有缓存已清空');
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 已清理 ${cleanedCount} 个过期缓存`);
    }
  }

  // 获取缓存统计信息
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()).map(key => key.substring(0, 30) + '...')
    };
  }
}

// 创建全局缓存实例
export const cache = new MemoryCache();

// 定期清理过期缓存（每10分钟）
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1000);
}

// 缓存键前缀
export const CACHE_KEYS = {
  COVER_GENERATION: 'cover_gen',
  CONTENT_OPTIMIZATION: 'content_opt',
  SEARCH_RESULTS: 'search_res',
  REWRITE_CONTENT: 'rewrite'
} as const;

// 导出缓存工具函数
export const cacheUtils = {
  // 缓存封面生成结果
  setCoverCache: (params: { text: string; template: string; size: string }, result: any) => {
    cache.set(CACHE_KEYS.COVER_GENERATION, params, result, 60 * 60 * 1000); // 1小时
  },

  // 获取封面生成缓存
  getCoverCache: (params: { text: string; template: string; size: string }) => {
    return cache.get(CACHE_KEYS.COVER_GENERATION, params);
  },

  // 缓存内容优化结果
  setOptimizationCache: (params: { content: string; platform: string }, result: any) => {
    cache.set(CACHE_KEYS.CONTENT_OPTIMIZATION, params, result, 30 * 60 * 1000); // 30分钟
  },

  // 获取内容优化缓存
  getOptimizationCache: (params: { content: string; platform: string }) => {
    return cache.get(CACHE_KEYS.CONTENT_OPTIMIZATION, params);
  },

  // 清空特定类型的缓存
  clearCacheByType: (type: keyof typeof CACHE_KEYS) => {
    // 由于简单实现，这里只能清空所有缓存
    cache.clear();
  },

  // 获取缓存状态
  getCacheStats: () => {
    return cache.getStats();
  }
}; 