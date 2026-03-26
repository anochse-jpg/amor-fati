import Link from 'next/link'
import { Shield } from 'lucide-react'

const EFFECTIVE_DATE = 'March 26, 2026'
const CONTACT_EMAIL  = 'privacy@amorfati.app'

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Back */}
        <Link
          href="/settings"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-ui)', fontSize: '11px', letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--foreground-subtle)',
            textDecoration: 'none', opacity: 0.65, marginBottom: '40px',
          }}
        >
          ← Settings
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Shield size={20} style={{ color: 'var(--accent)' }} />
            <span style={{
              fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.22em',
              textTransform: 'uppercase', color: 'var(--accent)', opacity: 0.85,
            }}>
              Legal
            </span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '2.5rem',
            fontWeight: 300, color: 'var(--foreground)', marginBottom: '8px',
            letterSpacing: '-0.02em',
          }}>
            Privacy Policy
          </h1>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '12px',
            color: 'var(--foreground-subtle)', opacity: 0.6,
          }}>
            Effective {EFFECTIVE_DATE}
          </p>
        </div>

        <PolicyContent />

        {/* Footer */}
        <div style={{
          marginTop: '48px', paddingTop: '24px',
          borderTop: '1px solid var(--border)',
        }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: '0.9rem', color: 'var(--foreground-subtle)', lineHeight: 1.7,
            marginBottom: '16px',
          }}>
            Questions about this policy? We&apos;re a small team and we genuinely care about your privacy.
            Reach out any time.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            style={{
              fontFamily: 'var(--font-ui)', fontSize: '12px',
              color: 'var(--accent)', textDecoration: 'none', letterSpacing: '0.04em',
            }}
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </main>
  )
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: 'var(--font-display)', fontSize: '1.35rem',
      fontWeight: 400, color: 'var(--foreground)',
      marginTop: '40px', marginBottom: '12px', letterSpacing: '-0.01em',
    }}>
      {children}
    </h2>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-display)', fontSize: '1rem',
      fontWeight: 300, color: 'var(--foreground-muted)',
      lineHeight: 1.8, marginBottom: '14px',
    }}>
      {children}
    </p>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li style={{
      fontFamily: 'var(--font-display)', fontSize: '1rem',
      fontWeight: 300, color: 'var(--foreground-muted)',
      lineHeight: 1.8, marginBottom: '6px',
      paddingLeft: '4px',
    }}>
      {children}
    </li>
  )
}

function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul style={{ paddingLeft: '20px', marginBottom: '16px', listStyleType: 'disc' }}>
      {children}
    </ul>
  )
}

