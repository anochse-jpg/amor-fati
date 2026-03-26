'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Lock, AlertCircle } from 'lucide-react'

// ─── Social logo SVGs ─────────────────────────────────────────────────────────

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


function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      <span style={{
        fontFamily: 'var(--font-ui)', fontSize: '10px',
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--foreground-subtle)', opacity: 0.5,
      }}>
        or
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function FieldWrapper({
  id, label, icon, children, focused,
}: {
  id: string; label: string; icon: React.ReactNode
  children: React.ReactNode; focused: boolean
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  )
}

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const oauthError = searchParams.get('error') === 'oauth'
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [remember, setRemember]   = useState(false)
  const [error, setError]         = useState(oauthError ? 'Sign-in failed. Please try again.' : '')
  const [loading, setLoading]     = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)

  // Forgot password
  const [forgotMode, setForgotMode]     = useState(false)
  const [resetEmail, setResetEmail]     = useState('')
  const [resetSent, setResetSent]       = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  // Focus tracking
  const [focused, setFocused] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    const { data: { user } } = await supabase.auth.getUser()
    const onboarded = user?.user_metadata?.onboarding_completed
    router.push(onboarded ? '/morning' : '/onboarding')
    router.refresh()
  }

  async function handleOAuth(provider: 'google') {
    setOauthLoading(provider)
    const supabase = createClient()
    // Use NEXT_PUBLIC_SITE_URL if set (ensures the redirect URL matches exactly
    // what is registered in Supabase). Falls back to window.location.origin.
    const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? window.location.origin
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${base}/auth/callback` },
    })
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setResetLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    })
    setResetLoading(false)
    setResetSent(true)
  }

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
            {!forgotMode ? (
              <>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400, color: 'var(--foreground)', marginBottom: '4px' }}>
                  Welcome back
                </h1>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--foreground-subtle)', opacity: 0.55, letterSpacing: '0.04em' }}>
                  Continue your practice
                </p>
              </>
            ) : (
              <>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400, color: 'var(--foreground)', marginBottom: '4px' }}>
                  Reset password
                </h1>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--foreground-subtle)', opacity: 0.55, letterSpacing: '0.04em' }}>
                  We'll send you a reset link
                </p>
              </>
            )}
          </div>

          {/* Ornamental divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)', opacity: 0.3 }} />
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Social auth — always visible outside forgot mode */}
          {!forgotMode && (
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
                disabled
                style={{ opacity: 0.45 }}
              >
                <AppleIcon />
                <span style={{ fontFamily: 'var(--font-ui)' }}>Continue with Apple</span>
              </Button>
            </div>
          )}

          {!forgotMode && <OrDivider />}

          {forgotMode ? (
            /* ── Forgot password form ── */
            resetSent ? (
              <div style={{
                textAlign: 'center', padding: '16px',
                background: 'var(--accent-whisper)',
                border: '1px solid var(--accent-dim)',
                borderRadius: '10px',
              }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--foreground)', marginBottom: '6px' }}>
                  Check your inbox
                </p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--foreground-subtle)', lineHeight: 1.6 }}>
                  A reset link was sent to {resetEmail}
                </p>
                <button
                  onClick={() => { setForgotMode(false); setResetSent(false); setResetEmail('') }}
                  style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '12px' }}
                >
                  ← Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                <FieldWrapper id="reset-email" label="Email address" icon={<Mail size={16} />} focused={focused === 'reset-email'}>
                  <Input
                    id="reset-email" type="email" value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)} required
                    placeholder="you@example.com"
                    onFocus={() => setFocused('reset-email')}
                    onBlur={() => setFocused(null)}
                  />
                </FieldWrapper>
                <Button type="submit" size="lg" className="w-full" disabled={resetLoading}>
                  {resetLoading ? 'Sending…' : 'Send reset link'}
                </Button>
                <button
                  type="button"
                  onClick={() => setForgotMode(false)}
                  style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--foreground-subtle)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', opacity: 0.6 }}
                >
                  ← Back to sign in
                </button>
              </form>
            )
          ) : (
            /* ── Sign in form ── */
            <>
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                    placeholder="••••••••"
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                  />
                </FieldWrapper>

                {/* Remember me + forgot */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={remember}
                      onCheckedChange={v => setRemember(v === true)}
                    />
                    <label
                      htmlFor="remember"
                      style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--foreground-subtle)', cursor: 'pointer', opacity: 0.7 }}
                    >
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForgotMode(true)}
                    style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Forgot password?
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2" style={{ color: '#c0392b' }}>
                    <AlertCircle size={13} />
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px' }}>{error}</p>
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full mt-1" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>

            </>
          )}

          {/* Sign up link */}
          {!forgotMode && (
            <p style={{
              fontFamily: 'var(--font-ui)', fontSize: '12px',
              color: 'var(--foreground-subtle)', opacity: 0.5,
              textAlign: 'center', marginTop: '4px',
            }}>
              Don&apos;t have an account yet?{' '}
              <Link href="/signup" style={{ color: 'var(--accent)', textDecoration: 'none', opacity: 1 }} className="hover:underline">
                Create one
              </Link>
            </p>
          )}

        </CardContent>
      </Card>

      {/* Privacy note */}
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
