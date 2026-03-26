'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    symbol: '☀',
    title: 'Morning Reflection',
    route: '/morning',
    tagline: 'Set your intention before the day begins',
    steps: [
      {
        label: 'Intention',
        prompt: 'What is the one thing that would make today meaningful?',
        description: 'Begin with clarity. Stoics called this premeditatio — deciding in advance what matters, so small things cannot steal your focus.',
      },
      {
        label: 'Obstacle',
        prompt: 'What might stand in your way, and what is within your power?',
        description: 'Marcus Aurelius called it the "obstacle is the way." By naming resistance in advance, you dissolve its power over you.',
      },
      {
        label: 'Gratitude',
        prompt: 'Name one thing you are grateful for, however small.',
        description: 'The Stoics practiced negative visualization — imagining the absence of what you have. Gratitude is its quieter, warmer twin.',
      },
    ],
  },
  {
    symbol: '◑',
    title: 'Evening Examination',
    route: '/evening',
    tagline: 'Close the day with honesty and release',
    steps: [
      {
        label: 'Review',
        prompt: 'What happened today that you did not expect?',
        description: 'Epictetus taught that events are neither good nor bad — only our judgements make them so. The review asks you to simply observe.',
      },
      {
        label: 'Virtue',
        prompt: 'Where did you act with virtue? Where did you fall short?',
        description: 'Seneca wrote to himself each night: "What weakness did I overcome? What am I better for?" This is not self-criticism — it is honest attention.',
      },
      {
        label: 'Release',
        prompt: 'What are you willing to let go of before you sleep?',
        description: 'The Stoic practice ends in release, not rumination. Write it down, then set it aside. Tomorrow is a new beginning.',
      },
    ],
  },
  {
    symbol: '◈',
    title: 'Stoic Practice',
    route: '/practice',
    tagline: 'Exercises drawn from ancient philosophy',
    steps: [
      {
        label: 'Dichotomy of Control',
        prompt: 'What is within your power — and what is not?',
        description: 'The cornerstone of Epictetus: divide every situation into what you control (your thoughts, actions, responses) and what you do not (everything else).',
      },
      {
        label: 'Negative Visualization',
        prompt: 'Imagine losing what you value most. How does that change today?',
        description: 'The Stoics called it premeditatio malorum — premeditation of adversity. Not to invite suffering, but to remember what is already precious.',
      },
      {
        label: 'More exercises',
        prompt: 'View from Above, Memento Mori, the Inner Citadel, and more.',
        description: 'Each exercise is a tool for the examined life — available when you need them, each grounded in original Stoic texts.',
      },
    ],
  },
]

const PHILOSOPHY_QUOTES = [
  { text: 'You have power over your mind, not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
  { text: 'It is not that I am brave, but that I know what is worth fearing.', author: 'Epictetus' },
  { text: 'We suffer more in imagination than in reality.', author: 'Seneca' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeatureCard({
  feature,
  isActive,
  onClick,
}: {
  feature: (typeof FEATURES)[0]
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        background: isActive ? 'var(--accent-whisper)' : 'var(--card)',
        border: `1px solid ${isActive ? 'var(--accent-dim)' : 'var(--border)'}`,
        borderRadius: '8px',
        padding: '20px 24px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
        <span style={{ fontSize: '1.2rem', opacity: 0.85 }}>{feature.symbol}</span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          fontWeight: 400,
          color: isActive ? 'var(--accent)' : 'var(--foreground)',
          transition: 'color 0.2s',
        }}>
          {feature.title}
        </span>
      </div>
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '12px',
        color: 'var(--foreground-subtle)',
        opacity: 0.65,
        paddingLeft: '34px',
        lineHeight: 1.5,
      }}>
        {feature.tagline}
      </p>
    </button>
  )
}

