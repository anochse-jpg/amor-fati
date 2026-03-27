'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Nav } from '@/components/ui'
import { useTimeOfDay } from '@/hooks/useTimeOfDay'
import { selectDailyPrompt, computeStreak } from '@/lib/utils'
import { StreakBadge } from '@/components/ui/streak-badge'
import { MoodSparkline } from '@/components/ui/mood-sparkline'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Quote bank ───────────────────────────────────────────────────────────────

const HOME_QUOTES = [
  { text: 'Amor fati — love your fate, which is in fact your life.', author: 'Friedrich Nietzsche' },
  { text: 'You have power over your mind — not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
  { text: 'The obstacle is the way.', author: 'Marcus Aurelius' },
  { text: 'Waste no more time arguing about what a good man should be. Be one.', author: 'Marcus Aurelius' },
  { text: 'He who is brave is free.', author: 'Seneca' },
  { text: 'It is not the man who has too little, but the man who craves more, that is poor.', author: 'Seneca' },
  { text: 'If you are distressed by anything external, the pain is not due to the thing itself, but to your estimate of it.', author: 'Marcus Aurelius' },
  { text: 'Begin at once to live, and count each separate day as a separate life.', author: 'Seneca' },
  { text: 'The whole future lies in uncertainty: live immediately.', author: 'Seneca' },
  { text: 'Make the best use of what is in your power, and take the rest as it happens.', author: 'Epictetus' },
  { text: 'Never let the future disturb you. You will meet it with the same weapons of reason which today arm you against the present.', author: 'Marcus Aurelius' },
  { text: 'He who fears death will never do anything worthy of a man who is alive.', author: 'Seneca' },
  { text: "It's not what happens to you, but how you react to it that matters.", author: 'Epictetus' },
  { text: 'The happiness of your life depends upon the quality of your thoughts.', author: 'Marcus Aurelius' },
  { text: 'We suffer more in imagination than in reality.', author: 'Seneca' },
  { text: 'Receive without pride, relinquish without struggle.', author: 'Marcus Aurelius' },
  { text: 'All things, Lucilius, belong to others; time alone is ours.', author: 'Seneca' },
  { text: 'No man was ever wise by chance.', author: 'Seneca' },
  { text: 'First say to yourself what you would be; and then do what you have to do.', author: 'Epictetus' },
  { text: 'There is only one way to happiness and that is to cease worrying about things which are beyond the power of our will.', author: 'Epictetus' },
  { text: 'Accept the things to which fate binds you, and love the people with whom fate brings you together.', author: 'Marcus Aurelius' },
  { text: 'How long are you going to wait before you demand the best for yourself?', author: 'Epictetus' },
  { text: 'The more we value things outside our control, the less control we have.', author: 'Epictetus' },
  { text: 'A gem cannot be polished without friction, nor a man perfected without trials.', author: 'Seneca' },
  { text: 'To bear trials with a calm mind robs misfortune of its strength and burden.', author: 'Seneca' },
  { text: 'Nothing befalls a man except what is in his nature to endure.', author: 'Marcus Aurelius' },
  { text: 'Confine yourself to the present.', author: 'Marcus Aurelius' },
  { text: 'We are more often frightened than hurt; and we suffer more in imagination than in reality.', author: 'Seneca' },
  { text: 'Dwell on the beauty of life. Watch the stars, and see yourself running with them.', author: 'Marcus Aurelius' },
  { text: 'Very little is needed to make a happy life; it is all within yourself, in your way of thinking.', author: 'Marcus Aurelius' },
]

// ─── Reflection seeds ─────────────────────────────────────────────────────────

const REFLECTION_SEEDS = [
  { prompt: 'What would it mean to truly love this day — exactly as it is?', theme: 'amor fati' },
  { prompt: 'Which of your worries today exist only in imagination?', theme: 'presence' },
  { prompt: 'If this were your last ordinary day, what would you notice differently?', theme: 'memento mori' },
  { prompt: 'What is within your power to change right now?', theme: 'control' },
  { prompt: 'Who are you becoming through the choices you make today?', theme: 'character' },
  { prompt: 'What discomfort, if welcomed, might make you stronger?', theme: 'adversity' },
  { prompt: 'What does your body, breath, or silence have to teach you right now?', theme: 'stillness' },
  { prompt: 'What are you postponing that deserves your full presence?', theme: 'action' },
  { prompt: 'If you stripped everything to its essence, what remains worth protecting?', theme: 'values' },
  { prompt: 'What would the wisest version of you say about today so far?', theme: 'wisdom' },
  { prompt: 'Where are you fighting what cannot be changed?', theme: 'acceptance' },
  { prompt: 'What would you regret not having said or done?', theme: 'urgency' },
]

// ─── Time-aware content ───────────────────────────────────────────────────────

const TIME_CONFIG = {
  morning: {
    salutation: 'Good morning',
    headline: 'The day begins.',
    subline: 'Set your intention before the world claims your attention.',
    primaryPractice: 'morning' as const,
    ambientGlow: 'rgba(200, 149, 106, 0.06)',
  },
  afternoon: {
    salutation: 'Good afternoon',
    headline: 'The day unfolds.',
    subline: 'Pause. Breathe. Return to what matters most.',
    primaryPractice: 'morning' as const,
    ambientGlow: 'rgba(200, 149, 106, 0.05)',
  },
  evening: {
    salutation: 'Good evening',
    headline: 'The day draws to a close.',
    subline: 'A moment of reflection is the examined life in practice.',
    primaryPractice: 'evening' as const,
    ambientGlow: 'rgba(91, 143, 168, 0.06)',
  },
  night: {
    salutation: 'Good night',
    headline: 'The night belongs to reflection.',
    subline: 'What you carry to sleep shapes who you become tomorrow.',
    primaryPractice: 'evening' as const,
    ambientGlow: 'rgba(91, 143, 168, 0.05)',
  },
}

// ─── Practice card ────────────────────────────────────────────────────────────

function PracticeCard({
  type,
  isPrimary,
  delay,
  completed,
}: {
  type: 'morning' | 'evening'
  isPrimary: boolean
  delay: number
  completed: boolean
}) {
  const config = {
    morning: {
      href: '/morning',
      icon: '◐',
      title: 'Morning Practice',
      description: 'Set intention. Face obstacles. Find gratitude.',
      label: completed ? 'REVIEW MORNING' : 'BEGIN MORNING',
      time: '5 – 12 min',
    },
    evening: {
      href: '/evening',
      icon: '◑',
      title: 'Evening Reflection',
      description: 'Review the day. Release what you carry. Rest clear.',
      label: completed ? 'REVIEW EVENING' : 'BEGIN EVENING',
      time: '5 – 10 min',
    },
  }[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }}
    >
      <Link href={config.href} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          style={{
            background: isPrimary ? 'var(--card)' : 'transparent',
            border: isPrimary
              ? `1px solid ${completed ? 'var(--border)' : 'var(--accent-dim)'}`
              : '1px solid var(--border)',
            borderRadius: '12px',
            padding: isPrimary ? '24px' : '18px 20px',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: isPrimary && !completed
              ? '0 0 0 1px rgba(200,149,106,0.06), 0 4px 24px rgba(0,0,0,0.18)'
              : 'none',
            opacity: completed && !isPrimary ? 0.45 : 1,
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = 'var(--accent)'
            el.style.boxShadow = isPrimary
              ? '0 0 0 1px rgba(200,149,106,0.12), 0 8px 32px rgba(0,0,0,0.25), 0 0 40px rgba(200,149,106,0.08)'
              : '0 0 12px rgba(200,149,106,0.1)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = isPrimary
              ? completed ? 'var(--border)' : 'var(--accent-dim)'
              : 'var(--border)'
            el.style.boxShadow = isPrimary && !completed
              ? '0 0 0 1px rgba(200,149,106,0.06), 0 4px 24px rgba(0,0,0,0.18)'
              : 'none'
          }}
        >
          {/* Ambient glow on primary card (only when not completed) */}
          {isPrimary && !completed && (
            <div
              style={{
                position: 'absolute',
                top: 0, right: 0,
                width: '120px', height: '80px',
                background: 'radial-gradient(ellipse at top right, rgba(200,149,106,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              {/* Icon + title + completed check */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: isPrimary ? '16px' : '13px', color: 'var(--accent)', opacity: isPrimary ? 1 : 0.55 }}>
                  {config.icon}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: isPrimary ? '11px' : '10px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: isPrimary ? 'var(--accent)' : 'var(--foreground-subtle)',
                    opacity: isPrimary ? 0.85 : 0.45,
                  }}
                >
                  {config.title}
                </span>
                {completed && (
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '9px',
                      color: 'var(--accent)',
                      opacity: 0.6,
                      letterSpacing: '0.1em',
                    }}
                  >
                    · done
                  </span>
                )}
              </div>

              {isPrimary && (
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9rem',
                    color: 'var(--foreground-muted)',
                    lineHeight: 1.7,
                    marginBottom: '16px',
                    fontWeight: 300,
                  }}
                >
                  {config.description}
                </p>
              )}

              {/* CTA + time */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '11px',
                    letterSpacing: '0.14em',
                    color: isPrimary ? 'var(--accent)' : 'var(--foreground-subtle)',
                    opacity: isPrimary ? 1 : 0.4,
                  }}
                >
                  {config.label} →
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--foreground-subtle)',
                    opacity: 0.3,
                  }}
                >
                  {config.time}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Quick link card ──────────────────────────────────────────────────────────

