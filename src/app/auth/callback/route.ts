import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')

  // On Vercel, the real public hostname comes via x-forwarded-host
  const forwardedHost = request.headers.get('x-forwarded-host')
  const protocol = request.headers.get('x-forwarded-proto') ?? 'https'
  const origin = forwardedHost
    ? `${protocol}://${forwardedHost}`
    : requestUrl.origin

  if (code) {
    // Capture cookies that Supabase wants to set so we can attach them
    // directly to the redirect response (the only reliable way on Vercel)
    const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookies) {
            cookiesToSet.push(...cookies)
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const onboarded = data.user.user_metadata?.onboarding_completed
      const destination = next ?? (onboarded ? '/morning' : '/onboarding')
      const response = NextResponse.redirect(`${origin}${destination}`)

      // Set session cookies directly on the redirect response
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
      })

      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`)
}
