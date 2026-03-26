const PREFS_CACHE = 'amor-fati-sw-prefs'
let checkTimer = null

self.addEventListener('message', async (event) => {
  if (event.data?.type === 'SET_NOTIFICATION_PREFS') {
    const cache = await caches.open(PREFS_CACHE)
    await cache.put('/prefs', new Response(JSON.stringify(event.data.prefs)))
    scheduleCheck()
  }
})

self.addEventListener('activate', (event) => {
  event.waitUntil(scheduleCheck())
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(clients.openWindow(url))
})

async function scheduleCheck() {
  if (checkTimer) clearInterval(checkTimer)
  await checkAndNotify()
  checkTimer = setInterval(checkAndNotify, 60_000)
}

async function checkAndNotify() {
  try {
    const cache = await caches.open(PREFS_CACHE)
    const prefsRes = await cache.match('/prefs')
    if (!prefsRes) return

    const prefs = await prefsRes.json()
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    if (prefs.morningEnabled && prefs.morningTime) {
      const [h, m] = prefs.morningTime.split(':').map(Number)
      const targetMinutes = h * 60 + m
      const lastRes = await cache.match('/last-morning')
      const lastDay = lastRes ? await lastRes.text() : ''

      if (Math.abs(currentMinutes - targetMinutes) <= 1 && lastDay !== todayStr) {
        await self.registration.showNotification('Morning practice — Amor Fati', {
          body: 'Begin your day with intention. Your morning reflection awaits.',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'morning',
          renotify: false,
          data: { url: '/morning' },
        })
        await cache.put('/last-morning', new Response(todayStr))
      }
    }

    if (prefs.eveningEnabled && prefs.eveningTime) {
      const [h, m] = prefs.eveningTime.split(':').map(Number)
      const targetMinutes = h * 60 + m
      const lastRes = await cache.match('/last-evening')
      const lastDay = lastRes ? await lastRes.text() : ''

      if (Math.abs(currentMinutes - targetMinutes) <= 1 && lastDay !== todayStr) {
        await self.registration.showNotification('Evening reflection — Amor Fati', {
          body: 'How did your day unfold? Take a moment to examine it.',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'evening',
          renotify: false,
          data: { url: '/evening' },
        })
        await cache.put('/last-evening', new Response(todayStr))
      }
    }
  } catch (e) {
    // SW may not have notification permission — silently continue
  }
}
