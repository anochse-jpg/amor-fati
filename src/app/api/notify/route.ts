import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// ─── Email template ──────────────────────────────────────────────────────────

function buildEmailHtml(type: 'morning' | 'evening', time: string) {
  const isMorning = type === 'morning'

  const symbol = isMorning ? '◐' : '◑'
  const label = isMorning ? 'Morning Practice' : 'Evening Reflection'
  const heading = isMorning ? 'Begin with intention.' : 'Close the day with honesty.'
  const body = isMorning
    ? 'Your morning practice is waiting. A few minutes of reflection now will set the tone for everything that follows.'
    : 'The day is drawing to a close. Take a moment to examine it — what went well, what you can learn, how you truly feel.'
  const quote = isMorning
    ? { text: 'Waste no more time arguing what a good man should be. Be one.', author: 'Marcus Aurelius' }
    : { text: 'We should every night call ourselves to an account: what infirmity have I mastered today?', author: 'Seneca' }
  const cta = isMorning ? 'Begin Morning Practice' : 'Begin Evening Reflection'
  const href = isMorning
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://amorfati.app'}/morning`
    : `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://amorfati.app'}/evening`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${label} — Amor Fati</title>
</head>
<body style="margin:0;padding:0;background:#0b0c0e;font-family:'Georgia',serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="background:#0b0c0e;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:480px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;border-bottom:1px solid #252318;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td>
                    <p style="margin:0;font-family:'Georgia',serif;font-size:11px;
                      letter-spacing:0.2em;text-transform:uppercase;color:#c8956a;opacity:0.7;">
                      Amor Fati
                    </p>
                  </td>
                  <td align="right">
                    <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;
                      letter-spacing:0.1em;color:#524839;">
                      ${time}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Symbol + Label -->
          <tr>
            <td style="padding-top:32px;padding-bottom:8px;">
              <p style="margin:0;font-family:'Georgia',serif;font-size:28px;
                color:#c8956a;opacity:0.6;line-height:1;">
                ${symbol}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:4px;">
              <p style="margin:0;font-family:'Courier New',monospace;font-size:9px;
                letter-spacing:0.22em;text-transform:uppercase;color:#c8956a;opacity:0.55;">
                ${label}
              </p>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td style="padding-bottom:20px;">
              <h1 style="margin:0;font-family:'Georgia',serif;font-size:32px;
                font-weight:300;color:#ede7da;line-height:1.2;letter-spacing:-0.01em;">
                ${heading}
              </h1>
            </td>
          </tr>

          <!-- Body text -->
          <tr>
            <td style="padding-bottom:28px;">
              <p style="margin:0;font-family:'Georgia',serif;font-size:15px;
                color:#9e9280;line-height:1.75;font-weight:300;">
                ${body}
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding-bottom:32px;">
              <a href="${href}"
                style="display:inline-block;background:#c8956a;color:#0c0b0a;
                  font-family:'Courier New',monospace;font-size:11px;
                  letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;
                  padding:14px 28px;border-radius:4px;font-weight:500;">
                ${cta}
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom:28px;border-top:1px solid #252318;"></td>
          </tr>

          <!-- Quote -->
          <tr>
            <td style="padding-bottom:32px;border-left:1.5px solid #524839;padding-left:16px;">
              <p style="margin:0 0 6px;font-family:'Georgia',serif;font-style:italic;
                font-size:13px;color:#9e9280;line-height:1.8;font-weight:300;">
                &ldquo;${quote.text}&rdquo;
              </p>
              <p style="margin:0;font-family:'Courier New',monospace;font-size:9px;
                letter-spacing:0.16em;text-transform:uppercase;color:#c8956a;opacity:0.55;">
                — ${quote.author}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;border-top:1px solid #1a1914;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td>
                    <p style="margin:0;font-family:'Courier New',monospace;font-size:9px;
                      letter-spacing:0.12em;color:#524839;opacity:0.6;">
                      Amor Fati — A Stoic Daily Practice
                    </p>
                  </td>
                  <td align="right">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://amorfati.app'}/settings"
                      style="font-family:'Courier New',monospace;font-size:9px;
                        letter-spacing:0.12em;color:#524839;opacity:0.5;text-decoration:none;">
                      Manage reminders
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 503 })
  }
  const resend = new Resend(process.env.RESEND_API_KEY)

  const body = await req.json().catch(() => null)
  if (!body?.email || !body?.type) {
    return NextResponse.json({ error: 'Missing email or type' }, { status: 400 })
  }

  const { email, type } = body as { email: string; type: 'morning' | 'evening' }
  if (type !== 'morning' && type !== 'evening') {
    return NextResponse.json({ error: 'type must be morning or evening' }, { status: 400 })
  }

  const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const subject = type === 'morning'
    ? `◐ Your morning practice — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
    : `◑ Evening reflection — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'Amor Fati <onboarding@resend.dev>',
    to: email,
    subject,
    html: buildEmailHtml(type, now),
  })

  if (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data?.id, ok: true })
}
