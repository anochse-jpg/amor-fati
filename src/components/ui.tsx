'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { motion, AnimatePresence } from 'motion/react'

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
          {
            'bg-[var(--accent)] text-[#0c0b0a] hover:brightness-110 font-ui font-medium tracking-wide': variant === 'primary',
            'bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)] font-ui': variant === 'ghost',
            'bg-transparent border border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] font-ui tracking-wide': variant === 'outline',
          },
          {
            'text-xs px-3 py-1.5 rounded': size === 'sm',
            'text-sm px-5 py-2.5 rounded': size === 'md',
            'text-sm px-7 py-3.5 rounded': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            className="text-xs tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-ui)', color: 'var(--foreground-subtle)', letterSpacing: '0.12em' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded px-4 py-3 text-sm transition-all duration-200',
            'placeholder:italic',
            'focus:outline-none',
            error && 'border-red-800/60',
            className
          )}
          style={{
            background: 'var(--muted)',
            border: error ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--border)',
            color: 'var(--foreground)',
            fontFamily: 'var(--font-display)',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--accent-dim)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = error ? 'rgba(239,68,68,0.3)' : 'var(--border)'
          }}
          {...props}
        />
        {error && <p className="text-xs text-red-400" style={{ fontFamily: 'var(--font-ui)' }}>{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label
            className="text-xs tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-ui)', color: 'var(--foreground-subtle)', letterSpacing: '0.12em' }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full rounded px-4 py-3 resize-none transition-all duration-200 focus:outline-none min-h-[130px]',
            className
          )}
          style={{
            background: 'var(--muted)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            lineHeight: 1.75,
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--accent-dim)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
          {...props}
        />
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn('rounded-lg p-6', className)}
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {children}
    </div>
  )
}

// ─── Stoic Quote ──────────────────────────────────────────────────────────────
export function StoicQuote({ quote, author }: { quote: string; author: string }) {
  return (
    <div className="quote-accent my-6">
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: '0.95rem',
          color: 'var(--foreground-muted)',
          lineHeight: 1.8,
          fontWeight: 300,
        }}
      >
        {quote}
      </p>
      <p
        className="mt-1"
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '10px',
          letterSpacing: '0.14em',
          color: 'var(--accent)',
          opacity: 0.6,
          textTransform: 'uppercase',
        }}
      >
        — {author}
      </p>
    </div>
  )
}

// ─── Progress Bar ──────────────────────────────────────────────────────────────
export function ProgressBar({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1.5 mb-10">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-px relative overflow-hidden"
          style={{ background: 'var(--border)' }}
        >
          <AnimatePresence>
            {i <= current && (
              <motion.div
                className="absolute inset-0"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28, delay: i * 0.04 }}
                style={{
                  background: i < current
                    ? 'var(--accent)'
                    : 'linear-gradient(90deg, var(--accent-dim), var(--accent))',
                  transformOrigin: '0% 50%',
                }}
              />
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

// ─── Page Header ──────────────────────────────────────────────────────────────
export function PageHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-10 animate-fade-up">
      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '10px',
          letterSpacing: '0.2em',
          color: 'var(--accent)',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
          opacity: 0.8,
        }}
      >
        {label}
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.8rem',
          fontWeight: 400,
          color: 'var(--foreground)',
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
const NAV_ICONS: Record<string, string> = {
  '/home': '◎',
  '/morning': '◐',
  '/evening': '◑',
  '/practice': '◈',
  '/history': '◫',
  '/insights': '◉',
}

export function Nav({ current }: { current: string }) {
  const links = [
    { href: '/home', label: 'Home' },
    { href: '/morning', label: 'Morning' },
    { href: '/evening', label: 'Evening' },
    { href: '/history', label: 'Journal' },
    { href: '/insights', label: 'Insights' },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--nav-border)',
      }}
    >
      <div className="max-w-lg mx-auto px-6 py-2.5">
        <div className="flex justify-around items-center">
          {links.map(({ href, label }) => {
            const isActive = current === href
            return (
              <a
                key={href}
                href={href}
                className="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg"
                style={{ textDecoration: 'none' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'var(--accent-whisper)', border: '1px solid var(--accent-dim)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  />
                )}
                <span
                  className="relative"
                  style={{
                    fontSize: '12px',
                    color: isActive ? 'var(--accent)' : 'var(--foreground-subtle)',
                    transition: 'color 0.2s',
                    lineHeight: 1,
                  }}
                >
                  {NAV_ICONS[href]}
                </span>
                <span
                  className="relative"
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '9px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: isActive ? 'var(--accent)' : 'var(--foreground-subtle)',
                    transition: 'color 0.2s',
                    opacity: isActive ? 1 : 0.5,
                  }}
                >
                  {label}
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
