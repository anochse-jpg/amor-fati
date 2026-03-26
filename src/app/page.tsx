import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ShaderAnimation } from '@/components/ui/shader-lines'
import MotionButton from '@/components/ui/motion-button'

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  if (params.code) {
    redirect(`/auth/callback?code=${params.code}`)
  }
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">

      {/* Shader animation background */}
      <div className="fixed inset-0 z-0">
        <ShaderAnimation />
        {/* Overlay — adapts to theme */}
        <div
          className="absolute inset-0"
          style={{ background: 'var(--landing-overlay)' }}
        />
        {/* Warm terracotta center glow — like torch-light on ancient stone */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 55% at 50% 42%, var(--landing-glow) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Hero — full viewport height, centered */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="max-w-2xl mx-auto text-center">

          {/* Eyebrow */}
          <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '10px',
                letterSpacing: '0.25em',
                color: 'var(--accent)',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '2rem',
                opacity: 0.85,
              }}
            >
              A Stoic Daily Practice
            </span>
          </div>

          {/* Main title — wrapped in frosted card for contrast */}
          <div
            className="animate-fade-up delay-200"
            style={{
              background: 'var(--landing-card-bg)',
              border: '1px solid var(--landing-card-border)',
              borderRadius: '8px',
              padding: '3rem 3.5rem 2.5rem',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              marginBottom: '2.5rem',
              boxShadow: 'var(--landing-card-shadow)',
            }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(4rem, 12vw, 8rem)',
                fontWeight: 300,
                lineHeight: 0.9,
                letterSpacing: '-0.03em',
                color: 'var(--foreground)',
                marginBottom: '0.5rem',
              }}
            >
              Amor
            </h1>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(4rem, 12vw, 8rem)',
                fontWeight: 300,
                lineHeight: 0.9,
                letterSpacing: '-0.03em',
                fontStyle: 'italic',
                color: 'var(--accent)',
                marginBottom: '2rem',
              }}
            >
              Fati
            </h1>

            {/* Translation */}
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.15rem',
                fontStyle: 'italic',
                color: 'var(--foreground-muted)',
                fontWeight: 300,
                marginBottom: '1.75rem',
              }}
            >
              Love of Fate
            </p>

            {/* Ornamental divider */}
            <div className="flex items-center justify-center gap-4" style={{ marginBottom: '1.75rem' }}>
              <div style={{ width: '40px', height: '1px', background: 'var(--border)' }} />
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)', opacity: 0.5 }} />
              <div style={{ width: '40px', height: '1px', background: 'var(--border)' }} />
            </div>

            {/* Description */}
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.05rem',
                color: 'var(--foreground-muted)',
                lineHeight: 1.8,
                fontWeight: 300,
                maxWidth: '420px',
                margin: '0 auto',
              }}
            >
              A quiet place to begin and end each day with intention.
              Guided by Stoic philosophy. Grounded in reflection.
            </p>
          </div>

          {/* CTA */}
          <div className="animate-fade-up delay-400" style={{ marginBottom: '1.5rem' }}>
            <MotionButton label="Begin your practice" href="/signup" />
          </div>

          {/* Secondary CTA */}
          <div className="animate-fade-up delay-500" style={{ marginBottom: '3.5rem' }}>
            <Link
              href="/how-it-works"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '12px',
                color: 'var(--foreground-subtle)',
                letterSpacing: '0.08em',
                opacity: 0.55,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              How it works →
            </Link>
          </div>

          {/* Stoic quote */}
          <div className="animate-fade-up delay-600">
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.9rem',
                fontStyle: 'italic',
                color: 'var(--foreground-subtle)',
                lineHeight: 1.8,
                marginBottom: '0.4rem',
              }}
            >
              &ldquo;Waste no more time arguing what a good man should be. Be one.&rdquo;
            </p>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '9px',
                letterSpacing: '0.2em',
                color: 'var(--foreground-subtle)',
                opacity: 0.45,
                textTransform: 'uppercase',
              }}
            >
              Marcus Aurelius
            </p>
          </div>

        </div>
      </section>

      {/* Feature strip — scrolls below the hero */}
      <section className="relative z-10 px-6 pb-20">
        <div
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            borderTop: '1px solid rgba(200,149,106,0.12)',
            paddingTop: '3.5rem',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
            }}
          >
            {[
              { symbol: '☀', title: 'Morning', body: 'Set intention, name obstacles, find gratitude. A 2-minute ritual before the day begins.' },
              { symbol: '◑', title: 'Evening', body: 'Review, examine virtue, release. Close each day with honesty and clarity.' },
              { symbol: '◈', title: 'Practice', body: 'Stoic exercises — Dichotomy of Control, Negative Visualization, and more.' },
            ].map(f => (
              <div key={f.title} className="animate-fade-up delay-300">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1rem', opacity: 0.7 }}>{f.symbol}</span>
                  <span style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    opacity: 0.8,
                  }}>
                    {f.title}
                  </span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.9rem',
                  fontWeight: 300,
                  color: 'var(--foreground-subtle)',
                  lineHeight: 1.7,
                  opacity: 0.7,
                }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
