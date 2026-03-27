'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { Nav, PageHeader } from '@/components/ui'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { MoodChart } from '@/components/ui/mood-chart'
import { StreakCalendar } from '@/components/ui/streak-calendar'
import { computeStreak, computeLongestStreak } from '@/lib/utils'
import type { CSSProperties } from 'react'

interface Entry {
  entry_date: string
  mood_score: number | null
  type: string
}

const sectionLabelStyle: CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '9px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--foreground-subtle)',
  opacity: 0.35,
  marginBottom: '0.85rem',
}

export default function InsightsPage() {
  const [entries, setEntries] = useState<Entry[] | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        window.location.href = '/login'
        return
      }

      const since = new Date()
      since.setDate(since.getDate() - 365)

      supabase
        .from('journal_entries')
        .select('entry_date, mood_score, type')
        .eq('user_id', user.id)
        .gte('entry_date', since.toISOString().split('T')[0])
        .order('entry_date', { ascending: false })
        .then(({ data }) => setEntries(data || []))
    })
  }, [])

  // ── Derived stats ──────────────────────────────────────────────────────────

  const dates = useMemo(() => entries?.map(e => e.entry_date) ?? [], [entries])

  const totalEntries = useMemo(
    () => (entries !== null ? entries.length : null),
    [entries]
  )

  const currentStreak = useMemo(
    () => (entries !== null ? computeStreak(dates) : null),
    [entries, dates]
  )

  const longestStreak = useMemo(
    () => (entries !== null ? computeLongestStreak(dates) : null),
    [entries, dates]
  )

  const avgMood = useMemo(() => {
    if (entries === null) return null
    const scores = entries.filter(e => e.mood_score !== null).map(e => e.mood_score!)
    if (scores.length === 0) return null
    return scores.reduce((sum, s) => sum + s, 0) / scores.length
  }, [entries])

  const moodChartData = useMemo(() => {
    if (!entries) return []
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const cutoffStr = cutoff.toISOString().split('T')[0]
    return entries
      .filter(e => e.entry_date >= cutoffStr && e.mood_score !== null)
      .map(e => ({ date: e.entry_date, score: e.mood_score! }))
  }, [entries])

  const calendarEntries = useMemo(() => {
    if (!entries) return []
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 90)
    const cutoffStr = cutoff.toISOString().split('T')[0]
    return entries.filter(e => e.entry_date >= cutoffStr)
  }, [entries])

  return (
    <main className="min-h-screen flex flex-col pb-28">
      <div className="max-w-lg mx-auto w-full px-6 pt-12">

        <PageHeader label="reflection patterns" title="Your Insights" />

        {/* ── Stats 2×2 ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ marginBottom: '2.5rem' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <StatCard label="Total entries" value={totalEntries} />
            <StatCard label="Current streak" value={currentStreak} unit="days" />
            <StatCard label="Longest streak" value={longestStreak} unit="days" />
            <StatCard label="Avg mood" value={avgMood} unit="/ 5" decimals={1} />
          </div>
        </motion.div>

        {/* ── 30-day mood chart ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ marginBottom: '2.5rem' }}
        >
          <p style={sectionLabelStyle}>30-day mood</p>
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '20px',
            }}
          >
            {entries === null ? (
              <Skeleton height="160px" borderRadius="6px" />
            ) : (
              <MoodChart data={moodChartData} />
            )}
          </div>
        </motion.div>

        {/* ── 90-day heatmap ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{ marginBottom: '2rem' }}
        >
          <p style={sectionLabelStyle}>90-day calendar</p>
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '20px',
            }}
          >
            {entries === null ? (
              <Skeleton height="170px" borderRadius="6px" />
            ) : (
              <StreakCalendar entries={calendarEntries} />
            )}
          </div>
        </motion.div>

      </div>
      <Nav current="/insights" />
    </main>
  )
}