function PolicyContent() {
  return (
    <div>

      <P>
        Amor Fati (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is a journaling application grounded
        in Stoic philosophy. We built this product because we believe in the power of quiet, private reflection.
        That commitment extends to how we handle your data: your journal entries are yours alone, and we
        treat them with the same discretion you extend to your own inner life.
      </P>

      <P>
        This Privacy Policy describes what information we collect, how we use it, and the choices you have
        regarding your data. It applies to all users of the Amor Fati web application.
      </P>

      <H2>1. Information we collect</H2>
      <P>
        We collect only what is necessary to provide the service.
      </P>
      <P><strong style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Account information</strong></P>
      <Ul>
        <Li>Email address — used for authentication and, if enabled, reminder emails.</Li>
        <Li>Password — hashed using industry-standard cryptography (bcrypt). We never store or see your plain-text password.</Li>
        <Li>Display name — optional, set by you in settings.</Li>
        <Li>Account creation date and last sign-in timestamp.</Li>
      </Ul>
      <P><strong style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Journal entries</strong></P>
      <Ul>
        <Li>The text you write in response to morning and evening prompts.</Li>
        <Li>Mood scores you submit (numeric, 1–5).</Li>
        <Li>Entry dates and session types (morning / evening).</Li>
      </Ul>
      <P><strong style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Usage and preferences</strong></P>
      <Ul>
        <Li>Theme preference (light / dark), stored locally on your device.</Li>
        <Li>Notification preferences (browser push and email reminders), stored locally and in your account metadata.</Li>
      </Ul>
      <P><strong style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Technical data</strong></P>
      <Ul>
        <Li>Browser type, device type, and operating system — collected automatically by our infrastructure provider for security and debugging.</Li>
        <Li>IP address — retained for a limited period for fraud prevention. We do not use IP addresses to build profiles.</Li>
        <Li>Service worker and local storage data — stored on your device to support offline reminders and theme persistence.</Li>
      </Ul>

      <H2>2. How we use your information</H2>
      <Ul>
        <Li><strong>To operate the service</strong> — storing and retrieving your journal entries when you log in.</Li>
        <Li><strong>To send reminders</strong> — if you enable email or browser push reminders, we use your email address and stored preferences to deliver them.</Li>
        <Li><strong>To authenticate you</strong> — verifying your identity when you sign in.</Li>
        <Li><strong>To improve the product</strong> — aggregated, anonymised usage patterns (e.g. how many entries are saved per day) may inform product decisions. We never analyse the content of your journal entries for any purpose.</Li>
        <Li><strong>To comply with legal obligations</strong> — we may retain or disclose data when required by applicable law.</Li>
      </Ul>
      <P>
        We do <em>not</em> sell, rent, or share your personal data — including your journal entries — with
        third parties for advertising, analytics, or any commercial purpose.
      </P>

      <H2>3. Data storage and security</H2>
      <P>
        Your data is stored on servers operated by Supabase, Inc., a PostgreSQL-based cloud platform with
        servers in the United States. Data is encrypted at rest (AES-256) and in transit (TLS 1.2+).
      </P>
      <P>
        We implement access controls so that only your account can read your journal entries.
        No Amor Fati team member can read the content of your journals in the ordinary course of
        operations; access would require deliberate and audited administrative action.
      </P>
      <P>
        Despite these safeguards, no system is perfectly secure. We encourage you to use a strong, unique
        password and to keep your device secure.
      </P>

      <H2>4. Cookies and local storage</H2>
      <P>
        We use a session cookie to keep you signed in. We do not use advertising cookies, tracking pixels,
        or third-party analytics cookies.
      </P>
      <P>
        We use your browser&apos;s local storage to save theme preferences and notification settings on your
        device. This data never leaves your device unless you explicitly change a setting that syncs it to
        your account.
      </P>

      <H2>5. Your rights</H2>
      <P>
        Depending on where you live, you may have the following rights regarding your personal data:
      </P>
      <Ul>
        <Li><strong>Access</strong> — request a copy of the personal data we hold about you.</Li>
        <Li><strong>Export</strong> — export all your journal entries at any time from Settings → Data → Export journal.</Li>
        <Li><strong>Correction</strong> — update your display name, email, or password in Settings → Profile.</Li>
        <Li><strong>Deletion</strong> — delete all your data and close your account from Settings → Account → Delete account. This is immediate and irreversible.</Li>
        <Li><strong>Restriction / objection</strong> — contact us to restrict certain processing of your data.</Li>
        <Li><strong>Portability</strong> — export your journal in a human-readable format (PDF) at any time.</Li>
      </Ul>
      <P>
        If you are located in the European Economic Area (EEA) or the United Kingdom, these rights are
        guaranteed under the GDPR (EU) 2016/679 and UK GDPR respectively. If you are in California, you
        have rights under the California Consumer Privacy Act (CCPA), including the right to know, the right
        to delete, and the right to opt out of sale (we do not sell personal information).
      </P>
      <P>
        To exercise any of these rights, email us at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
          {CONTACT_EMAIL}
        </a>
        . We will respond within 30 days.
      </P>

      <H2>6. Data retention</H2>
      <P>
        We retain your account data and journal entries for as long as your account is active.
        If you delete your account, all associated data is deleted from our primary database immediately.
        Backups may retain a copy for up to 30 days, after which it is permanently purged.
      </P>

      <H2>7. Children&apos;s privacy</H2>
      <P>
        Amor Fati is not intended for children under the age of 13 (or 16 in the EEA). We do not
        knowingly collect personal information from children. If you believe a child has created an account,
        please contact us and we will delete it promptly.
      </P>

      <H2>8. Third-party services</H2>
      <P>
        We use the following third-party services to operate the platform:
      </P>
      <Ul>
        <Li><strong>Supabase</strong> — database, authentication, and storage. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Privacy policy</a>.</Li>
        <Li><strong>Google Fonts</strong> — fonts loaded at page render (Cormorant Garamond, Jost, DM Mono). Google may log the request. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Privacy policy</a>.</Li>
        <Li><strong>Cloudflare CDN</strong> — used for Three.js script delivery. <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Privacy policy</a>.</Li>
      </Ul>
      <P>
        We do not use advertising networks, social media trackers, or behavioural analytics services.
      </P>

      <H2>9. International transfers</H2>
      <P>
        Our infrastructure is currently based in the United States. If you access Amor Fati from outside
        the US, your data is transferred to and processed in the US. We rely on standard contractual
        clauses and Supabase&apos;s data processing agreements to ensure adequate protection for users in the
        EEA and UK.
      </P>

      <H2>10. Changes to this policy</H2>
      <P>
        We may update this Privacy Policy from time to time. When we make material changes, we will update
        the effective date at the top and, where required by law, notify you by email. Continued use of
        the service after such notice constitutes your acceptance of the revised policy.
      </P>

    </div>
  )
}
