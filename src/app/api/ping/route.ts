import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({ pong: true, env: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗ missing',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗ missing',
  }})
}