function QuickLink({
  href,
  icon,
  label,
  sub,
  delay,
}: {
  href: string
  icon: string
  label: string
  sub: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      style={{ flex: 1 }}
    >
      <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = 'var(--accent-dim)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = 'var(--border)'
          }}
        >
          <div style={{ fontSize: '14px', color: 'var(--accent)', opacity: 0.7, marginBottom: '6px' }}>
            {icon}
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--foreground)', marginBottom: '2px', letterSpacing: '0.02em' }}>
            {label}
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--foreground-subtle)', opacity: 0.45 }}>
            {sub}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Entry type for home data ─────────────────────────────────────────────────

interface HomeEntry {
  entry_date: string
  type: 'morning' | 'evening' | 'practice'
  mood_score: number | null
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const timeOfDay = useTimeOfDay()
  const config = TIME_CONFIG[timeOfDay]
  const [userName, setUserName] = useState<string | null>(null)
  const [quote, setQuote] = useState(HOME_QUOTES[0])
  const [seed, setSeed] = useState(REFLECTION_SEEDS[0])
  const [entries, setEntries] = useState<HomeEntry[] | null>(null)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    // Pick today's quote & reflection seed
    const qIdx = selectDailyPrompt('home-quote', HOME_QUOTES.length, 14)
    const sIdx = selectDailyPrompt('home-seed', REFLECTION_SEEDS.length, 7)
    setQuote(HOME_QUOTES[qIdx])
    setSeed(REFLECTION_SEEDS[sIdx])

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return

