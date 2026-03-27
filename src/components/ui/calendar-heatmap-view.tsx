'use client'

const MOOD_LABELS = ['', '😔', '😐', '🙂', '😊', '✨']
const CONTENT_LABELS: Record<string, string> = {
  intention: 'Intention',
  obstacle: 'Obstacle',
  gratitude: 'Gratitude',
  accomplished: 'Reflection',
  struggle: 'Honest account',
  lesson: 'Lesson',
  situation: 'Situation',
  what_i_control: 'What I control',
  what_i_dont_control: "What I don't control",
  action: 'Action',
}
const TYPE_ICONS: Record<string, string> = { morning: '◐', evening: '◑', practice: '◈' }
const TYPE_ORDER: Record<string, number> = { morning: 0, evening: 1, practice: 2 }
const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function cellColor(count: number): string {
  if (count === 0) return 'transparent'
  if (count === 1) return 'rgba(200,149,106,0.25)'
  if (count === 2) return 'rgba(200,149,106,0.5)'
  return 'var(--accent)'
}

function relativeTime(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface Entry {
  id: string
  type: 'morning' | 'evening' | 'practice'
  content: Record<string, string>
  mood_score: number | null
  entry_date: string
  created_at: string
}

interface CalendarHeatmapViewProps {
  entries: Entry[]
  month: string // "YYYY-MM"
  onMonthChange: (month: string) => void
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
  onOpenEntry: (entry: Entry) => void
}

export function CalendarHeatmapView({
  entries,
  month,
  onMonthChange,
  selectedDate,
  onSelectDate,
  onOpenEntry,
}: CalendarHeatmapViewProps) {
  const [year, mon] = month.split('-').map(Number)
  const firstDayOfWeek = new Date(year, mon - 1, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, mon, 0).getDate()
  const today = new Date().toISOString().split('T')[0]
  const monthLabel = new Date(year, mon - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Count entries per date for this month
  const countMap = new Map<string, number>()
  entries.forEach(e => {
    if (e.entry_date.startsWith(month)) {
      countMap.set(e.entry_date, (countMap.get(e.entry_date) ?? 0) + 1)
    }
  })

  // Navigate months
  function prevMonth() {
    const d = new Date(year, mon - 2, 1)
    onMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    onSelectDate(null)
  }
  function nextMonth() {
    const d = new Date(year, mon, 1)
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const nowMonth = today.slice(0, 7)
    if (next <= nowMonth) {
      onMonthChange(next)
      onSelectDate(null)
    }
  }

  const isCurrentMonth = month === today.slice(0, 7)

  // Build calendar cells: leading blanks + day numbers
  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  // Entries for selected date, sorted morning→evening→practice
  const selectedEntries = selectedDate
    ? entries
        .filter(e => e.entry_date === selectedDate)
        .sort((a, b) => (TYPE_ORDER[a.type] ?? 3) - (TYPE_ORDER[b.type] ?? 3))
    : []

  return (
    <div>
      {/* Month nav */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}
      >
        <button
          onClick={prevMonth}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--foreground-subtle)',
            opacity: 0.5,
            fontSize: '14px',
            padding: '4px 8px',
          }}
        >
          ←
        </button>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--foreground-subtle)',
            opacity: 0.7,
          }}
        >
          {monthLabel}
        </p>
        <button
          onClick={nextMonth}
          style={{
            background: 'none',
            border: 'none',
            cursor: isCurrentMonth ? 'not-allowed' : 'pointer',
            color: 'var(--foreground-subtle)',
            opacity: isCurrentMonth ? 0.2 : 0.5,
            fontSize: '14px',
            padding: '4px 8px',
          }}
          disabled={isCurrentMonth}
        >
          →
        </button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
        {DAY_HEADERS.map(d => (
          <div
            key={d}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '9px',
              letterSpacing: '0.1em',
              color: 'var(--foreground-subtle)',
              opacity: 0.35,
              textAlign: 'center',
              paddingBottom: '4px',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '1.5rem' }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />

          const dateStr = `${month}-${String(day).padStart(2, '0')}`
          const count = countMap.get(dateStr) ?? 0
          const isSelected = dateStr === selectedDate
          const isToday = dateStr === today
          const isFuture = dateStr > today

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              disabled={isFuture}
              style={{
                aspectRatio: '1',
                borderRadius: '5px',
                background: isSelected
                  ? 'var(--accent)'
                  : count > 0
                  ? cellColor(count)
                  : 'var(--card)',
                border: isToday && !isSelected
                  ? '1px solid var(--accent-dim)'
                  : isSelected
                  ? '1px solid var(--accent)'
                  : '1px solid var(--border)',
                cursor: isFuture ? 'default' : 'pointer',
                opacity: isFuture ? 0.2 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '10px',
                  color: isSelected ? '#0c0b0a' : count > 0 ? 'var(--foreground)' : 'var(--foreground-subtle)',
                  opacity: isSelected ? 1 : count > 0 ? 0.9 : 0.35,
                  lineHeight: 1,
                }}
              >
                {day}
              </span>
            </button>
          )
        })}
      </div>

      {/* Expanded entries for selected date */}
      {selectedDate && (
        <div>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '9px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--foreground-subtle)',
              opacity: 0.4,
              marginBottom: '0.75rem',
            }}
          >
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>

          {selectedEntries.length === 0 ? (
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.9rem',
                color: 'var(--foreground-muted)',
                fontStyle: 'italic',
                paddingBottom: '1rem',
              }}
            >
              No entries for this day.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.5rem' }}>
              {selectedEntries.map(entry => (
                <button
                  key={entry.id}
                  onClick={() => onOpenEntry(entry)}
                  className="w-full text-left"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-dim)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
                >
                  {/* Type + mood + time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '9px', letterSpacing: '0.18em', color: 'var(--accent)', textTransform: 'uppercase', opacity: 0.7 }}>
                      {TYPE_ICONS[entry.type]} {entry.type}
                    </span>
                    {entry.mood_score && (
                      <span style={{ fontSize: '12px' }}>{MOOD_LABELS[entry.mood_score]}</span>
                    )}
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '9px', color: 'var(--foreground-subtle)', opacity: 0.3, marginLeft: 'auto', letterSpacing: '0.04em' }}>
                      {relativeTime(entry.created_at)}
                    </span>
                  </div>

                  {/* All content snippets */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {Object.entries(entry.content).map(([key, value]) =>
                      value ? (
                        <div key={key}>
                          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--foreground-subtle)', opacity: 0.4 }}>
                            {CONTENT_LABELS[key] ?? key}
                            {' · '}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '0.85rem',
                              color: 'var(--foreground-muted)',
                              lineHeight: 1.5,
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {value}
                          </span>
                        </div>
                      ) : null
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
