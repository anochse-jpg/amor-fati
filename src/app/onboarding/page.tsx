'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FloatingLabelTextarea } from '@/components/ui/textarea-with-floating-label'

type Goal = 'anxiety' | 'focus' | 'relationships' | 'purpose'
type Experience = 'beginner' | 'reader' | 'practitioner'
type Routine = 'morning' | 'evening' | 'both'

const GOAL_CARDS: { id: Goal; concept: string; label: string; sub: string }[] = [
  { id: 'anxiety',       concept: 'Equanimity', label: 'Managing anxiety',    sub: 'Find stillness amid uncertainty'  },
  { id: 'focus',         concept: 'Attention',  label: 'Sharpening focus',    sub: 'Act with clarity and purpose'     },
  { id: 'relationships', concept: 'Virtue',     label: 'Better relationships', sub: 'Grow through connection'         },
  { id: 'purpose',       concept: 'Meaning',    label: 'Finding purpose',     sub: 'Live with intention'              },
]

const EXPERIENCE_OPTIONS: { id: Experience; label: string; sub: string }[] = [
  { id: 'beginner',      label: 'Just beginning',        sub: 'New to Stoic philosophy'                       },
  { id: 'reader',        label: 'I\'ve read the texts',  sub: 'Marcus Aurelius, Seneca, or Epictetus'         },
  { id: 'practitioner',  label: 'Regular practitioner',  sub: 'I apply Stoic exercises in my life'            },
]

const ROUTINE_OPTIONS: { id: Routine; symbol: string; label: string; sub: string }[] = [
  { id: 'morning', symbol: '☀',  label: 'Morning',           sub: 'Set your intention before the day begins' },
  { id: 'evening', symbol: '◑',  label: 'Evening',            sub: 'Examine the day and let it go'            },
  { id: 'both',    symbol: '∞',  label: 'Morning & Evening',  sub: 'The complete Stoic practice'              },
]

const GOAL_PROMPTS: Record<Goal, string> = {
  anxiety:       'What is weighing on you most right now? Write it plainly — we will then work through what is and is not within your power.',
  focus:         'What is the one thing that, if done today, would make everything else easier?',
  relationships: 'Think of one relationship in your life. What is one small thing within your power to strengthen it?',
  purpose:       'What would make today feel meaningful, regardless of how it turns out?',
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-20 animate-fade-in" style={{ height: '2px', background: 'var(--border)' }}>
      <div
        style={{
          height: '100%',
          width: `${((step + 1) / total) * 100}%`,
          background: 'linear-gradient(90deg, var(--accent-dim), var(--accent))',
          transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </div>
  )
}

function StepLabel({ current, total }: { current: number; total: number }) {
  return (
    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--foreground-subtle)', opacity: 0.6, marginBottom: '2.5rem', textTransform: 'uppercase' }}>
      {current} of {total}
    </p>
  )
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 400, color: 'var(--foreground)', lineHeight: 1.25, marginBottom: '0.5rem' }}>
      {children}
    </h1>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--foreground-subtle)', lineHeight: 1.7, marginBottom: '2.5rem', opacity: 0.7 }}>
      {children}
    </p>
  )
}

function PrimaryButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        background: disabled ? 'var(--muted)' : 'var(--accent)',
        color: disabled ? 'var(--foreground-subtle)' : '#1a1208',
        padding: '14px 24px',
        borderRadius: '4px',
        fontFamily: 'var(--font-ui)',
        fontSize: '13px',
        fontWeight: 500,
        letterSpacing: '0.08em',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        marginTop: '2rem',
      }}
      className={disabled ? '' : 'btn-primary'}
    >
      {children}
    </button>
  )
}

function SkipLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'center',
        marginTop: '1rem',
        fontFamily: 'var(--font-ui)',
        fontSize: '11px',
        color: 'var(--foreground-subtle)',
        opacity: 0.45,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        letterSpacing: '0.06em',
      }}
    >
      Skip for now
    </button>
  )
}

function SelectCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        textAlign: 'left',
        background: selected ? 'var(--accent-whisper)' : hovered ? 'rgba(200,149,106,0.04)' : 'var(--card)',
        border: `1px solid ${selected ? 'var(--accent)' : hovered ? 'rgba(200,149,106,0.3)' : 'var(--border)'}`,
        borderRadius: '6px',
        padding: '16px 20px',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {children}
      {selected && (
        <div style={{
          width: '18px', height: '18px', borderRadius: '50%',
          background: 'var(--accent)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#1a1208', fontSize: '10px', lineHeight: 1 }}>✓</span>
        </div>
      )}
    </button>
  )
}

// ─── Step 0 — Name ───────────────────────────────────────────────────────────

