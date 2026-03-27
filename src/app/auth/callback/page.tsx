'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const next = searchParams.get('next')

    if (!code) {
      router.replace('/login?error=oauth&msg=no-code')
      return
    }

    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
      if (error || !data.user) {
        router.replace(`/login?error=oauth&msg=${encodeURIComponent(error?.message ?? 'unknown')}`)
        return
      }
      const onboarded = data.user.user_metadata?.onboarding_completed
      router.replace(next ?? (onboarded ? '/morning' : '/onboarding'))
    })
  }, [router, searchParams])

  return null
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  )
}
