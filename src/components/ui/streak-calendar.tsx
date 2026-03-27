'use client'

interface StreakCalendarProps {
  entries: { entry_date: string }[]
}

const DAYS = 91
const COLS = 7
const CELL = 10
const GAP = 3

function cellColor(count: number): string {
  if (count === 0) return 'rgba(255,255,255,0.04)'
  if (count === 1) return 'rgba(200,149,106,0.25)'
  if (count === 2) return 'rgba(200,149,106,0.5)'
  return 'var(--accent)'
}

export function StreakCalendar({ entries }: StreakCalendarProps) {
  // Generate 91 dates: oldest (top-left) → today (bottom-right)
  const dates = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (DAYS - 1 - i))
    return d.toISOString().split('T')[0]
  })

  // Count entries per date
  const countMap = new Map<string, number>()
  entries.forEach(e => {
    countMap.set(e.entry_date, (countMap.get(e.entry_date) ?? 0) + 1)
  })

  // Month labels: record first appearance of each new month
  const monthLabels = new Map<number, string>()
  dates.forEach((dateStr, i) => {
    const col = i % COLS
    const d = new Date(dateStr + 'T00:00:00')
    if (d.getDate() === 1 && !monthLabels.has(col)) {
      monthLabels.set(col, d.toLocaleDateString('en-US', { month: 'short' }))
    }
  })

  return (
    <div>
      {/* Month label row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
          gap: `${GAP}px`,
          marginBottom: '5px',
        }}
      >
        {Array.from({ length: COLS }, (_, col) => (
          <div
            key={col}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '8px',
              color: 'var(--foreground-subtle)',
              opacity: 0.4,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              height: '10px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {monthLabels.get(col) ?? ''}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
          gridTemplateRows: `repeat(13, ${CELL}px)`,
          gap: `${GAP}px`,
        }}
      >
        {dates.map(dateStr => {
          const count = countMap.get(dateStr) ?? 0
          return (
            <div
              key={dateStr}
              title={`${dateStr} · ${count} entr${count === 1 ? 'y' : 'ies'}`}
              style={{
                width: CELL,
                height: CELL,
                borderRadius: '2px',
                background: cellColor(count),
                border: count === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
