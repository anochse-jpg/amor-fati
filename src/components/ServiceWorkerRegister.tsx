'use client'
import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Send saved preferences to the SW
      const prefsRaw = localStorage.getItem('amor-fati-notification-prefs')
      if (!prefsRaw) return

      const prefs = JSON.parse(prefsRaw)
      const sendPrefs = (sw: ServiceWorker) => {
        sw.postMessage({ type: 'SET_NOTIFICATION_PREFS', prefs })
      }

      if (registration.active) {
        sendPrefs(registration.active)
      } else {
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing
          installing?.addEventListener('statechange', () => {
            if (installing.state === 'activated') sendPrefs(installing)
          })
        })
      }
    }).catch(() => {
      // SW registration failed (e.g. in dev with strict CSP) — silently continue
    })
  }, [])

  return null
}
