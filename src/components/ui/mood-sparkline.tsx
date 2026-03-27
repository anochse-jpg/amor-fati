// 7-day inline SVG mood sparkline
// data: array of 7 values, each is a mood score 1-5 or null (no entry that day)

interface MoodSparklineProps {
  data: (number | null)[]
}

const W = 88
const H = 28
const PAD_X = 4
const PAD_Y = 4

function moodToY(score: number): number {
  // mood 5 = top (low Y), mood 1 = bottom (high Y)
  return PAD_Y + ((5 - score) / 4) * (H - PAD_Y * 2)
}

function xPos(index: number, total: number): number {
  return PAD_X + (index / (total - 1)) * (W - PAD_X * 2)
}

export function MoodSparkline({ data }: MoodSparklineProps) {
  const points = data.map((score, i) =>
    score !== null ? { x: xPos(i, data.length), y: moodToY(score), score } : null
  )

  // Build polyline path segments (skip nulls)
  const segments: string[][] = []
  let current: string[] = []
  points.forEach(p => {
    if (p) {
      current.push(`${p.x},${p.y}`)
    } else {
      if (current.length > 1) segments.push(current)
      current = []
    }
  })
  if (current.length > 1) segments.push(current)

  const hasData = points.some(p => p !== null)

  if (!hasData) return null

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Polyline segments */}
      {segments.map((seg, i) => (
        <polyline
          key={i}
          points={seg.join(' ')}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.2"
          strokeOpacity="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* Dots */}
      {points.map((p, i) =>
        p ? (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2.2"
            fill="var(--accent)"
            opacity="0.8"
          />
        ) : (
          <circle
            key={i}
            cx={xPos(i, data.length)}
            cy={H / 2}
            r="1.5"
            fill="var(--border)"
            opacity="0.5"
          />
        )
      )}
    </svg>
  )
}
