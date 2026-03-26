import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Temporary debug endpoint — remove after diagnosing the auth issue.
// Visit /api/auth-debug after a sign-in attempt to see what's happening.
export async function GET(request: NextRequest) {
  const allCookies = request.cookies.getAll()
  const supabaseCookies = allCookies.filter(c => c.name.startsWith('sb-'))

  const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookies) { cookiesToSet.push(...cookies) },
      },
    }
  )

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  return NextResponse.json({
    url: request.url,
    headers: {
      host: request.headers.get('host'),
      'x-forwarded-host': request.headers.get('x-forwarded-host'),
      'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
    },
    supabaseCookies: supabaseCookies.map(c => ({
      name: c.name,
      valueLength: c.value.length,
      preview: c.value.substring(0, 20) + '...',
    })),
    session: sessionData.session
      ? { userId: sessionData.session.user.id, email: sessionData.session.user.email, expiresAt: sessionData.session.expires_at }
      : null,
    sessionError: sessionError?.message ?? null,
    user: userData.user
      ? { id: userData.user.id, email: userData.user.email }
      : null,
    userError: userError?.message ?? null,
    env: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ set' : '✗ missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ set' : '✗ missing',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? '(not set — using window.location.origin)',
    },
  })
}
