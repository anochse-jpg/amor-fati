'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Nav, ProgressBar } from '@/components/ui'
import MotionButton from '@/components/ui/motion-button'
import { JolyButton } from '@/components/ui/joly-button'
import { FloatingLabelTextarea } from '@/components/ui/textarea-with-floating-label'

const EXERCISE = {
  title: 'Dichotomy of Control',
  author: 'Epictetus',
  description: 'The foundational Stoic practice. Distinguish what lies within your power from what does not — and direct your energy accordingly.',
  quote: 'Make the best use of what is in your power, and take the rest as it happens.',
  steps: [
    {
      heading: 'The situation',
      instruction: 'Describe something that is weighing on you right now — a worry, a conflict, a decision.',
      placeholder: 'What\'s on your mind?',
    },
    {
      heading: 'What I control',
      instruction: 'From that situation, list everything that is genuinely within your power: your actions, your words, your attitude, your effort.',
      placeholder: 'My actions, my response, my preparation...',
    },
    {
      heading: 'What I do not control',
      instruction: 'Now list everything outside your control: other people\'s reactions, outcomes, chance, the past.',
      placeholder: 'Others\' opinions, the outcome, timing...',
    },
    {
      heading: 'The action',
      instruction: 'Based on what you control — what is the one right action to take? Be specific.',
      placeholder: 'I will...',
    },
  ],
}

const PREMIUM_EXERCISES = [
  'Negative Visualization',
  'Premeditatio Malorum',
  'Memento Mori',
  'View from Above',
  'Evening Examination',
]

export default function PracticePage() {
  const router = useRouter()
  const [step, setStep] = useState<'intro' | number | 'complete'>('intro')
  const [answers, setAnswers] = useState(['', '', '', ''])
  const [saving, setSaving] = useState(false)

  async function handleComplete() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    await supabase.from('journal_entries').insert({
      user_id: user.id,
      type: 'practice',
      content: {
        situation: answers[0],
        what_i_control: answers[1],
        what_i_dont_control: answers[2],
        action: answers[3],
      },
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

  const currentStep = typeof step === 'number' ? EXERCISE.steps[step] : null
  const currentAnswer = typeof step === 'number' ? answers[step] : ''

  if (step === 'intro') {
    return (
      <main className="min-h-screen flex flex-col px-6 pb-28">
        <div className="max-w-lg mx-auto w-full pt-12">

          {/* Header */}
          <div className="mb-10 animate-fade-up">
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
              {EXERCISE.title}
            </h1>
          </div>

          {/* Quote */}
          <div className="quote-accent mb-8 animate-fade-up delay-100">
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
              {EXERCISE.quote}
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
              — {EXERCISE.author}
            </p>
          </div>

          {/* Description card */}
          <div
            className="animate-fade-up delay-200"
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
              {EXERCISE.description}
            </p>

            {/* Step pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {EXERCISE.steps.map((s, i) => (
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
          <div className="animate-fade-up delay-300">
            <MotionButton label="Begin exercise" onClick={() => setStep(0)} />
          </div>

          {/* Premium teaser — understated */}
          <div className="animate-fade-up delay-500 mt-10" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.5 }} />
            <button
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '10px',
                letterSpacing: '0.1em',
                color: 'var(--foreground-subtle)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                opacity: 0.45,
                whiteSpace: 'nowrap',
              }}
              className="hover:opacity-80 transition-opacity"
            >
              + {PREMIUM_EXERCISES.length} more exercises · Practitioner $3.99/mo
            </button>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.5 }} />
          </div>
        </div>
        <Nav current="/practice" />
      </main>
    )
  }

  if (step === 'complete') {
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
              marginBottom: '0.75rem',
              textAlign: 'center',
            }}
          >
            Practice complete.
          </h2>

          {/* The action summary */}
          <div
            style={{
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '20px',
              marginTop: '1.5rem',
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
              Your action
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.05rem',
                color: 'var(--foreground)',
                lineHeight: 1.7,
              }}
            >
              {answers[3]}
            </p>
          </div>

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

          <JolyButton
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => { setStep('intro'); setAnswers(['', '', '', '']) }}
          >
            Practice again
          </JolyButton>
        </div>
        <Nav current="/practice" />
      </main>
    )
  }

  const stepNum = step as number

  return (
    <main className="min-h-screen flex flex-col px-6 pb-28">
      <div className="max-w-lg mx-auto w-full pt-12">

        {/* Header */}
        <div className="mb-10 animate-fade-up">
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
            {EXERCISE.title}
          </p>
        </div>

        {/* Progress */}
        <div className="animate-fade-up delay-100">
          <ProgressBar total={EXERCISE.steps.length} current={stepNum} />
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

          {stepNum < EXERCISE.steps.length - 1 ? (
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
