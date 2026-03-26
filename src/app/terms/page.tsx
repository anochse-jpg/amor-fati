import Link from 'next/link'
import { FileText } from 'lucide-react'

const EFFECTIVE_DATE = 'March 26, 2026'
const CONTACT_EMAIL  = 'legal@amorfati.app'

export default function TermsPage() {
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
            <FileText size={20} style={{ color: 'var(--accent)' }} />
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
            Terms of Service
          </h1>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '12px',
            color: 'var(--foreground-subtle)', opacity: 0.6,
          }}>
            Effective {EFFECTIVE_DATE}
          </p>
        </div>

        <TermsContent />

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
            If you have questions about these Terms, please get in touch before using the service.
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
      lineHeight: 1.8, marginBottom: '6px', paddingLeft: '4px',
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

function TermsContent() {
  return (
    <div>

      <P>
        Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using Amor Fati
        (the &ldquo;Service&rdquo;). By creating an account or using the Service, you agree to be bound
        by these Terms. If you do not agree, do not use the Service.
      </P>
      <P>
        These Terms constitute a legally binding agreement between you and Amor Fati
        (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;).
      </P>

      <H2>1. The service</H2>
      <P>
        Amor Fati is a private journaling application designed to support daily Stoic reflection. The
        Service includes a web application that allows you to write morning and evening journal entries,
        track your practice, and receive optional reminders.
      </P>
      <P>
        The Service is offered for personal, non-commercial use only. You may not use it on behalf of a
        business, organisation, or other entity without our prior written consent.
      </P>

      <H2>2. Eligibility</H2>
      <P>
        You must be at least 13 years of age (or 16 years of age if you are in the European Economic Area)
        to use the Service. By using the Service, you represent that you meet this requirement.
      </P>

      <H2>3. Account registration</H2>
      <P>
        To use the Service, you must register with a valid email address and password. You are responsible for:
      </P>
      <Ul>
        <Li>Keeping your password confidential.</Li>
        <Li>All activity that occurs under your account.</Li>
        <Li>Notifying us immediately if you suspect unauthorised access to your account.</Li>
      </Ul>
      <P>
        You may not share your account with others or create accounts on behalf of third parties.
      </P>

      <H2>4. Your content</H2>
      <P>
        You retain full ownership of all text, reflections, and other content you create within the Service
        (&ldquo;Your Content&rdquo;). We claim no intellectual property rights over Your Content.
      </P>
      <P>
        By storing Your Content on our infrastructure, you grant us a limited, non-exclusive, royalty-free
        licence to store, process, and retrieve it solely for the purpose of providing the Service to you.
        We do not use Your Content for any other purpose, including training machine learning models or
        displaying it to other users.
      </P>
      <P>
        You are solely responsible for Your Content. You agree not to submit content that is unlawful,
        harmful to others, or that violates any third party&apos;s rights.
      </P>

      <H2>5. Acceptable use</H2>
      <P>
        You agree not to:
      </P>
      <Ul>
        <Li>Attempt to gain unauthorised access to the Service or its underlying infrastructure.</Li>
        <Li>Reverse-engineer, decompile, or otherwise attempt to extract the source code of the Service.</Li>
        <Li>Use automated scripts, bots, or scrapers to interact with the Service.</Li>
        <Li>Interfere with the performance or availability of the Service for other users.</Li>
        <Li>Use the Service in any way that violates applicable local, national, or international law.</Li>
      </Ul>

      <H2>6. Not a medical or therapeutic service</H2>
      <P>
        Amor Fati is a personal journaling tool. It is not a substitute for professional medical advice,
        diagnosis, or treatment — including mental health treatment. If you are experiencing a mental health
        crisis, please contact a qualified healthcare professional or emergency services immediately.
      </P>
      <P>
        Nothing in the Service constitutes medical, psychological, therapeutic, or legal advice.
      </P>

      <H2>7. Subscriptions and payment</H2>
      <P>
        The Service is currently available at no cost. We may introduce paid plans in the future. If we do,
        we will provide advance notice and these Terms will be updated to reflect billing terms, refund
        policies, and cancellation procedures.
      </P>

      <H2>8. Intellectual property</H2>
      <P>
        The Service — including its design, code, prompts, and all content we created — is owned by Amor Fati
        and protected by copyright, trademark, and other intellectual property laws. You may not copy,
        reproduce, or create derivative works from any part of the Service without our prior written consent.
      </P>
      <P>
        The name &ldquo;Amor Fati&rdquo; as used in this context, and all associated logos and marks, are
        our trademarks. The underlying Latin phrase and Stoic philosophical concept are, of course, part
        of the public domain and the common human inheritance.
      </P>

      <H2>9. Privacy</H2>
      <P>
        Our collection and use of personal information is governed by our{' '}
        <Link href="/privacy" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
          Privacy Policy
        </Link>
        , which is incorporated into these Terms by reference.
      </P>

      <H2>10. Disclaimer of warranties</H2>
      <P>
        The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of
        any kind, either express or implied, including but not limited to implied warranties of
        merchantability, fitness for a particular purpose, and non-infringement.
      </P>
      <P>
        We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components.
        We do not warrant that any errors will be corrected or that the Service will meet your requirements.
      </P>

      <H2>11. Limitation of liability</H2>
      <P>
        To the fullest extent permitted by applicable law, Amor Fati and its owners, employees, and
        affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive
        damages arising out of or relating to your use of — or inability to use — the Service, even if we
        have been advised of the possibility of such damages.
      </P>
      <P>
        In no event shall our total liability to you exceed the greater of (a) the amount you paid us in
        the 12 months preceding the claim, or (b) USD $50.
      </P>
      <P>
        Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability
        for certain damages. In such jurisdictions, our liability is limited to the maximum extent
        permitted by law.
      </P>

      <H2>12. Indemnification</H2>
      <P>
        You agree to defend, indemnify, and hold harmless Amor Fati and its owners, employees, and
        affiliates from any claims, damages, losses, and expenses (including reasonable legal fees) arising
        from your use of the Service, your content, or your violation of these Terms.
      </P>

      <H2>13. Termination</H2>
      <P>
        You may terminate your account at any time from Settings → Account → Delete account. Deletion is
        immediate and removes all your data from our systems (subject to backup retention described in our
        Privacy Policy).
      </P>
      <P>
        We reserve the right to suspend or terminate your access to the Service at any time, with or without
        notice, if we believe you have violated these Terms or if we discontinue the Service. Where practical,
        we will notify you and give you an opportunity to export your data before termination.
      </P>

      <H2>14. Governing law and disputes</H2>
      <P>
        These Terms are governed by and construed in accordance with the laws of the State of Delaware,
        United States, without regard to conflict-of-law principles.
      </P>
      <P>
        Any dispute arising under these Terms shall first be addressed through good-faith negotiation.
        If unresolved, disputes shall be submitted to binding arbitration under the rules of the American
        Arbitration Association, conducted in English. You waive any right to participate in a class action
        or class-wide arbitration.
      </P>
      <P>
        If you are based in the European Union, you also have the right to raise a dispute with your local
        data protection authority regarding our handling of your personal data.
      </P>

      <H2>15. Changes to these Terms</H2>
      <P>
        We may update these Terms from time to time. When we make material changes, we will update the
        effective date above and, where required by law, notify you by email at least 30 days before
        the changes take effect. Your continued use of the Service after that date constitutes your
        acceptance of the revised Terms.
      </P>

      <H2>16. Contact</H2>
      <P>
        If you have questions or concerns about these Terms, please contact us at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
          {CONTACT_EMAIL}
        </a>
        .
      </P>

    </div>
  )
}
