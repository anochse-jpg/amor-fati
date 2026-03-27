'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { JolyButton } from '@/components/ui/joly-button'

interface CompletionCardCTA {
  label: string
  href: string
  variant?: 'default' | 'outline' | 'ghost'
}

interface CompletionCardProps {
  heading: string
  subheading: string
  echoLabel: string
  echoContent: string
  quote: { text: string; author: string }
  ctas: CompletionCardCTA[]
}

export function CompletionCard({
  heading,
  subheading,
  echoLabel,
  echoContent,
  quote,
  ctas,
}: CompletionCardProps) {
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle')

  async function handleShare() {
    const text = `${echoLabel}: "${echoContent}"`
    try {
      if (navigator.share) {
        await navigator.share({ text, title: heading })
      } else {
        await navigator.clipboard.writeText(text)
        setShareState('copied')
        setTimeout(() => setShareState('idle'), 2000)
      }
    } catch {
      // user cancelled — ignore
    }
  }

  return (
    <div className="max-w-md w-full animate-fade-up">
      {/* Check icon */}
      <div
        className="w-12 h-12 mx-auto mb-8 flex items-center justify-center rounded-full"
        style={{ border: '1px solid var(--accent-dim)' }}
      >
        <span style={{ color: 'var(--accent)', fontSize: '18px' }}>✓</span>
      </div>

      {/* Heading */}
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
        {heading}
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          color: 'var(--foreground-subtle)',
          marginBottom: '2rem',
          lineHeight: 1.7,
          textAlign: 'center',
        }}
      >
        {subheading}
      </p>

      {/* Answer echo */}
      {echoContent && (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderLeft: '1.5px solid var(--accent-dim)',
            borderRadius: '8px',
            padding: '18px 20px',
            marginBottom: '1.75rem',
            position: 'relative',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '9px',
              letterSpacing: '0.2em',
              color: 'var(--accent)',
              textTransform: 'uppercase',
              opacity: 0.6,
              marginBottom: '8px',
            }}
          >
            {echoLabel}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: '1rem',
              color: 'var(--foreground)',
              lineHeight: 1.75,
              fontWeight: 300,
              paddingRight: '28px',
            }}
          >
            {echoContent}
          </p>
          <button
            onClick={handleShare}
            title="Share"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: shareState === 'copied' ? 'var(--accent)' : 'var(--foreground-subtle)',
              opacity: shareState === 'copied' ? 0.9 : 0.4,
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontFamily: 'var(--font-ui)',
              fontSize: '9px',
              letterSpacing: '0.1em',
              padding: '4px',
              transition: 'opacity 0.2s, color 0.2s',
            }}
          >
            {shareState === 'copied' ? (
              'Copied'
            ) : (
              <Share2 size={11} />
            )}
          </button>
        </div>
      )}

      {/* Quote */}
      <div
        className="text-left"
        style={{
          borderLeft: '1.5px solid var(--accent-dim)',
          paddingLeft: '1.25rem',
          marginBottom: '2.5rem',
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
          {quote.text}
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
          — {quote.author}
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        {ctas.map((cta, i) => (
          <JolyButton key={i} variant={cta.variant ?? 'outline'} size="lg" asChild>
            <a href={cta.href}>{cta.label}</a>
          </JolyButton>
        ))}
      </div>
    </div>
  )
}
