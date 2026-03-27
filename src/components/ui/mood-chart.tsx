'use client'

interface MoodChartProps {
  data: { date: string; score: number }[]
}

const W = 400
const H = 160
const PAD_TOP = 12
const PAD_BOTTOM = 20
const CHART_H = H - PAD_TOP - PAD_BOTTOM // 128

function xForIndex(i: number) {
  return (i / 29) * W
}

function yForScore(score: number) {
  return PAD_TOP + ((5 - score) / 4) * CHART_H
}

type Point = { x: number; y: number }

export function MoodChart({ data }: MoodChartProps) {
  // Build score lookup map
  const scoreMap = new Map(data.map(d => [d.date, d.score]))

  // Normalize to exactly 30 days (oldest left, today right)
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })

  const normalized = days.map(d => scoreMap.get(d) ?? null)
  const hasData = normalized.some(s => s !== null)

  // Build contiguous segments
  const segments: Point[][] = []
  let current: Point[] = []
  normalized.forEach((score, i) => {
    if (score !== null) {
      current.push({ x: xForIndex(i), y: yForScore(score) })
    } else {
      if (current.length) { segments.push(current); current = [] }
    }
  })
  if (current.length) segments.push(current)

  // SVG path strings
  const strokePaths = segments.map(seg =>
    seg.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  )

  const areaPaths = segments.map(seg => {
    const linePart = seg.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    const bottomY = PAD_TOP + CHART_H
    return `${linePart} L ${seg[seg.length - 1].x.toFixed(1)} ${bottomY} L ${seg[0].x.toFixed(1)} ${bottomY} Z`
  })

  // Grid lines at each score level
  const gridYs = [1, 2, 3, 4, 5].map(yForScore)

  // Dots
  const dots: Point[] = []
  normalized.forEach((score, i) => {
    if (score !== null) dots.push({ x: xForIndex(i), y: yForScore(score) })
  })

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="moodAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8956a" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#c8956a" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines */}
      {gridYs.map((y, i) => (
        <line
          key={i}
          x1={0}
          y1={y}
          x2={W}
          y2={y}
          stroke="var(--border)"
          strokeWidth="0.5"
          opacity="0.6"
        />
      ))}

      {/* Area fills */}
      {areaPaths.map((d, i) => (
        <path key={i} d={d} fill="url(#moodAreaGrad)" />
      ))}

      {/* Stroke lines */}
      {strokePaths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* Dots */}
      {dots.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="var(--accent)" />
      ))}

      {/* Empty state */}
      {!hasData && (
        <text
          x={W / 2}
          y={H / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--foreground-subtle)"
          fontSize="12"
          fontFamily="var(--font-ui)"
          opacity="0.4"
        >
          No mood data yet
        </text>
      )}
    </svg>
  )
}
