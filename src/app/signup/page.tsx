'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Lock, AlertCircle, Check } from 'lucide-react'

// ─── Social logos (same as login) ─────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  )
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--foreground-subtle)', opacity: 0.5 }}>
        or
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  )
}

function FieldWrapper({
  id, label, icon, children, focused,
}: {
  id: string; label: string; icon: React.ReactNode; children: React.ReactNode; focused: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label
        htmlFor={id}
        style={{
          fontFamily: 'var(--font-ui)',
          color: focused ? 'var(--accent)' : 'var(--foreground-subtle)',
          opacity: focused ? 1 : 0.65,
          transition: 'color 0.2s, opacity 0.2s',
        }}
      >
        {label}
      </Label>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: focused ? 'rgba(200,149,106,0.04)' : 'var(--muted)',
          border: `1px solid ${focused ? 'var(--accent-dim)' : 'var(--border)'}`,
          borderRadius: '8px', padding: '0 14px', height: '48px',
          boxShadow: focused ? '0 0 0 3px rgba(200,149,106,0.08)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        <span style={{ color: focused ? 'var(--accent)' : 'var(--foreground-subtle)', opacity: 0.7, flexShrink: 0, transition: 'color 0.2s' }}>
          {icon}
        </span>
        {children}
      </div>
    </div>
  )
}

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessState({ email }: { email: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 40%, var(--landing-glow) 0%, transparent 70%)',
      }} />
      <div className="animate-scale-in text-center max-w-sm relative z-10">
        <div className="w-14 h-14 mx-auto mb-8 flex items-center justify-center rounded-full animate-breathe" style={{
          border: '1px solid var(--accent-dim)',
          boxShadow: '0 0 24px rgba(200,149,106,0.2)',
        }}>
          <Check size={20} style={{ color: 'var(--accent)' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'var(--foreground)', marginBottom: '12px' }}>
          Almost there
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--foreground-subtle)', lineHeight: 1.7, opacity: 0.7, marginBottom: '24px' }}>
          A confirmation link was sent to <strong style={{ color: 'var(--foreground)' }}>{email}</strong>.<br />
          Open it to begin your practice.
        </p>
        <Link href="/login" style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', opacity: 0.8 }}>
          ← Back to sign in
        </Link>
      </div>
    </main>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [focused, setFocused]   = useState<string | null>(null)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/onboarding` },
      })
      if (error) { setError(error.message); setLoading(false) }
      else { setSuccess(true) }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error — please try again.')
      setLoading(false)
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setOauthLoading(provider)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    })
  }

  if (success) return <SuccessState email={email} />

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden animate-fade-in-soft">

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 65% 55% at 50% 38%, var(--landing-glow) 0%, transparent 70%)',
        }} />
      </div>

      <Card
        className="max-w-sm w-full relative z-10"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 0 0 1px rgba(200,149,106,0.06), 0 8px 40px rgba(0,0,0,0.15), 0 0 60px rgba(200,149,106,0.04)',
        }}
      >
        <CardContent className="p-8 flex flex-col gap-5">

          {/* Logo + heading */}
          <div className="text-center" style={{ marginBottom: '0.5rem' }}>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', marginBottom: '1.25rem' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                border: '1px solid var(--accent-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(200,149,106,0.2)',
              }}>
                <span style={{ color: 'var(--accent)', fontSize: '16px', lineHeight: 1 }}>∞</span>
              </div>
            </a>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400, color: 'var(--foreground)', marginBottom: '4px' }}>
              Begin your practice
            </h1>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--foreground-subtle)', opacity: 0.55, letterSpacing: '0.04em' }}>
              Free. No credit card required.
            </p>
          </div>

          {/* Ornamental divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)', opacity: 0.3 }} />
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Social sign-up */}
          <div className="flex flex-col gap-2.5">
            <Button
              variant="outline" size="lg" className="w-full gap-3"
              onClick={() => handleOAuth('google')}
              disabled={oauthLoading !== null}
            >
              <GoogleIcon />
              <span style={{ fontFamily: 'var(--font-ui)' }}>
                {oauthLoading === 'google' ? 'Redirecting…' : 'Continue with Google'}
              </span>
            </Button>
            <Button
              variant="outline" size="lg" className="w-full gap-3"
              onClick={() => handleOAuth('github')}
              disabled={oauthLoading !== null}
            >
              <GitHubIcon />
              <span style={{ fontFamily: 'var(--font-ui)' }}>
                {oauthLoading === 'github' ? 'Redirecting…' : 'Continue with GitHub'}
              </span>
            </Button>
            <Button
              variant="outline" size="lg" className="w-full gap-3"
              disabled style={{ opacity: 0.45 }}
            >
              <AppleIcon />
              <span style={{ fontFamily: 'var(--font-ui)' }}>Continue with Apple</span>
            </Button>
          </div>

          <OrDivider />

          {/* Email + password form */}
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <FieldWrapper id="email" label="Email" icon={<Mail size={16} />} focused={focused === 'email'}>
              <Input
                id="email" type="email" value={email}
                onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
            </FieldWrapper>

            <FieldWrapper id="password" label="Password" icon={<Lock size={16} />} focused={focused === 'password'}>
              <Input
                id="password" type="password" value={password}
                onChange={e => setPassword(e.target.value)} required
                placeholder="At least 8 characters"
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
              />
            </FieldWrapper>

            {error && (
              <div className="flex items-center gap-2" style={{ color: '#c0392b' }}>
                <AlertCircle size={13} />
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px' }}>{error}</p>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full mt-1" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          {/* Sign in link */}
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '12px',
            color: 'var(--foreground-subtle)', opacity: 0.5,
            textAlign: 'center', marginTop: '4px',
          }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', opacity: 1 }} className="hover:underline">
              Sign in
            </Link>
          </p>

        </CardContent>
      </Card>

      <p className="animate-fade-in-soft delay-300" style={{
        fontFamily: 'var(--font-ui)', fontSize: '11px',
        color: 'var(--foreground-subtle)', opacity: 0.28,
        textAlign: 'center', marginTop: '1.5rem', lineHeight: 1.6,
      }}>
        Your journal entries are private. We do not sell your data.
      </p>
    </main>
  )
}
