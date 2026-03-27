import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/auth/callback', '/privacy', '/terms', '/how-it-works', '/onboarding']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith('/auth/') || pathname.startsWith('/api/'))

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Use getSession() — reads and validates the JWT from cookies locally.
  // This is the correct approach for proxy/middleware: no extra network call
  // to Supabase on every request (getUser() makes a live API call which can
  // fail or time out, causing valid sessions to appear as unauthenticated).
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  // Public routes — always allow through, regardless of auth status
  if (isPublic) {
    // Only redirect: authenticated users on login/signup → send to /morning
    if (user && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/home', request.url))
    }
    return response
  }

  // Protected routes — require authentication
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and Next.js internals
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
