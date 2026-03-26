'use client'
import { useState, useEffect } from 'react'

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

export function getTimeOfDay(hours?: number): TimeOfDay {
  const h = hours ?? new Date().getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 23) return 'evening'
  return 'night'
}

export function useTimeOfDay(): TimeOfDay {
  const [tod, setTod] = useState<TimeOfDay>('morning')

  useEffect(() => {
    setTod(getTimeOfDay())
    const interval = setInterval(() => setTod(getTimeOfDay()), 60_000)
    return () => clearInterval(interval)
  }, [])

  return tod
}
