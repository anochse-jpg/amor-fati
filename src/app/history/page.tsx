'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { computeStreak } from '@/lib/utils'
import { Nav } from '@/components/ui'
import { JolyButton } from '@/components/ui/joly-button'
import { CalendarHeatmapView } from '@/components/ui/calendar-heatmap-view'

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}

const DAY_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const dayVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: DAY_EASE } },
}

interface Entry {
  id: string
  type: 'morning' | 'evening' | 'practice'
  content: Record<string, string>
  mood_score: number | null
  entry_date: string
  created_at: string
}

type FilterType = 'all' | 'morning' | 'evening' | 'practice'

const MOOD_LABELS = ['', '😔', '😐', '🙂', '😊', '✨']

const CONTENT_LABELS: Record<string, string> = {
  intention: 'Intention',
  obstacle: 'Obstacle',
  gratitude: 'Gratitude',
  accomplished: 'What went well',
  struggle: 'Where I fell short',
  lesson: 'Lesson',
  situation: 'The situation',
  what_i_control: 'What I control',
  what_i_dont_control: "What I don't control",
  action: 'The action',
}

// Morning first, then evening, then practice within each day
const TYPE_ORDER: Record<string, number> = { morning: 0, evening: 1, practice: 2 }

const TYPE_ICONS: Record<string, string> = { morning: '◐', evening: '◑', practice: '◈' }

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: '◐  Morning', value: 'morning' },
  { label: '◑  Evening', value: 'evening' },
  { label: '◈  Practice', value: 'practice' },
]

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

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function HistoryPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Entry | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortDesc, setSortDesc] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [calendarDate, setCalendarDate] = useState<string | null>(null)

  function handleDateInput(val: string) {
    // Auto-format: insert slashes after dd and mm as user types
    const digits = val.replace(/\D/g, '').slice(0, 8)
    let formatted = digits
    if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`
    if (digits.length > 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
    setDateInput(formatted)

    // Parse to YYYY-MM-DD once fully entered
    if (digits.length === 8) {
      const dd = digits.slice(0, 2), mm = digits.slice(2, 4), yyyy = digits.slice(4)
      const d = parseInt(dd), m = parseInt(mm), y = parseInt(yyyy)
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2000 && y <= 2099) {
        setDateFilter(`${yyyy}-${mm}-${dd}`)
        return
      }
    }
    setDateFilter('')
  }

  function clearDate() {
    setDateInput('')
    setDateFilter('')
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Fetch at least 365 days of entries (up to 2000 to cover power users)
      const oneYearAgo = new Date()
      oneYearAgo.setDate(oneYearAgo.getDate() - 365)

      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('entry_date', oneYearAgo.toISOString().split('T')[0])
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(2000)

      setEntries(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const streak = useMemo(() => computeStreak(entries.map(e => e.entry_date)), [entries])

  // Filter then sort by date direction
  const groupedArray = useMemo(() => {
    const q = search.toLowerCase().trim()
    const filtered = entries
      .filter(e => filter === 'all' || e.type === filter)
      .filter(e => !dateFilter || e.entry_date === dateFilter)
      .filter(e => {
        if (!q) return true
        return Object.values(e.content).some(v => typeof v === 'string' && v.toLowerCase().includes(q))
      })

    const groups: Record<string, Entry[]> = {}
    filtered.forEach(entry => {
      if (!groups[entry.entry_date]) groups[entry.entry_date] = []
      groups[entry.entry_date].push(entry)
    })

    // Within each day: morning → evening → practice
    Object.values(groups).forEach(dayEntries => {
      dayEntries.sort((a, b) => (TYPE_ORDER[a.type] ?? 3) - (TYPE_ORDER[b.type] ?? 3))
    })

    // Sort date groups newest or oldest first
    return Object.entries(groups).sort(([a], [b]) =>
      sortDesc ? b.localeCompare(a) : a.localeCompare(b)
    )
  }, [entries, filter, sortDesc, search, dateFilter])

  const totalFiltered = groupedArray.reduce((sum, [, day]) => sum + day.length, 0)

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--accent)',
            opacity: 0.4,
            animation: 'breathe 2s ease-in-out infinite',
          }}
        />
      </main>
    )
  }

  // ─── Detail view ──────────────────────────────────────────────────────────────
  if (selected) {
    return (
      <main className="min-h-screen flex flex-col px-6 pb-28">
        <div className="max-w-lg mx-auto w-full pt-12 animate-fade-up">
          <JolyButton
            variant="ghost"
            size="sm"
            onClick={() => setSelected(null)}
            className="mb-8"
          >
            ← All entries
          </JolyButton>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                  opacity: 0.8,
                }}
              >
                {TYPE_ICONS[selected.type]} {selected.type}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  color: 'var(--foreground-subtle)',
                  opacity: 0.5,
                }}
              >
                {formatDate(selected.entry_date)}
              </span>
            </div>
            {selected.mood_score && (
              <span style={{ fontSize: '1.4rem' }}>{MOOD_LABELS[selected.mood_score]}</span>
            )}
          </div>

          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
            }}
          >
            {Object.entries(selected.content).map(([key, value]) =>
              value ? (
                <div key={key}>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '10px',
                      letterSpacing: '0.16em',
                      color: 'var(--foreground-subtle)',
                      textTransform: 'uppercase',
                      marginBottom: '0.6rem',
                      opacity: 0.6,
                    }}
                  >
                    {CONTENT_LABELS[key] || key}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      color: 'var(--foreground)',
                      lineHeight: 1.8,
                      fontWeight: 300,
                    }}
                  >
                    {value}
                  </p>
                </div>
              ) : null
            )}
          </div>
        </div>
        <Nav current="/history" />
      </main>
    )
  }

  // ─── List view ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen flex flex-col px-6 pb-28">
      <div className="max-w-lg mx-auto w-full pt-12">

        {/* Header */}
        <div className="mb-6 animate-fade-up">
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '10px',
              letterSpacing: '0.2em',
              color: 'var(--accent)',
              textTransform: 'uppercase',
              marginBottom: '0.4rem',
              opacity: 0.8,
            }}
          >
            Journal
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 400,
                color: 'var(--foreground)',
              }}
            >
              Your practice
            </h1>
            {streak > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  marginBottom: '2px',
                }}
              >
                <span style={{ fontSize: '11px', opacity: 0.8 }}>◈</span>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '11px',
                    color: 'var(--accent)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {streak} day{streak !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* List / Calendar toggle */}
        <div className="animate-fade-up delay-100" style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem' }}>
          {(['list', 'calendar'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '5px 14px',
                borderRadius: '20px',
                border: view === v ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: view === v ? 'var(--accent)' : 'transparent',
                color: view === v ? '#0c0b0a' : 'var(--foreground-subtle)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {v === 'list' ? '◫  List' : '◻  Calendar'}
            </button>
          ))}
        </div>

        {/* Calendar view */}
        {view === 'calendar' && (
          <div
            className="animate-fade-up"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', marginBottom: '1.5rem' }}
          >
            <CalendarHeatmapView
              entries={entries}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              selectedDate={calendarDate}
              onSelectDate={setCalendarDate}
              onOpenEntry={setSelected}
            />
          </div>
        )}

        {/* Search + date filter — list view only */}
        {view === 'list' && <div
          className="animate-fade-up delay-100"
          style={{ marginBottom: '1rem' }}
          onFocus={() => setSearchFocused(true)}
          onBlur={e => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setSearchFocused(false)
            }
          }}
        >
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--foreground-subtle)',
              opacity: 0.4,
              fontSize: '12px',
              pointerEvents: 'none',
            }}>
              ⌕
            </span>
            <input
              type="text"
              placeholder="Search entries…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--card)',
                border: `1px solid ${searchFocused || dateFilter ? 'var(--accent-dim)' : 'var(--border)'}`,
                borderRadius: searchFocused ? '8px 8px 0 0' : '8px',
                padding: '9px 12px 9px 30px',
                fontFamily: 'var(--font-ui)',
                fontSize: '12px',
                color: 'var(--foreground)',
                outline: 'none',
                transition: 'border-color 0.15s ease, border-radius 0.15s ease',
              }}
            />
            {/* Active date badge */}
            {dateFilter && !searchFocused && (
              <button
                onMouseDown={e => e.preventDefault()}
                onClick={clearDate}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'var(--card)',
                  border: '1px solid var(--accent-dim)',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '10px',
                  color: 'var(--accent)',
                  letterSpacing: '0.06em',
                }}
              >
                {dateInput} ×
              </button>
            )}
            {/* Clear text search */}
            {search && !dateFilter && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--foreground-subtle)',
                  opacity: 0.5,
                  fontSize: '14px',
                  lineHeight: 1,
                  padding: '2px',
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Date input — visible only when search is focused */}
          {searchFocused && (
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--accent-dim)',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '9px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--foreground-subtle)',
                opacity: 0.45,
                whiteSpace: 'nowrap',
              }}>
                Date
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/YYYY"
                value={dateInput}
                onChange={e => handleDateInput(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: dateFilter ? 'var(--accent)' : 'var(--foreground)',
                  letterSpacing: '0.08em',
                }}
              />
              {dateInput && (
                <button
                  onMouseDown={e => e.preventDefault()}
                  onClick={clearDate}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--foreground-subtle)',
                    opacity: 0.5,
                    fontSize: '14px',
                    lineHeight: 1,
                    padding: '0 2px',
                  }}
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>}

        {/* Filter tabs + sort toggle — list view only */}
        {view === 'list' && <>
        <div
          className="animate-fade-up delay-100"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem', flexWrap: 'wrap' }}
        >
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '5px 11px',
                borderRadius: '20px',
                border: filter === f.value ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: filter === f.value ? 'var(--accent)' : 'transparent',
                color: filter === f.value ? '#0c0b0a' : 'var(--foreground-subtle)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setSortDesc(s => !s)}
            style={{
              marginLeft: 'auto',
              fontFamily: 'var(--font-ui)',
              fontSize: '10px',
              letterSpacing: '0.12em',
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--foreground-subtle)',
              cursor: 'pointer',
              opacity: 0.6,
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.6' }}
          >
            {sortDesc ? '↓ Newest' : '↑ Oldest'}
          </button>
        </div>

        {/* Empty state */}
        {entries.length === 0 ? (
          <div className="text-center py-20 animate-fade-up delay-100">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid var(--border)',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: 'var(--foreground-subtle)', fontSize: '14px' }}>◫</span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                color: 'var(--foreground-muted)',
                marginBottom: '0.5rem',
              }}
            >
              No entries yet.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '12px',
                color: 'var(--foreground-subtle)',
                marginBottom: '2rem',
                opacity: 0.6,
              }}
            >
              Begin today&apos;s practice to see your entries here.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '260px', margin: '0 auto' }}>
              <JolyButton asChild>
                <a href="/morning">Morning reflection</a>
              </JolyButton>
              <JolyButton variant="outline" asChild>
                <a href="/evening">Evening reflection</a>
              </JolyButton>
            </div>
          </div>
        ) : groupedArray.length === 0 ? (
          // Filtered empty state
          <div className="text-center py-16 animate-fade-up delay-100">
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                color: 'var(--foreground-muted)',
                marginBottom: '0.5rem',
              }}
            >
              No {filter} entries yet.
            </p>
            <button
              onClick={() => setFilter('all')}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '11px',
                color: 'var(--accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                opacity: 0.8,
              }}
            >
              Show all entries
            </button>
          </div>
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
          >
            {groupedArray.map(([date, dayEntries]) => {
              const dayMood = dayEntries
                .map(e => e.mood_score)
                .filter(Boolean)
                .sort((a, b) => (b ?? 0) - (a ?? 0))[0]

              return (
                <motion.div key={date} variants={dayVariants} style={{ marginBottom: '2rem' }}>
                  {/* Date heading — richer: date + entry count + top mood */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '10px',
                        letterSpacing: '0.14em',
                        color: 'var(--foreground-subtle)',
                        textTransform: 'uppercase',
                        opacity: 0.5,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatDate(date)}
                    </p>
                    {dayMood && (
                      <span style={{ fontSize: '11px', opacity: 0.7 }}>{MOOD_LABELS[dayMood]}</span>
                    )}
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '9px',
                        color: 'var(--foreground-subtle)',
                        opacity: 0.3,
                        letterSpacing: '0.08em',
                      }}
                    >
                      {dayEntries.length} {dayEntries.length === 1 ? 'entry' : 'entries'}
                    </span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.5 }} />
                  </div>

                  {/* Entries for that day */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {dayEntries.map(entry => (
                      <button
                        key={entry.id}
                        onClick={() => setSelected(entry)}
                        className="w-full text-left cursor-pointer group"
                        style={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          padding: '14px 16px',
                          transition: 'border-color 0.15s ease',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-dim)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
                      >
                        {/* Type + mood + relative time */}
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

                        {/* All content fields as snippets */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {Object.entries(entry.content).map(([key, value]) =>
                            value ? (
                              <p
                                key={key}
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
                                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4, marginRight: '4px' }}>
                                  {CONTENT_LABELS[key] ?? key} ·
                                </span>
                                {value}
                              </p>
                            ) : null
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )
            })}

            {/* Footer */}
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '11px',
                color: 'var(--foreground-subtle)',
                opacity: 0.3,
                textAlign: 'center',
                paddingTop: '1rem',
              }}
            >
              {totalFiltered} entr{totalFiltered === 1 ? 'y' : 'ies'}
              {filter !== 'all' ? ` · ${filter} only` : ' · all time'}
            </p>
          </motion.div>
        )}
        </>}
      </div>
      <Nav current="/history" />
    </main>
  )
}
