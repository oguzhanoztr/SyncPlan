"use client"

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)

          // Trigger data prefetching when user is authenticated
          if (session?.user?.id && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'PREFETCH_DATA',
              userId: session.user.id
            })
          }

          // Register for background sync if supported
          if ('sync' in registration) {
            registration.sync.register('prefetch-data')
          }
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error)
        })

      // Handle service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }
  }, [session?.user?.id])

  // Trigger prefetch when user session becomes available
  useEffect(() => {
    if (session?.user?.id && navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PREFETCH_DATA',
        userId: session.user.id
      })
    }
  }, [session?.user?.id])

  return <>{children}</>
}