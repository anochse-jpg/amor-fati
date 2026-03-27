import { createBrowserClient } from '@supabase/ssr'

// iOS Safari rejects fetch() calls with certain options (e.g. keepalive).
// This wrapper strips incompatible options so auth calls work on all browsers.
function safeFetch(input: RequestInfo | URL, init?: RequestInit) {
  const { keepalive: _k, ...rest } = init ?? {}
  return fetch(input, rest)
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: safeFetch } }
  )
}
