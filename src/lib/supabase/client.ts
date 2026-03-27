import { createBrowserClient } from '@supabase/ssr'

// iOS Safari rejects fetch() calls with certain options (e.g. keepalive).
// This wrapper strips incompatible options so auth calls work on all browsers.
function safeFetch(input: RequestInfo | URL, init?: RequestInit) {
  const { keepalive: _k, ...rest } = init ?? {}
  return fetch(input, rest)
}

export function createClient() {
  // Trim to guard against accidental whitespace/newlines in env vars,
  // which cause fetch to throw "Invalid value" when used in headers or URLs.
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim().replace(/\/$/, '')
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()

  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then redeploy.'
    )
  }

  return createBrowserClient(url, key, { global: { fetch: safeFetch } })
}