      const meta = user.user_metadata
      const name = meta?.full_name || meta?.name || meta?.first_name || null
      if (name) setUserName(name.split(' ')[0])

      // Fetch last 90 days: dates + types + moods (single query covers all home needs)
      const since = new Date()
      since.setDate(since.getDate() - 90)
      supabase
        .from('journal_entries')
        .select('entry_date, type, mood_score')
        .eq('user_id', user.id)
        .gte('entry_date', since.toISOString().split('T')[0])
        .order('entry_date', { ascending: false })
        .then(({ data }) => {
          setEntries(data || [])
        })
    })
  }, [])

  // ── Derived stats ────────────────────────────────────────────────────────────
  const streak = useMemo(() => {
    if (!entries) return 0
    return computeStreak(entries.map(e => e.entry_date))
  }, [entries])

  const todayMorningDone = useMemo(
    () => !!entries?.some(e => e.entry_date === todayStr && e.type === 'morning'),
    [entries, todayStr]
  )

  const todayEveningDone = useMemo(
    () => !!entries?.some(e => e.entry_date === todayStr && e.type === 'evening'),
    [entries, todayStr]
  )

  const thirtyDayCount = useMemo(() => {
    if (!entries) return null
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const cutoffStr = cutoff.toISOString().split('T')[0]
    return entries.filter(e => e.entry_date >= cutoffStr).length
  }, [entries])

  // 7-day sparkline data: one value per day (highest mood score that day, or null)
  const sparklineData = useMemo((): (number | null)[] => {
    if (!entries) return Array(7).fill(null)
    const sevenDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split('T')[0]
    })
    const moodByDate: Record<string, number> = {}
    entries.forEach(e => {
      if (e.mood_score && sevenDays.includes(e.entry_date)) {
        if (!moodByDate[e.entry_date] || e.mood_score > moodByDate[e.entry_date]) {
          moodByDate[e.entry_date] = e.mood_score
        }
      }
    })
    return sevenDays.map(d => moodByDate[d] ?? null)
  }, [entries])

  // Smart CTA: when both done, show insights link
  const bothDoneToday = todayMorningDone && todayEveningDone

  const isPrimaryMorning = config.primaryPractice === 'morning'

  return (
    <main className="min-h-screen flex flex-col pb-28 relative overflow-x-hidden">

      {/* Ambient background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${config.ambientGlow} 0%, transparent 70%)`,
        }} />
      </div>

      <div className="max-w-lg mx-auto w-full px-6 pt-12 relative" style={{ zIndex: 1 }}>

        {/* ── Brand mark ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2.5rem', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              border: '1px solid var(--accent-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 12px rgba(200,149,106,0.18)',
            }}>
              <span style={{ color: 'var(--accent)', fontSize: '13px', lineHeight: 1 }}>∞</span>
            </div>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '10px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--foreground-subtle)',
              opacity: 0.4,
            }}>
              Amor Fati
            </span>
          </div>
          <Link href="/settings" style={{ display: 'flex', alignItems: 'center', opacity: 0.4, textDecoration: 'none' }}>
            <Settings size={14} color="var(--foreground-subtle)" />
          </Link>
        </motion.div>

        {/* ── Greeting ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          style={{ marginBottom: '2.5rem' }}
        >
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '10px',
            letterSpacing: '0.2em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            opacity: 0.7,
            marginBottom: '0.5rem',
          }}>
            {today}
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.2rem',
              fontWeight: 400,
              color: 'var(--foreground)',
              lineHeight: 1.15,
            }}>
              {config.salutation}{userName ? `, ${userName}` : ''}.
            </h1>
            {entries !== null && streak > 0 && (
              <div style={{ paddingBottom: '4px' }}>
                <StreakBadge streak={streak} />
              </div>
            )}
          </div>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontStyle: 'italic',
            color: 'var(--foreground-muted)',
            fontWeight: 300,
            lineHeight: 1.6,
          }}>
            {config.subline}
          </p>
        </motion.div>

        {/* ── Daily Quote ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ marginBottom: '2rem' }}
        >
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderLeft: '1.5px solid var(--accent-dim)',
            borderRadius: '10px',
            padding: '22px 24px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative quote mark */}
            <span style={{
              position: 'absolute',
              top: '10px',
              right: '18px',
              fontFamily: 'var(--font-display)',
              fontSize: '4rem',
              color: 'var(--accent)',
              opacity: 0.06,
              lineHeight: 1,
              userSelect: 'none',
              pointerEvents: 'none',
            }}>
              &quot;
            </span>

            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '9px',
              letterSpacing: '0.2em',
              color: 'var(--accent)',
              textTransform: 'uppercase',
              opacity: 0.55,
              marginBottom: '12px',
            }}>
              Today&apos;s reflection
            </p>

            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              fontStyle: 'italic',
              color: 'var(--foreground)',
              lineHeight: 1.75,
              fontWeight: 300,
              marginBottom: '12px',
            }}>
              &ldquo;{quote.text}&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '10px',
                letterSpacing: '0.14em',
                color: 'var(--accent)',
                opacity: 0.55,
                textTransform: 'uppercase',
              }}>
                — {quote.author}
              </p>
              {/* 7-day mood sparkline */}
              {entries !== null && sparklineData.some(d => d !== null) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '8px',
                    color: 'var(--foreground-subtle)',
                    opacity: 0.35,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    7d
                  </span>
                  <MoodSparkline data={sparklineData} />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Practice section ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          style={{ marginBottom: '0.75rem' }}
        >
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '9px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--foreground-subtle)',
            opacity: 0.35,
            marginBottom: '0.85rem',
          }}>
            Your Practice
          </p>
        </motion.div>

        {entries === null ? (
          // Skeleton while loading
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
            <Skeleton height="104px" borderRadius="12px" />
            <Skeleton height="64px" borderRadius="12px" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
            <PracticeCard
              type={isPrimaryMorning ? 'morning' : 'evening'}
              isPrimary
              delay={0.3}
              completed={isPrimaryMorning ? todayMorningDone : todayEveningDone}
            />
            <PracticeCard
              type={isPrimaryMorning ? 'evening' : 'morning'}
              isPrimary={false}
              delay={0.38}
              completed={isPrimaryMorning ? todayEveningDone : todayMorningDone}
            />
          </div>
        )}

        {/* ── Quick links ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.42 }}
          style={{ marginBottom: '0.85rem' }}
        >
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '9px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--foreground-subtle)',
            opacity: 0.35,
            marginBottom: '0.85rem',
          }}>
            Today
          </p>
        </motion.div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '2.5rem' }}>
          {bothDoneToday ? (
            <QuickLink
              href="/insights"
              icon="◉"
              label="See Your Insights"
              sub="Patterns & streaks"
              delay={0.45}
            />
          ) : (
            <QuickLink
              href="/practice"
              icon="◈"
              label="Stoic Exercise"
              sub="Dichotomy of control"
              delay={0.45}
            />
          )}
          <QuickLink
            href="/history"
            icon="◫"
            label="Journal"
            sub={thirtyDayCount !== null ? `${thirtyDayCount} entries` : 'Your history'}
            delay={0.5}
          />
        </div>

        {/* ── Reflection seed ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
          style={{ marginBottom: '1rem' }}
        >
          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1.75rem',
          }}>
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '9px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              opacity: 0.4,
              marginBottom: '10px',
            }}>
              A thought · {seed.theme}
            </p>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontStyle: 'italic',
              color: 'var(--foreground-subtle)',
              lineHeight: 1.75,
              fontWeight: 300,
            }}>
              {seed.prompt}
            </p>
          </div>
        </motion.div>

      </div>

      <Nav current="/home" />
    </main>
  )
}