function StepDetail({ step, index }: { step: { label: string; prompt: string; description: string }; index: number }) {
  return (
    <div
      style={{
        padding: '20px 24px',
        borderRadius: '6px',
        background: 'var(--background-elevated)',
        border: '1px solid var(--border)',
        marginBottom: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          border: '1px solid var(--accent-dim)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '1px',
        }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--accent)' }}>{index + 1}</span>
        </div>
        <div>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '10px',
            letterSpacing: '0.2em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            opacity: 0.85,
            marginBottom: '6px',
          }}>
            {step.label}
          </p>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontStyle: 'italic',
            color: 'var(--foreground)',
            lineHeight: 1.55,
            marginBottom: '8px',
            fontWeight: 300,
          }}>
            &ldquo;{step.prompt}&rdquo;
          </p>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '12px',
            color: 'var(--foreground-subtle)',
            lineHeight: 1.7,
            opacity: 0.7,
          }}>
            {step.description}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  const [activeFeature, setActiveFeature] = useState(0)
  const feature = FEATURES[activeFeature]

  return (
    <main className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* Top nav */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid var(--border)',
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '0 1.5rem',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.05rem',
            fontWeight: 400,
            color: 'var(--foreground)',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
          }}
        >
          Amor <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Fati</span>
        </Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link
            href="/login"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              color: 'var(--foreground-muted)',
              textDecoration: 'none',
              letterSpacing: '0.04em',
            }}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              color: '#1a1208',
              background: 'var(--accent)',
              padding: '7px 16px',
              borderRadius: '4px',
              textDecoration: 'none',
              letterSpacing: '0.06em',
              fontWeight: 500,
            }}
          >
            Begin free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          padding: '5rem 1.5rem 3rem',
          textAlign: 'center',
        }}
        className="animate-fade-up"
      >
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '10px',
          letterSpacing: '0.25em',
          color: 'var(--accent)',
          textTransform: 'uppercase',
          opacity: 0.8,
          marginBottom: '1.5rem',
        }}>
          How it works
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.2rem, 6vw, 3.5rem)',
          fontWeight: 300,
          color: 'var(--foreground)',
          lineHeight: 1.15,
          marginBottom: '1.5rem',
          letterSpacing: '-0.02em',
        }}>
          A daily practice in<br />
          <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>two minutes or less</span>
        </h1>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          fontWeight: 300,
          color: 'var(--foreground-muted)',
          lineHeight: 1.8,
          maxWidth: '520px',
          margin: '0 auto',
        }}>
          Amor Fati is built around three Stoic practices that take just a few minutes —
          but compound over weeks into a quieter, clearer way of moving through life.
        </p>
      </section>

      {/* Interactive walkthrough */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 5rem' }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.6fr)',
          gap: '24px',
          alignItems: 'start',
        }}
          className="responsive-tutorial-grid"
        >
          {/* Left — feature selector */}
          <div>
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '10px',
              letterSpacing: '0.2em',
              color: 'var(--foreground-subtle)',
              textTransform: 'uppercase',
              opacity: 0.5,
              marginBottom: '12px',
            }}>
              Choose a practice
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {FEATURES.map((f, i) => (
                <FeatureCard
                  key={f.title}
                  feature={f}
                  isActive={activeFeature === i}
                  onClick={() => setActiveFeature(i)}
                />
              ))}
            </div>

            {/* Onboarding CTA */}
            <div style={{
              marginTop: '24px',
              padding: '18px 20px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
            }}>
              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '11px',
                letterSpacing: '0.18em',
                color: 'var(--accent)',
                textTransform: 'uppercase',
                opacity: 0.8,
                marginBottom: '8px',
              }}>
                Personalised to you
              </p>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.95rem',
                fontWeight: 300,
                color: 'var(--foreground-muted)',
                lineHeight: 1.65,
                marginBottom: '14px',
              }}>
                When you sign up, a short onboarding flow asks what you&apos;re working on — and tailors your daily prompts around that.
              </p>
              <Link
                href="/signup"
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '12px',
                  color: 'var(--accent)',
                  textDecoration: 'none',
                  letterSpacing: '0.06em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Start the onboarding →
              </Link>
            </div>
          </div>

          {/* Right — step details */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.4rem', opacity: 0.8 }}>{feature.symbol}</span>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  color: 'var(--foreground)',
                }}>
                  {feature.title}
                </h2>
              </div>
              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '12px',
                color: 'var(--foreground-subtle)',
                opacity: 0.65,
                letterSpacing: '0.04em',
              }}>
                {feature.tagline}
              </p>
            </div>

            <div key={feature.title} className="animate-fade-up" style={{ animationDuration: '0.4s' }}>
              {feature.steps.map((step, i) => (
                <StepDetail key={step.label} step={step} index={i} />
              ))}
            </div>

            <Link
              href={feature.route}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '8px',
                fontFamily: 'var(--font-ui)',
                fontSize: '12px',
                color: 'var(--foreground-subtle)',
                opacity: 0.5,
                textDecoration: 'none',
                letterSpacing: '0.06em',
              }}
            >
              Try {feature.title} →
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy section */}
      <section
        style={{
          borderTop: '1px solid var(--border)',
          padding: '5rem 1.5rem',
          maxWidth: '760px',
          margin: '0 auto',
        }}
      >
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '10px',
          letterSpacing: '0.25em',
          color: 'var(--accent)',
          textTransform: 'uppercase',
          opacity: 0.7,
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}>
          The philosophy behind it
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
          fontWeight: 300,
          color: 'var(--foreground)',
          lineHeight: 1.2,
          marginBottom: '1.5rem',
          textAlign: 'center',
          letterSpacing: '-0.02em',
        }}>
          Built on 2,000 years of<br />
          <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>practical wisdom</span>
        </h2>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.05rem',
          fontWeight: 300,
          color: 'var(--foreground-muted)',
          lineHeight: 1.85,
          textAlign: 'center',
          maxWidth: '520px',
          margin: '0 auto 3rem',
        }}>
          Stoicism is not about suppressing emotion or becoming indifferent.
          It is about understanding what is within your power — and focusing all your attention there.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}>
          {PHILOSOPHY_QUOTES.map(q => (
            <div
              key={q.author}
              style={{
                padding: '20px 22px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                borderLeft: '3px solid var(--accent-dim)',
                background: 'var(--card)',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.92rem',
                fontStyle: 'italic',
                fontWeight: 300,
                color: 'var(--foreground)',
                lineHeight: 1.65,
                marginBottom: '12px',
              }}>
                &ldquo;{q.text}&rdquo;
              </p>
              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '9px',
                letterSpacing: '0.18em',
                color: 'var(--accent)',
                textTransform: 'uppercase',
                opacity: 0.7,
              }}>
                — {q.author}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Your journey section */}
      <section
        style={{
          borderTop: '1px solid var(--border)',
          padding: '5rem 1.5rem',
          maxWidth: '760px',
          margin: '0 auto',
        }}
      >
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '10px',
          letterSpacing: '0.25em',
          color: 'var(--accent)',
          textTransform: 'uppercase',
          opacity: 0.7,
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}>
          Your journey
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
          fontWeight: 300,
          color: 'var(--foreground)',
          lineHeight: 1.2,
          marginBottom: '1.5rem',
          textAlign: 'center',
          letterSpacing: '-0.02em',
        }}>
          Small practice,<br />
          <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>lasting change</span>
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '3rem',
        }}>
          {[
            { symbol: '◦', tier: 'Seeker', days: '1–6 days', description: 'You have begun the examined life. Each entry plants a seed.' },
            { symbol: '◉', tier: 'Practitioner', days: '7–29 days', description: 'Consistency is building a foundation. Your patterns are becoming visible.' },
            { symbol: '◈', tier: 'Philosopher', days: '30–89 days', description: 'A genuine practice. The prompts have become a mirror for your thinking.' },
            { symbol: '✦', tier: 'Sage', days: '90+ days', description: 'Rare. You carry the practice lightly — it has become part of how you see.' },
          ].map(tier => (
            <div
              key={tier.tier}
              style={{
                padding: '20px 22px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: '1.4rem',
                color: 'var(--accent)',
                marginBottom: '10px',
                opacity: 0.8,
              }}>
                {tier.symbol}
              </div>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 400,
                color: 'var(--foreground)',
                marginBottom: '4px',
              }}>
                {tier.tier}
              </p>
              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '10px',
                letterSpacing: '0.12em',
                color: 'var(--accent)',
                opacity: 0.6,
                marginBottom: '10px',
                textTransform: 'uppercase',
              }}>
                {tier.days}
              </p>
              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '12px',
                color: 'var(--foreground-subtle)',
                lineHeight: 1.6,
                opacity: 0.65,
              }}>
                {tier.description}
              </p>
            </div>
          ))}
        </div>

        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.95rem',
          fontStyle: 'italic',
          color: 'var(--foreground-subtle)',
          textAlign: 'center',
          lineHeight: 1.7,
          opacity: 0.6,
          maxWidth: '400px',
          margin: '0 auto',
        }}>
          Your history is saved privately. Only you will ever read it.
        </p>
      </section>

      {/* Final CTA */}
      <section
        style={{
          borderTop: '1px solid var(--border)',
          padding: '5rem 1.5rem 6rem',
          textAlign: 'center',
        }}
      >
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 300,
          color: 'var(--foreground)',
          lineHeight: 1.15,
          marginBottom: '1.25rem',
          letterSpacing: '-0.02em',
        }}>
          Begin your practice.
        </h2>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1rem',
          fontWeight: 300,
          fontStyle: 'italic',
          color: 'var(--foreground-muted)',
          marginBottom: '2.5rem',
        }}>
          Free. Private. Takes two minutes.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/signup"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '13px',
              color: '#1a1208',
              background: 'var(--accent)',
              padding: '14px 28px',
              borderRadius: '4px',
              textDecoration: 'none',
              letterSpacing: '0.08em',
              fontWeight: 500,
            }}
            className="btn-primary"
          >
            Begin your practice →
          </Link>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '13px',
              color: 'var(--foreground-muted)',
              border: '1px solid var(--border)',
              padding: '14px 28px',
              borderRadius: '4px',
              textDecoration: 'none',
              letterSpacing: '0.06em',
            }}
          >
            Back to home
          </Link>
        </div>
      </section>

      {/* Responsive grid style */}
      <style>{`
        @media (max-width: 680px) {
          .responsive-tutorial-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </main>
  )
}
