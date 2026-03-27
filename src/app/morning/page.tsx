'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { Nav, ProgressBar } from '@/components/ui'
import { JolyButton } from '@/components/ui/joly-button'
import { FloatingLabelTextarea } from '@/components/ui/textarea-with-floating-label'
import { RatingInteraction } from '@/components/ui/emoji-rating'
import { useTimeOfDay } from '@/hooks/useTimeOfDay'
import { selectDailyPrompt } from '@/lib/utils'

// ─── Prompt banks ─────────────────────────────────────────────────────────────

type Prompt = { question: string; quote: { text: string; author: string } }

const INTENTION_BANK: Prompt[] = [
  {
    question: 'What is the one thing you can do today that would make it meaningful?',
    quote: { text: 'You have power over your mind, not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
  },
  {
    question: 'If this day were your last, what would you give your complete attention to?',
    quote: { text: 'Think of yourself as dead. You have lived your life. Now take what\'s left and live it properly.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What single aim, pursued with full effort, makes today worthwhile?',
    quote: { text: 'Confine yourself to the present.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What virtue do you wish to practice most consciously today?',
    quote: { text: 'Waste no more time arguing about what a good man should be. Be one.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What have you been postponing that deserves your full presence today?',
    quote: { text: 'Let us prepare our minds as if we had come to the very end of life. Let us postpone nothing.', author: 'Seneca' },
  },
  {
    question: 'Name one action within your power that moves you toward who you wish to be.',
    quote: { text: 'First say to yourself what you would be; and then do what you have to do.', author: 'Epictetus' },
  },
  {
    question: 'What does this day ask of you — and are you prepared to give it?',
    quote: { text: 'Begin at once to live, and count each separate day as a separate life.', author: 'Seneca' },
  },
  {
    question: 'What would the best version of yourself attend to first this morning?',
    quote: { text: 'The universe is change; our life is what our thoughts make it.', author: 'Marcus Aurelius' },
  },
  {
    question: 'How can you serve another person today in a way that costs you something real?',
    quote: { text: 'Men exist for the sake of one another.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What intention, set clearly now, will anchor you when the day grows difficult?',
    quote: { text: 'Never let the future disturb you. You will meet it with the same weapons of reason which today arm you against the present.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What small act of courage does today require of you?',
    quote: { text: 'He who is brave is free.', author: 'Seneca' },
  },
  {
    question: 'If you stripped away all distraction, what would you give your energy to today?',
    quote: { text: 'He who is everywhere is nowhere.', author: 'Seneca' },
  },
  {
    question: 'What is the one thing you would regret not having done today?',
    quote: { text: 'Receive without pride, relinquish without struggle.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What would make today feel, at its close, like it was lived with purpose?',
    quote: { text: 'No man was ever wise by chance.', author: 'Seneca' },
  },
  {
    question: 'What does your highest self want from this day — and how will you honour that?',
    quote: { text: 'If it is not right, do not do it; if it is not true, do not say it.', author: 'Marcus Aurelius' },
  },
]

const OBSTACLE_BANK: Prompt[] = [
  {
    question: 'What challenge might you face today, and how will you meet it with equanimity?',
    quote: { text: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius' },
  },
  {
    question: 'Where might your peace be tested today — and how will you hold it?',
    quote: { text: 'If you are distressed by anything external, the pain is not due to the thing itself, but to your estimate of it.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What fear might arise today, and what Stoic response would serve you best?',
    quote: { text: 'We suffer more in imagination than in reality.', author: 'Seneca' },
  },
  {
    question: 'What lies outside your control today — and how will you release it?',
    quote: { text: 'Make the best use of what is in your power, and take the rest as it happens.', author: 'Epictetus' },
  },
  {
    question: 'What old pattern might pull at you today, and what will you choose instead?',
    quote: { text: 'Men are disturbed not by things, but by the opinions about things.', author: 'Epictetus' },
  },
  {
    question: 'Where might you be tempted to react rather than respond today?',
    quote: { text: 'To bear trials with a calm mind robs misfortune of its strength and burden.', author: 'Seneca' },
  },
  {
    question: 'What difficulty today has the most potential to teach you — if you let it?',
    quote: { text: 'A gem cannot be polished without friction, nor a man perfected without trials.', author: 'Seneca' },
  },
  {
    question: 'Where might impatience lead you astray today, and what is the wiser response?',
    quote: { text: 'How much more grievous are the consequences of anger than the causes of it.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What criticism or failure might you face today — and how would the wise man use it?',
    quote: { text: 'We should every night call ourselves to an account: what infirmity have I mastered today?', author: 'Seneca' },
  },
  {
    question: 'What in today\'s circumstances cannot be changed — and what peace is possible within that?',
    quote: { text: 'Seek not that the things which happen should happen as you wish; but wish the things which happen to be as they are, and you will have a tranquil flow of life.', author: 'Epictetus' },
  },
  {
    question: 'Where might your ego interfere with what the day actually needs from you?',
    quote: { text: 'Loss is nothing else but change, and change is Nature\'s delight.', author: 'Marcus Aurelius' },
  },
  {
    question: 'Premeditate the day\'s worst — and describe how you would endure it with grace.',
    quote: { text: 'Nothing happens to the wise man against his expectation.', author: 'Seneca' },
  },
]

const GRATITUDE_BANK: Prompt[] = [
  {
    question: 'Name three things — however small — that you are grateful to have.',
    quote: { text: 'He is a wise man who does not grieve for the things which he has not, but rejoices for those which he has.', author: 'Epictetus' },
  },
  {
    question: 'What ordinary thing, if taken away, would you miss most profoundly?',
    quote: { text: 'All things, Lucilius, belong to others; time alone is ours.', author: 'Seneca' },
  },
  {
    question: 'Who in your life has shaped you for the better — and have you ever told them?',
    quote: { text: 'Accept the things to which fate binds you, and love the people with whom fate brings you together.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What difficulty in your past are you now grateful to have endured?',
    quote: { text: 'A gem cannot be polished without friction, nor a man perfected without trials.', author: 'Seneca' },
  },
  {
    question: 'What capacity — of mind, body, or character — are you fortunate to possess?',
    quote: { text: 'Wealth consists not in having great possessions, but in having few wants.', author: 'Epictetus' },
  },
  {
    question: 'If you could see your life through a stranger\'s eyes, what would they quietly envy?',
    quote: { text: 'It is not the man who has too little, but the man who craves more, that is poor.', author: 'Seneca' },
  },
  {
    question: 'What have you received freely from others that you have not fully honoured?',
    quote: { text: 'No man is free who is not master of himself.', author: 'Epictetus' },
  },
  {
    question: 'What simple pleasure, easily overlooked, has already been given to you today?',
    quote: { text: 'True happiness is to enjoy the present, without anxious dependence upon the future.', author: 'Seneca' },
  },
  {
    question: 'What of the world\'s richness — beauty, friendship, nature, learning — has touched you lately?',
    quote: { text: 'The universe is change; our life is what our thoughts make it.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What challenge you overcame recently once seemed impossible — what does that tell you?',
    quote: { text: 'Receive without pride, relinquish without struggle.', author: 'Marcus Aurelius' },
  },
  {
    question: 'Name someone who cares for you, and what it means to have them in your life.',
    quote: { text: 'Men exist for the sake of one another. Teach them then, or bear with them.', author: 'Marcus Aurelius' },
  },
  {
    question: 'What future thing are you counting on — and what good do you already have, right now?',
    quote: { text: 'Begin at once to live, and count each separate day as a separate life.', author: 'Seneca' },
  },
]

// ─── Step metadata ─────────────────────────────────────────────────────────────

type Step = { id: string; label: string; question: string; quote: { text: string; author: string } }

const buildDefaultSteps = (): Step[] => [
  { id: 'intention', label: 'Intention', ...INTENTION_BANK[0] },
  { id: 'obstacle', label: 'Obstacle', ...OBSTACLE_BANK[0] },
  { id: 'gratitude', label: 'Gratitude', ...GRATITUDE_BANK[0] },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MorningPage() {
  const router = useRouter()
  const [steps, setSteps] = useState<Step[]>(buildDefaultSteps)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({ intention: '', obstacle: '', gratitude: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [mood, setMood] = useState<number | null>(null)
  const [moodNote, setMoodNote] = useState('')
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const timeOfDay = useTimeOfDay()
  const suggestEvening = timeOfDay === 'evening' || timeOfDay === 'night'

  // Select prompts for today (avoids re-render on SSR)
  useEffect(() => {
    setSteps([
      { id: 'intention', label: 'Intention', ...INTENTION_BANK[selectDailyPrompt('morning-intention', INTENTION_BANK.length)] },
      { id: 'obstacle',  label: 'Obstacle',  ...OBSTACLE_BANK[selectDailyPrompt('morning-obstacle',  OBSTACLE_BANK.length)] },
      { id: 'gratitude', label: 'Gratitude', ...GRATITUDE_BANK[selectDailyPrompt('morning-gratitude', GRATITUDE_BANK.length)] },
    ])
  }, [])

  const isMoodStep = step === steps.length
  const current = isMoodStep ? null : steps[step]

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const today = new Date().toISOString().split('T')[0]

    // Check if an entry already exists for today
    const { data: existing } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'morning')
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
        .insert({ user_id: user.id, type: 'morning', content: { ...answers, mood_note: moodNote || undefined }, mood_score: mood, entry_date: today })
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
        <div className="max-w-md w-full text-center animate-fade-up">
          <div
            className="w-12 h-12 mx-auto mb-8 flex items-center justify-center rounded-full"
            style={{ border: '1px solid var(--accent-dim)' }}
          >
            <span style={{ color: 'var(--accent)', fontSize: '18px' }}>✓</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 400,
              color: 'var(--foreground)',
              marginBottom: '0.75rem',
            }}
          >
            Morning set.
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '13px',
              color: 'var(--foreground-subtle)',
              marginBottom: '2.5rem',
              lineHeight: 1.7,
            }}
          >
            Your intention is planted. Now go live it.
          </p>

          <div
            style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: '0.9rem',
                color: 'var(--foreground-subtle)',
                lineHeight: 1.8,
              }}
            >
              Confine yourself to the present.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '10px',
                letterSpacing: '0.14em',
                color: 'var(--foreground-subtle)',
                opacity: 0.5,
                marginTop: '0.4rem',
                textTransform: 'uppercase',
              }}
            >
              Marcus Aurelius
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <JolyButton variant="outline" size="lg" asChild>
              <a href="/practice">Today&apos;s practice</a>
            </JolyButton>
            <JolyButton variant="ghost" asChild>
              <a href="/history">View past entries →</a>
            </JolyButton>
          </div>
        </div>
        <Nav current="/morning" />
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
              Morning · {today}
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
            {isMoodStep ? 'How are you feeling?' : 'Begin with intention'}
          </h1>
        </div>

        {/* Time-aware suggestion — only on first step */}
        {step === 0 && suggestEvening && (
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
                The day is winding down. Perhaps your evening reflection suits the hour.
              </p>
              <a
                href="/evening"
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
                Evening →
              </a>
            </div>
          </div>
        )}

        {/* Progress — 4 segments (3 prompts + mood) */}
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
                  Morning mood
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
                {saving ? 'Saving...' : 'Complete morning'}
              </JolyButton>
            </div>
          )}
        </div>
      </div>

      <Nav current="/morning" />
    </main>
  )
}
