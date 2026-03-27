'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Nav, ProgressBar } from '@/components/ui'
import MotionButton from '@/components/ui/motion-button'
import { JolyButton } from '@/components/ui/joly-button'
import { FloatingLabelTextarea } from '@/components/ui/textarea-with-floating-label'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ExerciseStep {
  heading: string
  instruction: string
  placeholder: string
  contextNote?: string
}

interface Exercise {
  id: string
  title: string
  author: string
  description: string
  quote: string
  steps: ExerciseStep[]
  contentKeys: string[]
}

interface LockedExercise {
  id: string
  title: string
  description: string
}

// ── Data ──────────────────────────────────────────────────────────────────────

const EXERCISES: Exercise[] = [
  {
    id: 'dichotomy',
    title: 'Dichotomy of Control',
    author: 'Epictetus',
    description: 'Distinguish what lies within your power from what does not — and direct your energy accordingly.',
    quote: 'Make the best use of what is in your power, and take the rest as it happens.',
    steps: [
      {
        heading: 'The situation',
        instruction: 'Describe something that is weighing on you right now — a worry, a conflict, a decision.',
        placeholder: "What's on your mind?",
      },
      {
        heading: 'What I control',
        instruction: 'From that situation, list everything genuinely within your power: your actions, your words, your attitude, your effort.',
        placeholder: 'My actions, my response, my preparation...',
      },
      {
        heading: 'What I do not control',
        instruction: "Now list everything outside your control: other people's reactions, outcomes, chance, the past.",
        placeholder: "Others' opinions, the outcome, timing...",
      },
      {
        heading: 'The action',
        instruction: 'Based on what you control — what is the one right action to take? Be specific.',
        placeholder: 'I will...',
      },
    ],
    contentKeys: ['situation', 'what_i_control', 'what_i_dont_control', 'action'],
  },
  {
    id: 'negative_visualization',
    title: 'Negative Visualization',
    author: 'Seneca',
    description: 'Contemplate the loss of what you value most — not to despair, but to awaken gratitude for what you already have.',
    quote: 'Let us prepare our minds as if we had come to the very end of life. Let us postpone nothing.',
    steps: [
      {
        heading: 'Choose a blessing',
        instruction: 'Identify something you deeply value but may be taking for granted — a relationship, a capacity, a circumstance.',
        placeholder: 'A person, an ability, a situation I rarely pause to appreciate...',
        contextNote: 'Begin by naming what is already yours. The Stoics practiced this not as pessimism, but as the antidote to it.',
      },
      {
        heading: 'Imagine its absence',
        instruction: 'As vividly as you can, imagine this thing were gone tomorrow. What would your life look like without it?',
        placeholder: 'Without it, my days would...',
        contextNote: 'Do not rush this step. Let the thought settle. The discomfort you feel is the practice working.',
      },
      {
        heading: 'Return',
        instruction: 'Come back to the present, where this thing still exists. What do you notice now?',
        placeholder: 'Having imagined its absence, I now feel...',
      },
      {
        heading: 'Gratitude action',
        instruction: 'What is one small, concrete act of appreciation you will take today?',
        placeholder: 'Today I will...',
      },
    ],
    contentKeys: ['blessing', 'absence', 'return', 'gratitude_action'],
  },
  {
    id: 'premeditatio_malorum',
    title: 'Premeditatio Malorum',
    author: 'Seneca',
    description: 'Rehearse what could go wrong — so nothing catches you unprepared. The Stoic inoculation against Fortune.',
    quote: 'Omnia, Lucili, aliena sunt, tempus tantum nostrum est.',
    steps: [
      {
        heading: 'The endeavor',
        instruction: 'What important goal or undertaking are you currently working toward?',
        placeholder: 'The goal, project, or decision I am navigating...',
      },
      {
        heading: 'Obstacles',
        instruction: 'What could realistically go wrong? List your honest worst-case scenarios without flinching.',
        placeholder: 'Things that could fail, people who might not cooperate, circumstances beyond my control...',
        contextNote: 'The Stoics did not avoid dark thoughts — they rehearsed them. A thing imagined loses half its power to harm.',
      },
      {
        heading: 'Responses',
        instruction: 'For each obstacle, what would the Stoic response be? How would you adapt and continue?',
        placeholder: 'If that happened, I would...',
      },
      {
        heading: 'Preparation',
        instruction: 'What concrete step can you take now, before any obstacle arrives?',
        placeholder: 'Today I will prepare by...',
      },
    ],
    contentKeys: ['endeavor', 'obstacles', 'responses', 'preparation'],
  },
]

