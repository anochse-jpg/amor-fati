import { redirect } from 'next/navigation'
import { LandingHero } from '@/components/ui/landing-hero'

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  if (params.code) {
    redirect(`/auth/callback?code=${params.code}`)
  }
  return (
    <main className="min-h-screen flex flex-col relative overflow-x-hidden">
      <LandingHero />
    </main>
  )
}