function StepName({ name, setName, onNext }: { name: string; setName: (v: string) => void; onNext: () => void }) {
  return (
    <div>
      <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'var(--accent)', fontSize: '13px' }}>∞</span>
        </div>
      </div>

      <Heading>A practice for<br />the examined life.</Heading>
      <SubHeading>Before we begin — what shall I call you?</SubHeading>

      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onNext() }}
        placeholder="Your name"
        autoFocus
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid var(--border)',
          padding: '10px 0',
          fontFamily: 'var(--font-display)',
          fontSize: '1.6rem',
          fontWeight: 300,
          color: 'var(--foreground)',
          outline: 'none',
          letterSpacing: '0.01em',
        }}
        onFocus={e => { e.currentTarget.style.borderBottomColor = 'var(--accent)' }}
        onBlur={e => { e.currentTarget.style.borderBottomColor = 'var(--border)' }}
      />

      <PrimaryButton onClick={onNext} disabled={!name.trim()}>
        Continue →
      </PrimaryButton>

      <SkipLink onClick={onNext} />
    </div>
  )
}

// ─── Step 1 — Goal ───────────────────────────────────────────────────────────

function StepGoal({
  name, goal, setGoal, onNext, onSkip,
}: {
  name: string; goal: Goal | null; setGoal: (g: Goal) => void; onNext: () => void; onSkip: () => void
}) {
  return (
    <div>
      <StepLabel current={1} total={4} />
      <Heading>{name ? `What do you most\nwant to work on, ${name}?` : 'What do you most\nwant to work on?'}</Heading>
      <SubHeading>Your daily practices will be shaped around this.</SubHeading>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {GOAL_CARDS.map(card => (
          <SelectCard key={card.id} selected={goal === card.id} onClick={() => setGoal(card.id)}>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '9px', letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '6px', opacity: 0.9 }}>
                {card.concept}
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 400, color: 'var(--foreground)', marginBottom: '4px' }}>
                {card.label}
              </p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--foreground-subtle)', lineHeight: 1.5, opacity: 0.7 }}>
                {card.sub}
              </p>
            </div>
          </SelectCard>
        ))}
      </div>

      <PrimaryButton onClick={onNext} disabled={!goal}>
        Continue →
      </PrimaryButton>
      <SkipLink onClick={onSkip} />
    </div>
  )
}

// ─── Step 2 — Experience ─────────────────────────────────────────────────────

function StepExperience({
  experience, setExperience, onNext, onSkip,
}: {
  experience: Experience | null; setExperience: (e: Experience) => void; onNext: () => void; onSkip: () => void
}) {
  return (
    <div>
      <StepLabel current={2} total={4} />
      <Heading>Where are you in<br />your Stoic practice?</Heading>
      <SubHeading>This shapes how your prompts are written — no wrong answer.</SubHeading>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {EXPERIENCE_OPTIONS.map(opt => (
          <SelectCard key={opt.id} selected={experience === opt.id} onClick={() => setExperience(opt.id)}>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 400, color: 'var(--foreground)', marginBottom: '3px' }}>
                {opt.label}
              </p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--foreground-subtle)', opacity: 0.65 }}>
                {opt.sub}
              </p>
            </div>
          </SelectCard>
        ))}
      </div>

      <PrimaryButton onClick={onNext} disabled={!experience}>
        Continue →
      </PrimaryButton>
      <SkipLink onClick={onSkip} />
    </div>
  )
}

// ─── Step 3 — Routine ────────────────────────────────────────────────────────

function StepRoutine({
  routine, setRoutine, onNext, onSkip,
}: {
  routine: Routine | null; setRoutine: (r: Routine) => void; onNext: () => void; onSkip: () => void
}) {
  return (
    <div>
      <StepLabel current={3} total={4} />
      <Heading>When do you want<br />to reflect?</Heading>
      <SubHeading>You can change this anytime in settings.</SubHeading>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {ROUTINE_OPTIONS.map(opt => (
          <SelectCard key={opt.id} selected={routine === opt.id} onClick={() => setRoutine(opt.id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '1.3rem', opacity: 0.8, width: '24px', textAlign: 'center' }}>
                {opt.symbol}
              </span>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 400, color: 'var(--foreground)', marginBottom: '2px' }}>
                  {opt.label}
                </p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--foreground-subtle)', opacity: 0.65 }}>
                  {opt.sub}
                </p>
              </div>
            </div>
          </SelectCard>
        ))}
      </div>

      <PrimaryButton onClick={onNext} disabled={!routine}>
        Continue →
      </PrimaryButton>
      <SkipLink onClick={onSkip} />
    </div>
  )
}

// ─── Step 4 — First Reflection (Aha moment) ──────────────────────────────────

