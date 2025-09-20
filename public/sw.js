// Service Worker for SyncPlan - Background data prefetching and caching

const CACHE_NAME = 'syncplan-v1'
const API_CACHE_NAME = 'syncplan-api-v1'

// Cache essential static assets
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/projects',
  '/tasks',
  '/_next/static/css/app/globals.css',
]

// API endpoints to prefetch and cache
const API_ENDPOINTS = [
  '/api/projects',
  '/api/tasks',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS)
      }),
      caches.open(API_CACHE_NAME)
    ])
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle static assets
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'image') {
    event.respondWith(handleStaticAsset(request))
    return
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request))
    return
  }
})

// Handle API requests - Network first, then cache
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME)

  try {
    // Try network first
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline response
    return new Response(JSON.stringify({
      error: 'Offline - data not available',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Handle static assets - Cache first, then network
async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    return new Response('Asset not available offline', { status: 503 })
  }
}

// Handle navigation requests - Network first with offline fallback
async function handleNavigation(request) {
  try {
    return await fetch(request)
  } catch (error) {
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match('/')
    return cachedResponse || new Response('App not available offline', { status: 503 })
  }
}

// Background sync for data prefetching
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PREFETCH_DATA') {
    event.waitUntil(prefetchUserData(event.data.userId))
  }
})

// Prefetch user's common data in background
async function prefetchUserData(userId) {
  if (!userId) return

  const cache = await caches.open(API_CACHE_NAME)
  const prefetchPromises = []

  // Prefetch projects
  const projectsUrl = '/api/projects'
  prefetchPromises.push(
    fetch(projectsUrl)
      .then(response => {
        if (response.ok) {
          cache.put(projectsUrl, response.clone())
        }
        return response
      })
      .catch(() => {}) // Ignore errors during prefetch
  )

  // Prefetch tasks
  const tasksUrl = '/api/tasks'
  prefetchPromises.push(
    fetch(tasksUrl)
      .then(response => {
        if (response.ok) {
          cache.put(tasksUrl, response.clone())
        }
        return response
      })
      .catch(() => {}) // Ignore errors during prefetch
  )

  await Promise.allSettled(prefetchPromises)
}

// Periodic background sync (when browser supports it)
self.addEventListener('sync', (event) => {
  if (event.tag === 'prefetch-data') {
    event.waitUntil(prefetchUserData())
  }
})