const LOCKED_EXERCISES: LockedExercise[] = [
  {
    id: 'memento_mori',
    title: 'Memento Mori',
    description: 'Contemplate your mortality — not with dread, but with the clarity it brings to each remaining day.',
  },
  {
    id: 'view_from_above',
    title: 'View from Above',
    description: 'Rise above the immediate. See your situation as Marcus Aurelius did — from the perspective of the cosmos.',
  },
  {
    id: 'evening_examination',
    title: 'Evening Examination',
    description: "Seneca's nightly practice: review the day with a judge's honesty and a teacher's patience.",
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function PracticePage() {
  const router = useRouter()
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [step, setStep] = useState<'intro' | number | 'complete'>('intro')
  const [answers, setAnswers] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  function selectExercise(ex: Exercise) {
    setSelectedExercise(ex)
    setAnswers(new Array(ex.steps.length).fill(''))
    setStep('intro')
  }

  function resetToLibrary() {
    setSelectedExercise(null)
    setStep('intro')
    setAnswers([])
  }

  async function handleComplete() {
    if (!selectedExercise) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const content: Record<string, string> = {}
    selectedExercise.contentKeys.forEach((key, i) => {
      content[key] = answers[i] || ''
    })

    await supabase.from('journal_entries').insert({
      user_id: user.id,
      type: 'practice',
      content,
      entry_date: new Date().toISOString().split('T')[0],
    })

    setSaving(false)
    setStep('complete')
  }

  function updateAnswer(value: string) {
    if (typeof step !== 'number') return
    const next = [...answers]
    next[step] = value
    setAnswers(next)
  }

  // ── Library view ──────────────────────────────────────────────────────────────

  if (!selectedExercise) {
    return (
      <main className="min-h-screen flex flex-col px-6 pb-28">
        <div className="max-w-lg mx-auto w-full pt-12">

          {/* Header */}
          <div className="mb-8 animate-fade-up">
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
              Daily practice
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                fontWeight: 400,
                color: 'var(--foreground)',
                lineHeight: 1.1,
              }}
            >
              Practice Library
            </h1>
          </div>

          {/* Unlocked exercise cards */}
          <div
            className="animate-fade-up delay-100"
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '2rem' }}
          >
            {EXERCISES.map(ex => (
              <button
                key={ex.id}
                onClick={() => selectExercise(ex)}
                className="w-full text-left"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '20px 22px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-dim)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '9px',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--accent)',
                        opacity: 0.7,
                        marginBottom: '6px',
                      }}
                    >
                      {ex.author}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.15rem',
                        fontWeight: 400,
                        color: 'var(--foreground)',
                        lineHeight: 1.3,
                        marginBottom: '8px',
                      }}
                    >
                      {ex.title}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '11px',
                        color: 'var(--foreground-subtle)',
                        lineHeight: 1.6,
                        opacity: 0.7,
                      }}
                    >
                      {ex.description}
                    </p>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '11px',
                      color: 'var(--accent)',
                      opacity: 0.5,
                      whiteSpace: 'nowrap',
                      paddingTop: '4px',
                    }}
                  >
                    Begin →
                  </span>
                </div>

                {/* Step count indicators */}
                <div style={{ display: 'flex', gap: '5px', marginTop: '14px' }}>
                  {ex.steps.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: '16px',
                        height: '2px',
                        background: 'var(--border)',
                        borderRadius: '1px',
                        opacity: 0.5,
                      }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div
            className="animate-fade-up delay-300"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}
          >
            <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.4 }} />
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '9px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--foreground-subtle)',
                opacity: 0.35,
                whiteSpace: 'nowrap',
              }}
            >
              Practitioner · $3.99/mo
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.4 }} />
          </div>

          {/* Locked exercise cards */}
          <div
            className="animate-fade-up delay-400"
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            {LOCKED_EXERCISES.map(ex => (
              <div
                key={ex.id}
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '18px 22px',
                  opacity: 0.38,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      fontWeight: 400,
                      color: 'var(--foreground)',
                      marginBottom: '4px',
                    }}
                  >
                    {ex.title}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '11px',
                      color: 'var(--foreground-subtle)',
                      lineHeight: 1.5,
                      opacity: 0.7,
                    }}
                  >
                    {ex.description}
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '8px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--foreground-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '3px 8px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  Locked
                </span>
              </div>
            ))}
          </div>

        </div>
        <Nav current="/practice" />
      </main>
    )
  }

  // ── Intro view ────────────────────────────────────────────────────────────────

  if (step === 'intro') {
    return (
      <main className="min-h-screen flex flex-col px-6 pb-28">
        <div className="max-w-lg mx-auto w-full pt-12">

          {/* Back */}
          <div className="mb-8 animate-fade-up">
            <JolyButton variant="ghost" size="sm" onClick={resetToLibrary}>
              ← Library
            </JolyButton>
          </div>

          {/* Header */}
          <div className="mb-8 animate-fade-up delay-100">
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
              Daily practice
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                fontWeight: 400,
                color: 'var(--foreground)',
                lineHeight: 1.1,
              }}
            >
              {selectedExercise.title}
            </h1>
          </div>

          {/* Quote */}
          <div className="quote-accent mb-8 animate-fade-up delay-200">
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: '1rem',
                color: 'var(--foreground-muted)',
                lineHeight: 1.8,
                fontWeight: 300,
              }}
            >
              {selectedExercise.quote}
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
              — {selectedExercise.author}
            </p>
          </div>

          {/* Description card */}
          <div
            className="animate-fade-up delay-300"
            style={{
              marginBottom: '2rem',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '24px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.05rem',
                color: 'var(--foreground-muted)',
                lineHeight: 1.8,
                marginBottom: '1.25rem',
                fontWeight: 300,
              }}
            >
              {selectedExercise.description}
            </p>

            {/* Step pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {selectedExercise.steps.map((s, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '10px',
                    color: 'var(--foreground-subtle)',
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '4px 10px',
                    letterSpacing: '0.03em',
                  }}
                >
                  <span style={{ color: 'var(--accent)', opacity: 0.5, fontFamily: 'var(--font-mono)', fontSize: '9px' }}>{i + 1}</span>
                  {s.heading}
                </span>
              ))}
            </div>
          </div>

          {/* Begin button */}
          <div className="animate-fade-up delay-400">
            <MotionButton label="Begin exercise" onClick={() => setStep(0)} />
          </div>
        </div>
        <Nav current="/practice" />
      </main>
    )
  }

  // ── Complete view ─────────────────────────────────────────────────────────────

  if (step === 'complete') {
    const lastStep = selectedExercise.steps[selectedExercise.steps.length - 1]
    const lastAnswer = answers[answers.length - 1]

    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 pb-20">
        <div className="max-w-md w-full animate-fade-up">
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
              marginBottom: '0.5rem',
              textAlign: 'center',
            }}
          >
            Practice complete.
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              opacity: 0.5,
              textAlign: 'center',
              marginBottom: '1.75rem',
            }}
          >
            {selectedExercise.title}
          </p>

          {lastAnswer && (
            <div
              style={{
                background: 'var(--muted)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '1.5rem',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                  opacity: 0.8,
                  marginBottom: '10px',
                }}
              >
                {lastStep.heading}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.05rem',
                  color: 'var(--foreground)',
                  lineHeight: 1.7,
                }}
              >
                {lastAnswer}
              </p>
            </div>
          )}

          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              color: 'var(--foreground-subtle)',
              textAlign: 'center',
              lineHeight: 1.7,
              opacity: 0.6,
              marginBottom: '2rem',
            }}
          >
            Now go do it. Return this evening to reflect.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <JolyButton
              variant="outline"
              size="lg"
              className="w-full"
              onClick={resetToLibrary}
            >
              Back to library
            </JolyButton>
          </div>
        </div>
        <Nav current="/practice" />
      </main>
    )
  }

  // ── Steps view ────────────────────────────────────────────────────────────────

  const stepNum = step as number
  const currentStep = selectedExercise.steps[stepNum]
  const currentAnswer = answers[stepNum] ?? ''

  return (
    <main className="min-h-screen flex flex-col px-6 pb-28">
      <div className="max-w-lg mx-auto w-full pt-12">

        {/* Header */}
        <div className="mb-8 animate-fade-up">
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
            {selectedExercise.title}
          </p>
        </div>

        {/* Progress */}
        <div className="animate-fade-up delay-100">
          <ProgressBar total={selectedExercise.steps.length} current={stepNum} />
        </div>

        {/* Step content */}
        {currentStep && (
          <div key={stepNum} className="animate-fade-up delay-200">
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
                Step {stepNum + 1} — {currentStep.heading}
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
                {currentStep.instruction}
              </h2>

              {/* Context note */}
              {currentStep.contextNote && (
                <div className="quote-accent mb-5">
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontSize: '0.9rem',
                      color: 'var(--foreground-muted)',
                      lineHeight: 1.7,
                      fontWeight: 300,
                    }}
                  >
                    {currentStep.contextNote}
                  </p>
                </div>
              )}

              <FloatingLabelTextarea
                label="Write freely"
                value={currentAnswer}
                onChange={e => updateAnswer(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-2">
          <JolyButton
            variant="ghost"
            size="sm"
            onClick={() => setStep(stepNum > 0 ? stepNum - 1 : 'intro')}
          >
            ← Back
          </JolyButton>

          {stepNum < selectedExercise.steps.length - 1 ? (
            <JolyButton
              onClick={() => setStep(stepNum + 1)}
              disabled={!currentAnswer.trim()}
            >
              Continue
            </JolyButton>
          ) : (
            <JolyButton
              onClick={handleComplete}
              disabled={saving || !currentAnswer.trim()}
            >
              {saving ? 'Saving...' : 'Complete'}
            </JolyButton>
          )}
        </div>
      </div>
      <Nav current="/practice" />
    </main>
  )
}
