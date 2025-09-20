// Simple in-memory cache for development
// In production, use Redis or similar

interface CacheItem {
  data: any
  timestamp: number
  ttl: number
}

class SimpleCache {
  private cache = new Map<string, CacheItem>()
  private maxSize = 1000

  set(key: string, data: any, ttlSeconds: number = 300): void {
    // Clean old entries if cache is getting large
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }

    // If still too large, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)

      const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.2))
      toRemove.forEach(([key]) => this.cache.delete(key))
    }
  }

  // Invalidate cache entries by pattern
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }
}

export const cache = new SimpleCache()

// Cache key generators
export const generateCacheKey = {
  projects: (userId: string) => `projects:${userId}`,
  project: (id: string, userId: string) => `project:${id}:${userId}`,
  tasks: (projectId?: string, userId?: string) =>
    `tasks:${projectId || 'all'}:${userId}`,
  task: (id: string, userId: string) => `task:${id}:${userId}`,
  subtasks: (taskId: string, userId: string) => `subtasks:${taskId}:${userId}`,
  userProjects: (userId: string) => `user:${userId}:projects`,
  projectTasks: (projectId: string, userId: string) => `project:${projectId}:tasks:${userId}`,
  userTasks: (userId: string) => `user:${userId}:tasks`
}

// Cache invalidation helpers
export const invalidateCache = {
  project: (projectId: string) => {
    cache.invalidatePattern(`project:${projectId}:`)
    cache.invalidatePattern(`projects:`)
  },
  task: (taskId: string, projectId?: string) => {
    cache.invalidatePattern(`task:${taskId}:`)
    cache.invalidatePattern(`tasks:`)
    if (projectId) {
      cache.invalidatePattern(`project:${projectId}:`)
    }
  },
  subtask: (taskId: string) => {
    cache.invalidatePattern(`subtasks:${taskId}:`)
    cache.invalidatePattern(`task:${taskId}:`)
  }
}