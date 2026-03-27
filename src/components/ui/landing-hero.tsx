'use client'

import { motion, AnimatePresence, useInView } from 'motion/react'
import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import MotionButton from './motion-button'
import { ShaderAnimation } from './shader-lines'

// ─── Shared ease ──────────────────────────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

// ─── Hero entrance variants ────────────────────────────────────────────────────
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 22, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE } },
}

// ─── Morphing Text ────────────────────────────────────────────────────────────
const VIRTUES = ['Prudentia', 'Iustitia', 'Fortitudo', 'Temperantia', 'Amor Fati']

function MorphingText({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % words.length), 2700)
    return () => clearInterval(id)
  }, [words.length])
  return (
    <span style={{ display: 'inline-block', minWidth: '180px', textAlign: 'center' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 7, filter: 'blur(7px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -7, filter: 'blur(7px)' }}
          transition={{ duration: 0.42, ease: EASE }}
          style={{ display: 'inline-block' }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

// ─── Aurora Orbs ─────────────────────────────────────────────────────────────
// Soft, slowly drifting glows behind the hero for depth
function AuroraOrbs() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }} aria-hidden>
      <motion.div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '15%',
          width: 'min(720px, 85vw)',
          height: 'min(720px, 85vw)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,149,106,0.1) 0%, transparent 65%)',
          filter: 'blur(48px)',
        }}
        animate={{ x: [-30, 30, -30], y: [-20, 22, -20], scale: [1, 1.07, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={{
          position: 'absolute',
          top: '8%',
          right: '-8%',
          width: 'min(520px, 65vw)',
          height: 'min(520px, 65vw)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(91,143,168,0.07) 0%, transparent 65%)',
          filter: 'blur(64px)',
        }}
        animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 0.93, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      />
      <motion.div
        style={{
          position: 'absolute',
          bottom: '0%',
          left: '0%',
          width: 'min(460px, 55vw)',
          height: 'min(460px, 55vw)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,149,106,0.06) 0%, transparent 65%)',
          filter: 'blur(56px)',
        }}
        animate={{ x: [0, 25, 0], y: [0, -18, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut', delay: 9 }}
      />
    </div>
  )
}

// ─── Premium Card — spinning gradient border + spotlight ──────────────────────
function PremiumCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  return (
    <div
      ref={ref}
      style={{ position: 'relative', borderRadius: 'var(--radius-lg)', height: '100%' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={e => {
        if (!ref.current) return
        const r = ref.current.getBoundingClientRect()
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
      }}
    >
      {/* Spinning gradient border layer */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'conic-gradient(transparent 0%, transparent 72%, rgba(200,149,106,0.85) 86%, rgba(224,176,128,1) 91%, rgba(200,149,106,0.85) 96%, transparent 100%)',
          }}
          animate={{
            rotate: hovered ? 360 : 0,
            opacity: hovered ? 1 : 0,
          }}
          transition={{
            rotate: { duration: 3.5, repeat: hovered ? Infinity : 0, ease: 'linear' },
            opacity: { duration: 0.4 },
          }}
        />
      </div>

      {/* Inner card fill */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '1px',
          borderRadius: 'calc(var(--radius-lg) - 1px)',
          background: 'var(--landing-card-bg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      />

      {/* Static border (fades out when spinning border takes over) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--landing-card-border)',
          opacity: hovered ? 0 : 1,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Cursor spotlight */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle 220px at ${pos.x}px ${pos.y}px, rgba(200,149,106,0.11), transparent 70%)`,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.35s ease',
          zIndex: 2,
          borderRadius: 'inherit',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3, height: '100%' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Border Beam ──────────────────────────────────────────────────────────────
// A bright light that travels along the top and right edges of the CTA card
function BorderBeam() {
  return (
    <>
      {/* Top edge beam */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-1px',
          height: '2px',
          width: '130px',
          background: 'linear-gradient(90deg, transparent, var(--gold-bright), rgba(255,224,172,0.95), transparent)',
          boxShadow: '0 0 12px 4px rgba(216,168,124,0.55)',
          borderRadius: '2px',
          zIndex: 10,
        }}
        animate={{ left: ['-130px', '110%'] }}
        transition={{ duration: 3.8, repeat: Infinity, repeatDelay: 2.5, ease: [0.4, 0, 0.6, 1] }}
      />
      {/* Right edge beam */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          right: '-1px',
          width: '2px',
          height: '130px',
          background: 'linear-gradient(180deg, transparent, var(--gold-bright), rgba(255,224,172,0.95), transparent)',
          boxShadow: '0 0 12px 4px rgba(216,168,124,0.55)',
          borderRadius: '2px',
          zIndex: 10,
        }}
        animate={{ top: ['-130px', '110%'] }}
        transition={{ duration: 3.8, repeat: Infinity, repeatDelay: 2.5, ease: [0.4, 0, 0.6, 1], delay: 1.9 }}
      />
    </>
  )
}

// ─── Marquee Ticker ───────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  'Memento Mori', '·', 'Amor Fati', '·', 'Dichotomy of Control', '·',
  'Negative Visualization', '·', 'The Obstacle is the Way', '·',
  'Virtue as the Highest Good', '·', 'Prudentia', '·', 'Iustitia', '·',
  'Fortitudo', '·', 'Temperantia', '·',
]

function MarqueeTicker() {
  const tripled = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div
      aria-hidden
      style={{
        overflow: 'hidden',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '13px 0',
        maskImage: 'linear-gradient(90deg, transparent, black 7%, black 93%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, black 7%, black 93%, transparent)',
      }}
    >
      <div className="marquee-track">
        {tripled.map((item, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: item === '·' ? '1.6rem' : '1.8rem',
              fontFamily: item === '·' ? 'var(--font-ui)' : 'var(--font-display)',
              fontStyle: item === '·' ? 'normal' : 'italic',
              fontSize: item === '·' ? '0.35rem' : '0.68rem',
              letterSpacing: item === '·' ? '0' : '0.14em',
              color: item === '·' ? 'var(--accent)' : 'var(--foreground-muted)',
              opacity: item === '·' ? 0.65 : 0.65,
              verticalAlign: item === '·' ? 'middle' : 'baseline',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Quote Rotator ────────────────────────────────────────────────────────────
const QUOTES = [
  { text: 'Waste no more time arguing what a good man should be. Be one.', author: 'Marcus Aurelius' },
  { text: 'You have power over your mind, not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
  { text: 'We suffer more in imagination than in reality.', author: 'Seneca' },
  { text: 'Make the best use of what is in your power, and take the rest as it happens.', author: 'Epictetus' },
  { text: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius' },
]

function QuoteRotator() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % QUOTES.length), 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto', position: 'relative' }}>
      {/* Large decorative quotation mark */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-3rem',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(7rem, 18vw, 12rem)',
          color: 'var(--accent)',
          opacity: 0.055,
          lineHeight: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        &ldquo;
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1rem, 2.4vw, 1.2rem)',
            fontStyle: 'italic',
            color: 'var(--foreground-muted)',
            lineHeight: 1.85,
            fontWeight: 300,
            marginBottom: '1.25rem',
          }}>
            &ldquo;{QUOTES[index].text}&rdquo;
          </p>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '10px',
            letterSpacing: '0.25em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            opacity: 0.75,
          }}>
            — {QUOTES[index].author}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '2.5rem' }}>
        {QUOTES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Quote ${i + 1}`}
            style={{
              width: i === index ? '24px' : '6px',
              height: '2px',
              background: i === index ? 'var(--accent)' : 'rgba(200,149,106,0.22)',
              borderRadius: '2px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.35s ease',
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Scroll-triggered fade-in wrapper ─────────────────────────────────────────
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    symbol: '☀',
    title: 'Morning',
    subtitle: "Set the day's intention",
    body: 'A 2-minute ritual before the day begins. Name your intention, identify your obstacles, practice gratitude.',
  },
  {
    symbol: '◑',
    title: 'Evening',
    subtitle: 'The daily examination',
    body: 'Review the day with honesty. What went well? Where did you fall short? Close the day with clarity.',
  },
  {
    symbol: '◈',
    title: 'Practice',
    subtitle: 'Stoic exercises',
    body: 'Dichotomy of Control, Negative Visualization, Memento Mori — ancient tools for modern life.',
  },
]

const STOIC_VIRTUES = [
  { latin: 'Prudentia', english: 'Wisdom', desc: 'The ability to discern what is truly good and to act accordingly.', num: '01' },
  { latin: 'Iustitia', english: 'Justice', desc: 'Acting rightly toward others, with fairness and integrity.', num: '02' },
  { latin: 'Fortitudo', english: 'Courage', desc: 'Facing adversity, fear, and difficulty with endurance and strength.', num: '03' },
  { latin: 'Temperantia', english: 'Temperance', desc: 'Moderation and mastery over desires and impulses.', num: '04' },
]

// ─── Section helpers ──────────────────────────────────────────────────────────
function Ornament() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '1rem' }}>
      <div style={{ width: '32px', height: '1px', background: 'var(--border)' }} />
      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)', opacity: 0.45 }} />
      <div style={{ width: '32px', height: '1px', background: 'var(--border)' }} />
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: 'var(--font-ui)',
      fontSize: '9px',
      letterSpacing: '0.28em',
      color: 'var(--accent)',
      textTransform: 'uppercase' as const,
      opacity: 0.72,
      display: 'block',
      marginBottom: '1rem',
    }}>
      {children}
    </span>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function LandingHero() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6" style={{ zIndex: 1 }}>
        {/* Shader animation — only this section */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
          <ShaderAnimation />
          <div style={{ position: 'absolute', inset: 0, background: 'var(--landing-overlay)' }} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse 70% 55% at 50% 42%, var(--landing-glow) 0%, transparent 70%)',
            }}
          />
        </div>

        <AuroraOrbs />

        <motion.div
          className="max-w-2xl mx-auto text-center"
          variants={container}
          initial="hidden"
          animate="show"
          style={{ position: 'relative', zIndex: 2 }}
        >
          {/* Eyebrow */}
          <motion.div variants={fadeUp}>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '10px',
              letterSpacing: '0.28em',
              color: 'var(--accent)',
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: '1.5rem',
              opacity: 0.78,
            }}>
              A Stoic&rsquo;s Daily Practice
            </span>
          </motion.div>

          {/* Title — "Amor" */}
          <motion.div variants={fadeUp}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(5rem, 14vw, 9.5rem)',
              fontWeight: 300,
              lineHeight: 0.88,
              letterSpacing: '-0.03em',
              color: 'var(--foreground)',
              marginBottom: '0.15rem',
            }}>
              Amor
            </h1>
          </motion.div>

          {/* Title — "Fati" with shimmer */}
          <motion.div variants={fadeUp} style={{ marginBottom: '1.25rem' }}>
            <h1
              className="shimmer-text"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(5rem, 14vw, 9.5rem)',
                fontWeight: 300,
                lineHeight: 0.88,
                letterSpacing: '-0.03em',
                fontStyle: 'italic',
              }}
            >
              Fati
            </h1>
          </motion.div>

          {/* Morphing virtue text */}
          <motion.div variants={fadeUp} style={{ marginBottom: '1rem' }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
              color: 'var(--foreground-muted)',
              fontStyle: 'italic',
              letterSpacing: '0.04em',
            }}>
              <MorphingText words={VIRTUES} />
            </p>
          </motion.div>

          {/* Ornamental divider */}
          <motion.div variants={fadeUp} style={{ marginBottom: '1rem' }}>
            <div className="flex items-center justify-center gap-4">
              <div style={{ width: '52px', height: '1px', background: 'var(--border)' }} />
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', opacity: 0.48 }} />
              <div style={{ width: '52px', height: '1px', background: 'var(--border)' }} />
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.div variants={fadeUp} style={{ marginBottom: '1.5rem' }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1rem, 2.4vw, 1.15rem)',
              color: 'var(--foreground-muted)',
              lineHeight: 1.8,
              fontWeight: 300,
              maxWidth: '440px',
              margin: '0 auto',
            }}>
              A quiet place to begin and end each day with intention.
              Guided by Stoic philosophy. Grounded in reflection.
            </p>
          </motion.div>

          {/* Primary CTA */}
          <motion.div variants={fadeUp} style={{ marginBottom: '1.25rem' }}>
            <MotionButton label="Begin your practice" href="/signup" />
          </motion.div>

          {/* Secondary link */}
          <motion.div variants={fadeUp} style={{ marginBottom: '1.75rem' }}>
            <Link href="/how-it-works" style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              color: 'var(--foreground-muted)',
              letterSpacing: '0.1em',
              opacity: 0.75,
              textDecoration: 'none',
              display: 'inline-block',
            }}>
              How it works →
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeUp}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(1.5rem, 5vw, 3.5rem)',
              paddingTop: '1.25rem',
              paddingBottom: '2rem',
              borderTop: '1px solid rgba(37,35,24,0.6)',
            }}>
              {[
                { value: '2', unit: 'min', label: 'morning ritual' },
                { value: '2', unit: 'min', label: 'evening review' },
                { value: '4', unit: '', label: 'Stoic virtues' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.6rem, 4vw, 2.25rem)',
                    fontWeight: 300,
                    color: 'var(--foreground)',
                    lineHeight: 1,
                  }}>
                    {stat.value}
                    {stat.unit && (
                      <span style={{ fontSize: '0.55em', color: 'var(--accent)', marginLeft: '3px', fontStyle: 'italic' }}>
                        {stat.unit}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '9px',
                    letterSpacing: '0.18em',
                    color: 'var(--foreground-muted)',
                    opacity: 0.8,
                    marginTop: '5px',
                    textTransform: 'uppercase',
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </motion.div>

      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTIONS 2+ — dot-grid background
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ position: 'relative' }}>
        {/* Dot grid background */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(200,149,106,0.09) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        {/* Subtle radial vignette */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(200,149,106,0.035) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

      {/* ══════════════════════════════════════════════════════════════════
          MARQUEE TICKER — Stoic phrases scrolling between sections
      ══════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10">
        <FadeIn>
          <MarqueeTicker />
        </FadeIn>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2 — THE PRACTICE (Premium spinning-border cards)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 py-10">
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <SectionLabel>The Practice</SectionLabel>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 5vw, 2.75rem)',
                fontWeight: 300,
                color: 'var(--foreground)',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}>
                Begin each day with clarity.{' '}
                <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>End it with honesty.</span>
              </h2>
            </div>
          </FadeIn>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
          }}>
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.1}>
                <PremiumCard>
                  <div style={{
                    padding: '2rem 1.75rem',
                    height: '100%',
                    boxSizing: 'border-box',
                  }}>
                    {/* Symbol + label */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '1.05rem', opacity: 0.6 }}>{f.symbol}</span>
                      <span style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '9px',
                        letterSpacing: '0.22em',
                        color: 'var(--accent)',
                        textTransform: 'uppercase',
                        opacity: 0.88,
                      }}>
                        {f.title}
                      </span>
                    </div>

                    {/* Card heading */}
                    <p style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.2rem',
                      fontWeight: 400,
                      color: 'var(--foreground)',
                      marginBottom: '0.75rem',
                      lineHeight: 1.3,
                    }}>
                      {f.subtitle}
                    </p>

                    {/* Card body */}
                    <p style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.9rem',
                      fontWeight: 300,
                      color: 'var(--foreground-muted)',
                      lineHeight: 1.75,
                    }}>
                      {f.body}
                    </p>
                  </div>
                </PremiumCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3 — THE FOUR VIRTUES
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 py-8">
        <div style={{
          maxWidth: '780px',
          margin: '0 auto',
          borderTop: '1px solid var(--border)',
          paddingTop: '2rem',
        }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <SectionLabel>Foundation</SectionLabel>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 300,
                color: 'var(--foreground)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}>
                The Four Stoic Virtues
              </h2>
            </div>
          </FadeIn>

          {/* 4-up grid — carved stone 3D effect */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            background: 'var(--border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--border)',
            boxShadow: [
              'inset 0 3px 10px rgba(0,0,0,0.13)',
              'inset 0 1px 3px rgba(0,0,0,0.08)',
              '0 1px 0 rgba(255,255,255,0.55)',
              '0 4px 16px rgba(0,0,0,0.08)',
            ].join(', '),
          }}>
            {STOIC_VIRTUES.map((v, i) => (
              <FadeIn key={v.latin} delay={i * 0.08}>
                <div
                  className="virtue-card"
                  style={{
                    background: 'linear-gradient(160deg, var(--background-elevated) 0%, var(--background) 60%)',
                    padding: '1.75rem 1.25rem',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.07), inset 0 -1px 0 rgba(255,255,255,0.4)',
                  }}
                >
                  {/* Number indicator */}
                  <span style={{
                    position: 'absolute',
                    top: '1.25rem',
                    right: '1.25rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    color: 'var(--foreground-subtle)',
                    opacity: 0.18,
                    letterSpacing: '0.1em',
                  }}>
                    {v.num}
                  </span>
                  <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    letterSpacing: '0.18em',
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    marginBottom: '0.6rem',
                    opacity: 0.65,
                  }}>
                    {v.latin}
                  </p>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 300,
                    color: 'var(--foreground)',
                    marginBottom: '0.75rem',
                    lineHeight: 1.15,
                  }}>
                    {v.english}
                  </h3>
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.85rem',
                    fontWeight: 300,
                    color: 'var(--foreground-muted)',
                    lineHeight: 1.7,
                  }}>
                    {v.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 4 — QUOTE ROTATOR
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 py-8">
        <div style={{
          maxWidth: '780px',
          margin: '0 auto',
          borderTop: '1px solid var(--border)',
          paddingTop: '2rem',
        }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <SectionLabel>Wisdom</SectionLabel>
              <Ornament />
            </div>
            <QuoteRotator />
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 5 — FINAL CTA
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 py-12">
        <div style={{ maxWidth: '1040px', margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            {/* Ambient glow underneath card */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: '-40px',
                background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(200,149,106,0.1), transparent)',
                pointerEvents: 'none',
                zIndex: -1,
              }}
            />

            {/* Glowing glass card with border beam — wide rectangle */}
            <div
              style={{
                position: 'relative',
                background: 'var(--landing-card-bg)',
                border: '1px solid var(--landing-card-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem clamp(2rem, 6vw, 5rem)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: 'var(--landing-card-shadow)',
                overflow: 'hidden',
              }}
            >
              {/* Border beam */}
              <BorderBeam />

              {/* Ambient glow — top edge line */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '70%',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                  opacity: 0.6,
                }}
              />

              <SectionLabel>Begin</SectionLabel>

              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 7vw, 4.25rem)',
                fontWeight: 300,
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
                color: 'var(--foreground)',
                marginBottom: '0.2rem',
              }}>
                Your practice
              </h2>
              <h2
                className="shimmer-text"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.5rem, 7vw, 4.25rem)',
                  fontWeight: 300,
                  lineHeight: 1.05,
                  letterSpacing: '-0.025em',
                  fontStyle: 'italic',
                  marginBottom: '2rem',
                }}
              >
                starts today
              </h2>

              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                color: 'var(--foreground-muted)',
                lineHeight: 1.8,
                fontWeight: 300,
                marginBottom: '2.75rem',
                opacity: 0.82,
              }}>
                Two minutes each morning. Two minutes each evening.<br />
                Ancient wisdom. Modern clarity.
              </p>

              <MotionButton label="Begin your practice" href="/signup" />

              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '11px',
                color: 'var(--foreground-muted)',
                opacity: 0.72,
                marginTop: '1.5rem',
                letterSpacing: '0.06em',
              }}>
                Free to start. No commitment required.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════ */}
      <footer
        className="relative z-10 px-6 py-7"
        style={{ borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1 }}
      >
        <div style={{
          maxWidth: '1040px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            color: 'var(--accent)',
            fontSize: '1.1rem',
            opacity: 0.75,
            letterSpacing: '0.02em',
          }}>
            Amor Fati
          </span>

          <div style={{
            width: '32px',
            height: '1px',
            background: 'var(--border)',
            opacity: 0.6,
          }} />

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {[
              { label: 'How it works', href: '/how-it-works' },
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
            ].map(l => (
              <Link key={l.label} href={l.href} style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '11px',
                color: 'var(--foreground-muted)',
                textDecoration: 'none',
                opacity: 0.65,
                letterSpacing: '0.1em',
              }}>
                {l.label}
              </Link>
            ))}
          </div>

          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '10px',
            color: 'var(--foreground-subtle)',
            opacity: 0.4,
            letterSpacing: '0.06em',
            marginTop: '0.25rem',
          }}>
            © {new Date().getFullYear()} Amor Fati. All rights reserved.
          </p>
        </div>
      </footer>
      </div>{/* end dot-grid wrapper */}
    </>
  )
}
