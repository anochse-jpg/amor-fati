'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createClient()
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/morning'

    async function handleCallback() {
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data.user) {
          const onboarded = data.user.user_metadata?.onboarding_completed
          const destination = next !== '/morning' ? next : (onboarded ? '/morning' : '/onboarding')
          router.replace(destination)
          return
        }
      }

      // Fallback: check if a session already exists
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const onboarded = session.user?.user_metadata?.onboarding_completed
        router.replace(onboarded ? '/morning' : '/onboarding')
        return
      }

      router.replace('/login?error=oauth')
    }

    handleCallback()
  }, [router, searchParams])

  return null
}

export default function AuthCallbackPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '12px',
        letterSpacing: '0.12em',
        color: 'var(--foreground-subtle)',
        opacity: 0.45,
        textTransform: 'uppercase',
      }}>
        Signing in…
      </p>
      <Suspense>
        <AuthCallbackInner />
      </Suspense>
    </main>
  )
}
