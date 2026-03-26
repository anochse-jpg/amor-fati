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
