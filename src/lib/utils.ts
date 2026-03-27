import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

/**
 * Computes current streak from an array of YYYY-MM-DD date strings.
 * Streak counts consecutive days ending today or yesterday.
 */
export function computeStreak(dates: string[]): number {
  const uniqueDates = [...new Set(dates)].sort().reverse()
  if (uniqueDates.length === 0) return 0

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const curr = new Date(uniqueDates[i - 1] + 'T00:00:00')
    const prev = new Date(uniqueDates[i] + 'T00:00:00')
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000)
    if (diffDays === 1) streak++
    else break
  }
  return streak
}

/**
 * Computes the longest consecutive streak from an array of YYYY-MM-DD date strings.
 */
export function computeLongestStreak(dates: string[]): number {
  const uniqueDates = [...new Set(dates)].sort()
  if (uniqueDates.length === 0) return 0

  let max = 1
  let current = 1

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1] + 'T00:00:00')
    const curr = new Date(uniqueDates[i] + 'T00:00:00')
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000)
    if (diffDays === 1) {
      current++
      if (current > max) max = current
    } else {
      current = 1
    }
  }
  return max
}

/**
 * Selects a prompt index for a given category, avoiding repeats within
 * `cooldownDays`. Caches today's selection so the same prompt shows all day.
 */
export function selectDailyPrompt(category: string, total: number, cooldownDays = 10): number {
  try {
    const today = new Date().toISOString().split('T')[0]

    // Return cached selection for today if it exists
    const cacheRaw = localStorage.getItem(`amor-fati-today-${today}`)
    const cache: Record<string, number> = cacheRaw ? JSON.parse(cacheRaw) : {}
    if (category in cache) return cache[category]

    // Load full history
    const allHistory: Record<string, Array<{ i: number; d: string }>> = JSON.parse(
      localStorage.getItem('amor-fati-prompt-history') || '{}'
    )
    const history = allHistory[category] ?? []

    // Find indices not shown in the cooldown window
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - cooldownDays)
    const recent = new Set(history.filter(h => new Date(h.d) >= cutoff).map(h => h.i))
    let available = Array.from({ length: total }, (_, i) => i).filter(i => !recent.has(i))

    // If all have been shown recently, use the oldest one
    if (available.length === 0) {
      const sorted = [...history].sort((a, b) => new Date(a.d).getTime() - new Date(b.d).getTime())
      available = [sorted[0]?.i ?? 0]
    }

    const chosen = available[Math.floor(Math.random() * available.length)]

    // Persist selection to history
    const updated = history.filter(h => h.i !== chosen)
    updated.push({ i: chosen, d: today })
    allHistory[category] = updated
    localStorage.setItem('amor-fati-prompt-history', JSON.stringify(allHistory))

    // Cache for today
    cache[category] = chosen
    localStorage.setItem(`amor-fati-today-${today}`, JSON.stringify(cache))

    return chosen
  } catch {
    return 0
  }
}
