import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/auth/callback', '/privacy', '/terms', '/how-it-works', '/onboarding']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith('/auth/'))

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

  let session = null
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      // Invalid/expired refresh token — clear all auth cookies so the client
      // starts fresh rather than looping on failed token refreshes
      const cleared = NextResponse.redirect(new URL('/login', request.url))
      request.cookies.getAll()
        .filter(c => c.name.startsWith('sb-'))
        .forEach(c => cleared.cookies.delete(c.name))
      return cleared
    }
    session = data.session
  } catch {
    // Network or unexpected error — let the request through
  }

  // Redirect unauthenticated users away from protected routes
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (session && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/morning', request.url))
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
