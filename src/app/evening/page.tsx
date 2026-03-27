'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { Nav, ProgressBar } from '@/components/ui'
import { JolyButton } from '@/components/ui/joly-button'
import { CompletionCard } from '@/components/ui/completion-card'
import { FloatingLabelTextarea } from '@/components/ui/textarea-with-floating-label'
import { RatingInteraction } from '@/components/ui/emoji-rating'
import { useTimeOfDay } from '@/hooks/useTimeOfDay'
import { selectDailyPrompt } from '@/lib/utils'

// ─── Prompt banks ─────────────────────────────────────────────────────────────

type Prompt = { question: string; quote: { text: string; author: string } }

const ACCOMPLISHED_BANK: Prompt[] = [
  {
    question: 'What did you do well today? What are you proud of?',
    quote: { text: 'Confine yourself to the present.', author: 'Marcus Aurelius' },
  },
  {
    question: 'Where did you act with courage or integrity — even in a small way?',
    quote: { text: 'If it is not right, do not do it; if it is not true, do not say it.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What did you do today that the best version of yourself would approve of?',
    quote: { text: 'Waste no more time arguing about what a good man should be. Be one.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What moment today made you feel most like yourself?',
    quote: { text: 'You have power over your mind, not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What promise to yourself did you keep today?',
    quote: { text: 'First say to yourself what you would be; and then do what you have to do.', author: 'Epictetus' },
  },
  {
    question: 'What did you complete today that you had been avoiding?',
    quote: { text: 'Let us postpone nothing. Let us balance life\'s books each day.', author: 'Seneca' },
  },
  {
    question: 'How did you treat others today — and what made you glad of it?',
    quote: { text: 'Men exist for the sake of one another. Teach them then, or bear with them.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What virtue — wisdom, justice, courage, or temperance — did you exercise today?',
    quote: { text: 'The soul becomes dyed with the colour of its thoughts.', author: 'Marcus Aurelius' },
  },
  {
    question: 'Where did you choose response over reaction today?',
    quote: { text: 'To bear trials with a calm mind robs misfortune of its strength and burden.', author: 'Seneca' },
  },
  {
    question: 'What was the single most worthwhile thing you did today?',
    quote: { text: 'Begin at once to live, and count each separate day as a separate life.', author: 'Seneca' },
  },
  {
    question: 'How did you contribute to someone else\'s life today?',
    quote: { text: 'We are made for co-operation, like feet, like hands, like eyelids, like the rows of the upper and lower teeth.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What difficulty today did you meet with steadiness rather than complaint?',
    quote: { text: 'A gem cannot be polished without friction, nor a man perfected without trials.', author: 'Seneca' },
  },
]

const STRUGGLE_BANK: Prompt[] = [
  {
    question: 'Where did you fall short? What would you do differently?',
    quote: { text: 'We should every night call ourselves to an account: what infirmity have I mastered today?', author: 'Seneca' },
  },
  {
    question: 'Where did your words or actions fail to match your values today?',
    quote: { text: 'If it is not right, do not do it; if it is not true, do not say it.', author: 'Marcus Aurelius' },
  },
  {
    question: 'In what moment today did you lose your equanimity — and what caused it?',
    quote: { text: 'Men are disturbed not by things, but by the opinions about things.', author: 'Epictetus' },
  },
  {
    question: 'Where did fear, comfort, or distraction steer you away from what mattered?',
    quote: { text: 'He who is brave is free.', author: 'Seneca' },
  },
  {
    question: 'What did you say or do that you wish you could take back?',
    quote: { text: 'How much more grievous are the consequences of anger than the causes of it.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What obligation did you neglect or postpone today — and why?',
    quote: { text: 'It is not that I\'m so smart, it\'s just that I stay with problems longer.', author: 'Epictetus' },
  },
  {
    question: 'Where did your attention wander to things outside your control?',
    quote: { text: 'Make the best use of what is in your power, and take the rest as it happens.', author: 'Epictetus' },
  },
  {
    question: 'What habit or pattern repeated itself today that you wish had not?',
    quote: { text: 'First say to yourself what you would be; and then do what you have to do.', author: 'Epictetus' },
  },
  {
    question: 'In what way were you unkind — to yourself or to someone else?',
    quote: { text: 'Wherever there is a human being, there is an opportunity for a kindness.', author: 'Seneca' },
  },
  {
    question: 'What would the wisest version of you have done differently today?',
    quote: { text: 'No man was ever wise by chance.', author: 'Seneca' },
  },
  {
    question: 'What lesson did today offer that you resisted or ignored?',
    quote: { text: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius' },
  },
  {
    question: 'Where did you seek approval or comfort instead of doing what was right?',
    quote: { text: 'He who is everywhere is nowhere.', author: 'Seneca' },
  },
]

const LESSON_BANK: Prompt[] = [
  {
    question: 'What is one thing today taught you — about yourself or the world?',
    quote: { text: 'We suffer more in imagination than in reality.', author: 'Seneca' },
  },
  {
    question: 'What truth did today reveal that you did not fully see before?',
    quote: { text: 'The universe is change; our life is what our thoughts make it.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What would you tell a younger version of yourself, based on today?',
    quote: { text: 'Think of yourself as dead. You have lived your life. Now take what\'s left and live it properly.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What misfortune or frustration today contained a hidden gift?',
    quote: { text: 'A gem cannot be polished without friction, nor a man perfected without trials.', author: 'Seneca' },
  },
  {
    question: 'What assumption did today challenge or overturn?',
    quote: { text: 'If you are distressed by anything external, the pain is not due to the thing itself, but to your estimate of it.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What did someone else do today — well or poorly — that taught you something?',
    quote: { text: 'Men exist for the sake of one another. Teach them then, or bear with them.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What single experience from today is worth carrying forward?',
    quote: { text: 'Begin at once to live, and count each separate day as a separate life.', author: 'Seneca' },
  },
  {
    question: 'Where today did nature, circumstances, or other people remind you of your smallness — and what peace is in that?',
    quote: { text: 'Receive without pride, relinquish without struggle.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What did you learn about what you truly value — versus what you think you value?',
    quote: { text: 'Wealth consists not in having great possessions, but in having few wants.', author: 'Epictetus' },
  },
  {
    question: 'What did today show you about the limits of your control — and what freedom is in that?',
    quote: { text: 'Seek not that the things which happen should happen as you wish; but wish the things which happen to be as they are.', author: 'Epictetus' },
  },
  {
    question: 'What question did today leave you with — and is it worth sitting with longer?',
    quote: { text: 'Never let the future disturb you. You will meet it with the same weapons of reason which today arm you against the present.', author: 'Marcus Aurelius' },
  },
  {
    question: 'If this day were a teacher, what was its lesson — and did you pass?',
    quote: { text: 'No man was ever wise by chance.', author: 'Seneca' },
  },
]

// ─── Step metadata ─────────────────────────────────────────────────────────────

type Step = { id: string; label: string; question: string; quote: { text: string; author: string } }

const buildDefaultSteps = (): Step[] => [
  { id: 'accomplished', label: 'Reflection', ...ACCOMPLISHED_BANK[0] },
  { id: 'struggle', label: 'Honest account', ...STRUGGLE_BANK[0] },
  { id: 'lesson', label: 'The lesson', ...LESSON_BANK[0] },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function EveningPage() {
  const router = useRouter()
  const [steps, setSteps] = useState<Step[]>(buildDefaultSteps)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({ accomplished: '', struggle: '', lesson: '' })
  const [mood, setMood] = useState<number | null>(null)
  const [moodNote, setMoodNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const isMoodStep = step === steps.length
  const current = isMoodStep ? null : steps[step]
  const timeOfDay = useTimeOfDay()
  const suggestMorning = timeOfDay === 'morning'

  // Select prompts for today (avoids re-render on SSR)
  useEffect(() => {
    setSteps([
      { id: 'accomplished', label: 'Reflection',     ...ACCOMPLISHED_BANK[selectDailyPrompt('evening-accomplished', ACCOMPLISHED_BANK.length)] },
      { id: 'struggle',     label: 'Honest account', ...STRUGGLE_BANK[selectDailyPrompt('evening-struggle',     STRUGGLE_BANK.length)] },
      { id: 'lesson',       label: 'The lesson',     ...LESSON_BANK[selectDailyPrompt('evening-lesson',         LESSON_BANK.length)] },
    ])
  }, [])

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const today = new Date().toISOString().split('T')[0]

    const { data: existing } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'evening')
      .eq('entry_date', today)
      .maybeSingle()

    let error
    if (existing) {
      const result = await supabase
        .from('journal_entries')
        .update({ content: { ...answers, mood_note: moodNote || undefined }, mood_score: mood })
        .eq('id', existing.id)
      error = result.error
    } else {
      const result = await supabase
        .from('journal_entries')
        .insert({ user_id: user.id, type: 'evening', content: { ...answers, mood_note: moodNote || undefined }, mood_score: mood, entry_date: today })
      error = result.error
    }

    setSaving(false)
    if (error) {
      console.error('Save error:', error)
      setSaveError(`Error ${error.code}: ${error.message}`)
    } else {
      setSaved(true)
    }
  }

  if (saved) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 pb-20">
        <CompletionCard
          heading="Day complete."
          subheading="You examined your day. That is the practice."
          echoLabel="Your lesson"
          echoContent={answers.lesson}
          quote={{ text: 'Let us prepare our minds as if we had come to the very end of life. Let us postpone nothing.', author: 'Seneca' }}
          ctas={[
            { label: 'View your journal', href: '/history', variant: 'outline' },
            { label: 'See insights →', href: '/insights', variant: 'ghost' },
          ]}
        />
        <Nav current="/evening" />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col px-6 pb-28">
      <div className="max-w-lg mx-auto w-full pt-12">

        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <div className="mb-1">
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '10px',
                letterSpacing: '0.2em',
                color: 'var(--accent)',
                textTransform: 'uppercase',
                opacity: 0.8,
              }}
            >
              Evening · {today}
            </p>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 400,
              color: 'var(--foreground)',
            }}
          >
            {isMoodStep ? 'How are you feeling?' : 'The evening examination'}
          </h1>
        </div>

        {/* Time-aware suggestion — only on first step */}
        {step === 0 && suggestMorning && (
          <div className="mb-6 animate-fade-up">
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderLeft: '2px solid var(--accent-dim)',
                borderRadius: '6px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--foreground-muted)', lineHeight: 1.6 }}>
                Good morning. The day has not yet begun — your morning practice may better suit the hour.
              </p>
              <a
                href="/morning"
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '11px',
                  color: 'var(--accent)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  opacity: 0.9,
                  letterSpacing: '0.04em',
                }}
              >
                Morning →
              </a>
            </div>
          </div>
        )}

        {/* Progress — 4 segments */}
        <div className="animate-fade-up delay-100">
          <ProgressBar total={steps.length + 1} current={step} />
        </div>

        {/* Step cards — animated transitions */}
        <AnimatePresence mode="wait">
          {!isMoodStep && current ? (
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="mb-6"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '24px',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                    opacity: 0.7,
                  }}
                >
                  {current.label}
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    fontWeight: 400,
                    color: 'var(--foreground)',
                    lineHeight: 1.6,
                    marginBottom: '1.5rem',
                  }}
                >
                  {current.question}
                </h2>

                <div className="quote-accent mb-6">
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontSize: '0.875rem',
                      color: 'var(--foreground-muted)',
                      lineHeight: 1.8,
                      fontWeight: 300,
                    }}
                  >
                    &ldquo;{current.quote.text}&rdquo;
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '10px',
                      letterSpacing: '0.12em',
                      color: 'var(--accent)',
                      opacity: 0.6,
                      marginTop: '0.4rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    — {current.quote.author}
                  </p>
                </div>

                <FloatingLabelTextarea
                  label="Write freely"
                  value={answers[current.id as keyof typeof answers]}
                  onChange={e => setAnswers(prev => ({ ...prev, [current.id]: e.target.value }))}
                />
              </div>
            </motion.div>
          ) : isMoodStep ? (
            <motion.div
              key="mood-step"
              initial={{ opacity: 0, x: 20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="mb-6"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '24px',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                    opacity: 0.7,
                  }}
                >
                  Evening mood
                </p>

                <RatingInteraction onChange={setMood} className="mb-6" />

                <textarea
                  placeholder="Want to add more? (optional)"
                  value={moodNote}
                  onChange={e => setMoodNote(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1rem',
                    color: 'var(--foreground)',
                    lineHeight: 1.75,
                    resize: 'none',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-dim)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-2">
          {step > 0 ? (
            <JolyButton variant="ghost" size="sm" onClick={() => setStep(s => s - 1)}>
              ← Back
            </JolyButton>
          ) : <div />}

          {!isMoodStep ? (
            <JolyButton
              onClick={() => setStep(s => s + 1)}
              disabled={current ? !answers[current.id as keyof typeof answers].trim() : false}
            >
              Continue
            </JolyButton>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              {saveError && (
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: '#e07070', textAlign: 'right' }}>
                  {saveError}
                </p>
              )}
              <JolyButton onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Complete evening'}
              </JolyButton>
            </div>
          )}
        </div>
      </div>

      <Nav current="/evening" />
    </main>
  )
}