function StepReflection({
  name, goal, reflection, setReflection, saving, onSave, onSkip,
}: {
  name: string
  goal: Goal | null
  reflection: string
  setReflection: (v: string) => void
  saving: boolean
  onSave: () => void
  onSkip: () => void
}) {
  const prompt = goal ? GOAL_PROMPTS[goal] : 'What is on your mind as you begin this practice?'

  return (
    <div>
      {/* Ornamental top mark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2.5rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span style={{ color: 'var(--accent)', fontSize: '11px', opacity: 0.6 }}>∞</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.22em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '1.25rem', opacity: 0.8 }}>
        Your first reflection
      </p>

      <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.15rem, 3vw, 1.45rem)', fontWeight: 300, fontStyle: 'italic', color: 'var(--foreground)', lineHeight: 1.55, marginBottom: '2rem' }}>
        &ldquo;{prompt}&rdquo;
      </p>

      <FloatingLabelTextarea
        label={name ? `Write freely, ${name}…` : 'Write freely…'}
        value={reflection}
        onChange={e => setReflection(e.target.value)}
      />

      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--foreground-subtle)', opacity: 0.4, marginTop: '0.75rem' }}>
        This is private. Only you will ever read it.
      </p>

      <PrimaryButton onClick={onSave} disabled={saving}>
        {saving ? 'Saving…' : reflection.trim() ? 'Save my reflection →' : 'Begin my practice →'}
      </PrimaryButton>

      {!saving && (
        <SkipLink onClick={onSkip} />
      )}
    </div>
  )
}

// ─── Completion screen ────────────────────────────────────────────────────────

function DoneScreen({ name }: { name: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="animate-fade-up text-center max-w-sm">
        <div
          className="w-14 h-14 mx-auto mb-8 flex items-center justify-center rounded-full animate-breathe"
          style={{ border: '1px solid var(--accent-dim)' }}
        >
          <span style={{ color: 'var(--accent)', fontSize: '20px' }}>✓</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'var(--foreground)', marginBottom: '0.75rem' }}>
          {name ? `Welcome, ${name}.` : 'Welcome.'}
        </h2>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontStyle: 'italic', color: 'var(--foreground-muted)' }}>
          Your practice begins now.
        </p>
      </div>
    </main>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 5

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isLeaving, setIsLeaving] = useState(false)
  const [name, setName] = useState('')
  const [goal, setGoal] = useState<Goal | null>(null)
  const [experience, setExperience] = useState<Experience | null>(null)
  const [routine, setRoutine] = useState<Routine | null>(null)
  const [reflection, setReflection] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const advance = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setStep(s => s + 1)
      setIsLeaving(false)
    }, 280)
  }

  const handleFinish = async () => {
    setSaving(true)
    const supabase = createClient()

    await supabase.auth.updateUser({
      data: {
        display_name: name.trim() || null,
        goal,
        experience,
        routine,
        onboarding_completed: true,
      },
    })

    if (reflection.trim()) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('journal_entries').insert({
          user_id: user.id,
          type: 'morning',
          content: { intention: reflection.trim(), onboarding: true, goal },
          entry_date: new Date().toISOString().split('T')[0],
        })
      }
    }

    setDone(true)
    setTimeout(() => {
      router.push(routine === 'evening' ? '/evening' : '/morning')
      router.refresh()
    }, 1600)
  }

  if (done) return <DoneScreen name={name} />

  const contentClass = isLeaving ? 'animate-fade-out-up' : 'animate-fade-up'
  const showProgress = step < 4

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(200,149,106,0.04) 0%, transparent 70%)',
        }} />
      </div>

      {/* Top progress bar */}
      {showProgress && <ProgressBar step={step} total={4} />}

      {/* Back to home — only on step 0 */}
      {step === 0 && (
        <Link
          href="/"
          className="fixed top-7 left-8 animate-fade-in"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            color: 'var(--foreground-subtle)',
            letterSpacing: '0.08em',
            textDecoration: 'none',
            opacity: 0.45,
          }}
        >
          ← back
        </Link>
      )}

      {/* Step content — key forces remount → re-animation */}
      <div
        key={step}
        className={contentClass}
        style={{ width: '100%', maxWidth: '480px', animationDuration: '0.55s' }}
      >
        {step === 0 && (
          <StepName name={name} setName={setName} onNext={advance} />
        )}
        {step === 1 && (
          <StepGoal name={name} goal={goal} setGoal={setGoal} onNext={advance} onSkip={advance} />
        )}
        {step === 2 && (
          <StepExperience experience={experience} setExperience={setExperience} onNext={advance} onSkip={advance} />
        )}
        {step === 3 && (
          <StepRoutine routine={routine} setRoutine={setRoutine} onNext={advance} onSkip={advance} />
        )}
        {step === 4 && (
          <StepReflection
            name={name}
            goal={goal}
            reflection={reflection}
            setReflection={setReflection}
            saving={saving}
            onSave={handleFinish}
            onSkip={() => { setReflection(''); handleFinish() }}
          />
        )}
      </div>
    </main>
  )
}
