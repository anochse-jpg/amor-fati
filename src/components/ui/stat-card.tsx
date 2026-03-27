'use client'

import { useEffect, useState, useRef } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface StatCardProps {
  label: string
  value: number | null
  unit?: string
  decimals?: number
}

export function StatCard({ label, value, unit, decimals = 0 }: StatCardProps) {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (value === null) return
    const start = performance.now()
    const duration = 800

    function tick(now: number) {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3) // cubic ease-out
      setDisplayed(parseFloat((eased * value!).toFixed(decimals)))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, decimals])

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '20px',
      }}
    >
      {value === null ? (
        <div>
          <Skeleton height="2rem" borderRadius="4px" style={{ marginBottom: '8px', width: '60%' }} />
          <Skeleton height="10px" borderRadius="3px" style={{ width: '50%' }} />
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                fontWeight: 400,
                color: 'var(--foreground)',
                lineHeight: 1.1,
              }}
            >
              {displayed.toFixed(decimals)}
            </span>
            {unit && (
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '11px',
                  color: 'var(--accent)',
                  letterSpacing: '0.1em',
                  opacity: 0.7,
                }}
              >
                {unit}
              </span>
            )}
          </div>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--foreground-subtle)',
              opacity: 0.5,
              marginTop: '6px',
            }}
          >
            {label}
          </p>
        </>
      )}
    </div>
  )
}
