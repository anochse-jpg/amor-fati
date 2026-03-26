'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Nav } from '@/components/ui'
import { useTheme } from '@/components/ThemeProvider'
import { JolyButton } from '@/components/ui/joly-button'
import {
  Moon, Sun, Bell, BellOff, Download, LogOut, Trash2,
  Shield, FileText, ChevronRight, Check, Edit2,
  Mail, Key, Calendar, ChevronDown, AlertTriangle,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotifPrefs {
  morningEnabled: boolean
  morningTime: string
  eveningEnabled: boolean
  eveningTime: string
  emailMorningEnabled: boolean
  emailEveningEnabled: boolean
}

const DEFAULT_PREFS: NotifPrefs = {
  morningEnabled: false,
  morningTime: '07:00',
  eveningEnabled: false,
  eveningTime: '20:30',
  emailMorningEnabled: false,
  emailEveningEnabled: false,
}

interface Stats {
  total: number
  streak: number
  lastDate: string | null
}

// ─── Streak tier system ───────────────────────────────────────────────────────

function getStreakTier(streak: number) {
  if (streak === 0)  return { symbol: '',   label: '',              next: 1,    progress: 0 }
  if (streak < 7)    return { symbol: '◦',  label: 'Seeker',        next: 7,    progress: streak / 7 }
  if (streak < 30)   return { symbol: '◉',  label: 'Practitioner',  next: 30,   progress: (streak - 7) / 23 }
  if (streak < 90)   return { symbol: '◈',  label: 'Philosopher',   next: 90,   progress: (streak - 30) / 60 }
  return                    { symbol: '✦',  label: 'Sage',          next: null, progress: 1 }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime12h(t: string) {
  const [hStr, mStr] = t.split(':')
  let h = parseInt(hStr, 10)
  const m = mStr ?? '00'
  const period = h >= 12 ? 'PM' : 'AM'
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  return `${h}:${m} ${period}`
}

function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const unique = [...new Set(dates)].sort().reverse()
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (unique[0] !== today && unique[0] !== yesterday) return 0
  let streak = 1
  for (let i = 1; i < unique.length; i++) {
    const a = new Date(unique[i - 1]).getTime()
    const b = new Date(unique[i]).getTime()
    if ((a - b) / 86400000 === 1) streak++
    else break
  }
  return streak
}

function formatMemberSince(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function sendPrefsToSW(prefs: NotifPrefs) {
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker.ready.then(reg => {
    reg.active?.postMessage({ type: 'SET_NOTIFICATION_PREFS', prefs })
  })
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

function exportToPDF(entries: Record<string, unknown>[], userEmail: string) {
  const formatEntry = (e: Record<string, unknown>) => {
    const content = e.content as Record<string, string> | null
    const date = new Date(e.entry_date as string).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
    const type = (e.type as string) === 'morning' ? 'Morning Practice' : 'Evening Reflection'
    const moodStr = e.mood_score != null ? `<p class="mood">Mood · ${e.mood_score}/5</p>` : ''

    const fields = content ? Object.entries(content)
      .filter(([k]) => k !== 'mood_note')
      .map(([k, v]) => `
        <div class="field">
          <p class="field-label">${k.charAt(0).toUpperCase() + k.slice(1)}</p>
          <p class="field-value">${v ?? ''}</p>
        </div>
      `).join('') : ''

    const moodNote = content?.mood_note ? `<div class="field"><p class="field-label">Note</p><p class="field-value">${content.mood_note}</p></div>` : ''

    return `
      <div class="entry">
        <div class="entry-header">
          <span class="entry-type">${type}</span>
          <span class="entry-date">${date}</span>
        </div>
        ${moodStr}
        ${fields}
        ${moodNote}
      </div>
    `
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Amor Fati — Journal</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Cormorant Garamond', Georgia, serif;
    color: #1a130a;
    background: #fff;
    padding: 48px;
    max-width: 720px;
    margin: 0 auto;
    line-height: 1.7;
  }
  .cover { text-align: center; padding: 80px 0 60px; border-bottom: 1px solid #cbbfa8; margin-bottom: 48px; }
  .cover-symbol { font-size: 2rem; color: #a85e28; margin-bottom: 16px; }
  .cover h1 { font-size: 3.5rem; font-weight: 300; letter-spacing: -0.02em; color: #1a130a; margin-bottom: 6px; }
  .cover h2 { font-size: 1.1rem; font-style: italic; font-weight: 300; color: #5e4e3a; margin-bottom: 24px; }
  .cover-meta { font-family: 'Jost', sans-serif; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #8a7560; }
  .entry { padding: 32px 0; border-bottom: 1px solid #e8e0d4; break-inside: avoid; }
  .entry:last-child { border-bottom: none; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
  .entry-type { font-family: 'Jost', sans-serif; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #a85e28; }
  .entry-date { font-size: 0.85rem; font-style: italic; color: #5e4e3a; }
  .mood { font-family: 'Jost', sans-serif; font-size: 10px; letter-spacing: 0.12em; color: #8a7560; margin-bottom: 16px; text-transform: uppercase; }
  .field { margin-bottom: 20px; }
  .field-label { font-family: 'Jost', sans-serif; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: #a85e28; opacity: 0.8; margin-bottom: 4px; }
  .field-value { font-size: 1rem; font-weight: 300; color: #2a1e12; line-height: 1.8; white-space: pre-wrap; }
  .footer { margin-top: 48px; text-align: center; font-family: 'Jost', sans-serif; font-size: 10px; letter-spacing: 0.15em; color: #8a7560; opacity: 0.6; text-transform: uppercase; }
  @media print { body { padding: 24px; } .cover { padding: 40px 0 40px; } }
</style>
</head>
<body>
<div class="cover">
  <div class="cover-symbol">∞</div>
  <h1>Amor Fati</h1>
  <h2>Love of Fate</h2>
  <p class="cover-meta">
    Journal export &nbsp;·&nbsp; ${entries.length} entries &nbsp;·&nbsp; ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
  </p>
</div>
${entries.map(e => formatEntry(e)).join('\n')}
<div class="footer">Amor Fati — A Stoic Daily Practice</div>
</body>
</html>`

  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => { w.print() }, 600)
}

// ─── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <p style={{
      fontFamily: 'var(--font-ui)', fontSize: '9px', letterSpacing: '0.22em',
      color: 'var(--foreground-subtle)', textTransform: 'uppercase',
      marginBottom: '0.6rem', opacity: 0.7,
    }}>
      {label}
    </p>
  )
}

// ─── Card wrapper ──────────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: '12px', overflow: 'hidden',
    }}>
      {children}
    </div>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function Row({
  icon, label, value, onClick, danger, last, toggle, checked, sublabel,
}: {
  icon?: React.ReactNode
  label: string
  sublabel?: string
  value?: string
  onClick?: () => void
  danger?: boolean
  last?: boolean
  toggle?: boolean
  checked?: boolean
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 16px',
        borderBottom: last ? 'none' : '1px solid var(--border)',
        cursor: onClick ? 'pointer' : 'default', transition: 'background 0.15s',
      }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLElement).style.background = 'var(--muted)' }}
      onMouseLeave={e => { if (onClick) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      {icon && (
        <span style={{ color: danger ? '#c0392b' : 'var(--foreground-subtle)', flexShrink: 0 }}>
          {icon}
        </span>
      )}
      <div style={{ flex: 1 }}>
        <span style={{
          fontFamily: 'var(--font-ui)', fontSize: '13px',
          color: danger ? '#c0392b' : 'var(--foreground)',
          display: 'block',
        }}>
          {label}
        </span>
        {sublabel && (
          <span style={{
            fontFamily: 'var(--font-ui)', fontSize: '10px',
            color: 'var(--foreground-subtle)', opacity: 0.6, display: 'block',
          }}>
            {sublabel}
          </span>
        )}
      </div>
      {toggle && (
        <div style={{
          width: '44px', height: '24px', borderRadius: '12px',
          background: checked ? 'var(--accent)' : 'var(--muted-deep)',
          border: '1px solid var(--border)',
          position: 'relative', transition: 'all 0.25s ease', flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute', top: '3px',
            left: checked ? '22px' : '3px',
            width: '16px', height: '16px', borderRadius: '50%',
            background: checked ? '#fff' : 'var(--foreground-subtle)',
            transition: 'left 0.25s ease',
          }} />
        </div>
      )}
      {value && !toggle && (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          color: 'var(--foreground-subtle)', opacity: 0.7,
        }}>
          {value}
        </span>
      )}
      {onClick && !toggle && (
        <ChevronRight size={14} style={{ color: 'var(--foreground-subtle)', opacity: 0.4 }} />
      )}
    </div>
  )
}

// ─── Reminder row ─────────────────────────────────────────────────────────────

function ReminderRow({
  label, symbol, enabled, time, browserOn, emailOn,
  onToggle, onTimeChange, onBrowserToggle, onEmailToggle, last,
}: {
  label: string; symbol: string; enabled: boolean; time: string
  browserOn: boolean; emailOn: boolean
  onToggle: () => void; onTimeChange: (v: string) => void
  onBrowserToggle: () => void; onEmailToggle: () => void
  last?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div style={{ padding: '14px 16px', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      {/* Top row: symbol + label + toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{
          color: enabled ? 'var(--accent)' : 'var(--foreground-subtle)',
          fontSize: '16px', flexShrink: 0, transition: 'color 0.25s',
        }}>
          {symbol}
        </span>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--foreground)', flex: 1 }}>
          {label}
        </p>
        <div
          onClick={onToggle}
          style={{
            width: '44px', height: '24px', borderRadius: '12px',
            background: enabled ? 'var(--accent)' : 'var(--muted-deep)',
            border: '1px solid var(--border)',
            position: 'relative', transition: 'all 0.25s ease', cursor: 'pointer', flexShrink: 0,
          }}
        >
          <div style={{
            position: 'absolute', top: '3px', left: enabled ? '22px' : '3px',
            width: '16px', height: '16px', borderRadius: '50%',
            background: enabled ? '#fff' : 'var(--foreground-subtle)',
            transition: 'left 0.25s ease',
          }} />
        </div>
      </div>

      {/* Expanded: time + channel chips */}
      {enabled && (
        <div style={{
          marginTop: '10px', marginLeft: '28px',
          display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
        }}>
          {/* Time picker trigger */}
          <button
            onClick={() => inputRef.current?.showPicker?.()}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent)',
              background: 'var(--accent-whisper)', border: '1px solid var(--accent-dim)',
              borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
              letterSpacing: '0.06em', transition: 'background 0.15s',
            }}
          >
            {formatTime12h(time)}
          </button>

          {/* Divider dot */}
          <span style={{ color: 'var(--border)', fontSize: '10px' }}>·</span>

          {/* Channel chips */}
          <button
            onClick={onBrowserToggle}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.1em',
              padding: '4px 10px', borderRadius: '20px', cursor: 'pointer',
              border: browserOn ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: browserOn ? 'var(--accent-whisper)' : 'transparent',
              color: browserOn ? 'var(--accent)' : 'var(--foreground-subtle)',
              transition: 'all 0.15s ease',
            }}
          >
            <Bell size={10} /> Browser
          </button>
          <button
            onClick={onEmailToggle}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.1em',
              padding: '4px 10px', borderRadius: '20px', cursor: 'pointer',
              border: emailOn ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: emailOn ? 'var(--accent-whisper)' : 'transparent',
              color: emailOn ? 'var(--accent)' : 'var(--foreground-subtle)',
              transition: 'all 0.15s ease',
            }}
          >
            <Mail size={10} /> Email
          </button>
        </div>
      )}

      <input
        ref={inputRef} type="time" value={time}
        onChange={e => onTimeChange(e.target.value)}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
      />
    </div>
  )
}

// ─── Confirm overlay ──────────────────────────────────────────────────────────

function ConfirmBanner({
  message, confirmLabel, onConfirm, onCancel, danger,
}: {
  message: string; confirmLabel: string
  onConfirm: () => void; onCancel: () => void; danger?: boolean
}) {
  return (
    <div style={{
      padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
      background: danger ? 'rgba(192,57,43,0.06)' : 'var(--muted)',
      borderTop: '1px solid var(--border)',
    }}>
      <p style={{ flex: 1, fontFamily: 'var(--font-ui)', fontSize: '12px', color: danger ? '#c0392b' : 'var(--foreground-muted)' }}>
        {message}
      </p>
      <JolyButton variant="outline" size="sm" onClick={onCancel}>
        Cancel
      </JolyButton>
      <JolyButton
        size="sm"
        onClick={onConfirm}
        style={danger ? { background: '#c0392b', boxShadow: '0 2px 12px rgba(192,57,43,0.3)' } : undefined}
      >
        {confirmLabel}
      </JolyButton>
    </div>
  )
}

// ─── Delete account modal ─────────────────────────────────────────────────────

function DeleteModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const [typed, setTyped] = useState('')
  const ready = typed === 'DELETE'
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '28px 24px', maxWidth: '360px', width: '100%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <AlertTriangle size={18} style={{ color: '#c0392b' }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.3rem',
            fontWeight: 400, color: 'var(--foreground)', marginBottom: '8px',
          }}>
            Delete account
          </h2>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: '12px',
            color: 'var(--foreground-subtle)', lineHeight: 1.6,
          }}>
            This permanently deletes all your journal entries and account data.
            This cannot be undone.
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.14em',
            color: 'var(--foreground-subtle)', textTransform: 'uppercase',
            opacity: 0.7, display: 'block', marginBottom: '6px',
          }}>
            Type DELETE to confirm
          </label>
          <input
            type="text"
            value={typed}
            onChange={e => setTyped(e.target.value.toUpperCase())}
            placeholder="DELETE"
            style={{
              width: '100%', background: 'var(--muted)',
              border: `1px solid ${ready ? '#c0392b' : 'var(--border)'}`,
              borderRadius: '6px', padding: '10px 12px',
              color: ready ? '#c0392b' : 'var(--foreground)',
              fontFamily: 'var(--font-mono)', fontSize: '13px',
              letterSpacing: '0.1em', outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <JolyButton variant="secondary" className="flex-1" onClick={onCancel}>
            Cancel
          </JolyButton>
          <JolyButton
            className="flex-1"
            disabled={!ready}
            onClick={onConfirm}
            style={ready ? { background: '#c0392b', boxShadow: '0 2px 16px rgba(192,57,43,0.35)' } : undefined}
          >
            Delete everything
          </JolyButton>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const [user, setUser] = useState<{ email: string; id: string; createdAt: string; displayName: string } | null>(null)
  const [stats, setStats] = useState<Stats>({ total: 0, streak: 0, lastDate: null })
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [prefsSaved, setPrefsSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  // Profile panel
  const [profileOpen, setProfileOpen] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)
  const [changePassword, setChangePassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // Confirmations
  const [signOutConfirm, setSignOutConfirm] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Export
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/login'); return }

      const displayNameStored = (u.user_metadata?.display_name as string | undefined) ?? ''
      setUser({ email: u.email ?? '', id: u.id, createdAt: u.created_at, displayName: displayNameStored })
      setDisplayName(displayNameStored)

      const { data: entries } = await supabase
        .from('journal_entries')
        .select('entry_date')
        .eq('user_id', u.id)
        .order('entry_date', { ascending: false })

      const dates = (entries ?? []).map((e: { entry_date: string }) => e.entry_date)
      setStats({ total: dates.length, streak: calcStreak(dates), lastDate: dates[0] ?? null })

      const stored = localStorage.getItem('amor-fati-notification-prefs')
      if (stored) { try { setPrefs(JSON.parse(stored)) } catch { /* ignore */ } }

      if ('Notification' in window) setPermission(Notification.permission)
      setLoading(false)
    }
    load()
  }, [router])

  function updatePref<K extends keyof NotifPrefs>(key: K, value: NotifPrefs[K]) {
    setPrefs(p => ({ ...p, [key]: value }))
    setPrefsSaved(false)
  }

  function savePrefs() {
    localStorage.setItem('amor-fati-notification-prefs', JSON.stringify(prefs))
    sendPrefsToSW(prefs)
    setPrefsSaved(true)
    setTimeout(() => setPrefsSaved(false), 2000)
  }

  async function requestPermission() {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  async function saveDisplayName() {
    if (!displayName.trim()) return
    setSavingName(true)
    const supabase = createClient()
    await supabase.auth.updateUser({ data: { display_name: displayName.trim() } })
    setSavingName(false)
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  async function savePassword() {
    setPasswordError('')
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters.'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return }
    setSavingPassword(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)
    if (error) { setPasswordError(error.message); return }
    setPasswordSaved(true)
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => { setPasswordSaved(false); setChangePassword(false) }, 2000)
  }

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleDelete() {
    setDeleting(true)
    const supabase = createClient()
    if (user) {
      await supabase.from('journal_entries').delete().eq('user_id', user.id)
    }
    await supabase.auth.signOut()
    router.push('/?deleted=1')
  }

  async function handleExport() {
    if (!user) return
    setExporting(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
    setExporting(false)
    exportToPDF((data ?? []) as Record<string, unknown>[], user.email)
  }

  const initials = user?.email ? user.email.split('@')[0].slice(0, 2).toUpperCase() : '—'
  const displayLabel = user?.displayName || user?.email?.split('@')[0] || ''
  const tier = getStreakTier(stats.streak)

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: 'var(--accent)', opacity: 0.4,
          animation: 'breathe 2s ease-in-out infinite',
        }} />
      </main>
    )
  }

  return (
    <>
      {deleteModalOpen && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setDeleteModalOpen(false)}
        />
      )}

      <main className="min-h-screen flex flex-col px-6 pb-28">
        <div className="max-w-lg mx-auto w-full pt-12">

          {/* Header */}
          <div className="mb-8 animate-fade-up">
            <p style={{
              fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.2em',
              color: 'var(--accent)', textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.25rem',
            }}>
              Amor Fati
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.75rem',
              fontWeight: 400, color: 'var(--foreground)',
            }}>
              Settings
            </h1>
          </div>

          {/* ── Profile ──────────────────────────────────────────────── */}
          <div className="animate-fade-up" style={{ marginBottom: '2rem' }}>
            <button
              onClick={() => setProfileOpen(o => !o)}
              style={{
                width: '100%', background: 'var(--card)',
                border: '1px solid var(--border)', borderRadius: profileOpen ? '12px 12px 0 0' : '12px',
                padding: '20px', display: 'flex', alignItems: 'center', gap: '16px',
                cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--muted)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--card)' }}
            >
              {/* Avatar */}
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--accent-dim), var(--accent-whisper))',
                border: '1px solid var(--accent-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '1.1rem',
                  color: 'var(--accent)', fontWeight: 500,
                }}>
                  {initials}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: 'var(--font-display)', fontSize: '1rem',
                  color: 'var(--foreground)', marginBottom: '2px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {displayLabel || user?.email}
                </p>
                <span style={{
                  display: 'inline-block', fontFamily: 'var(--font-ui)', fontSize: '9px',
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'var(--accent)', opacity: 0.75,
                  border: '1px solid var(--accent-dim)', borderRadius: '20px', padding: '2px 8px',
                }}>
                  Free practitioner
                </span>
              </div>
              <ChevronDown
                size={15}
                style={{
                  color: 'var(--foreground-subtle)', opacity: 0.5, flexShrink: 0,
                  transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                }}
              />
            </button>

            {/* Expanded profile panel */}
            {profileOpen && (
              <div style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderTop: 'none', borderRadius: '0 0 12px 12px',
                overflow: 'hidden',
              }}>
                {/* Member since */}
                <div style={{
                  padding: '14px 20px', borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  <Calendar size={14} style={{ color: 'var(--foreground-subtle)', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--foreground-subtle)', opacity: 0.6, marginBottom: '1px' }}>
                      Member since
                    </p>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--foreground)' }}>
                      {user?.createdAt ? formatMemberSince(user.createdAt) : '—'}
                    </p>
                  </div>
                </div>

                {/* Account email */}
                <div style={{
                  padding: '14px 20px', borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  <Mail size={14} style={{ color: 'var(--foreground-subtle)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--foreground-subtle)', opacity: 0.6, marginBottom: '1px' }}>
                      Email
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--foreground)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Display name */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Edit2 size={14} style={{ color: 'var(--foreground-subtle)', flexShrink: 0 }} />
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--foreground-subtle)', opacity: 0.6 }}>
                      Display name
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => { setDisplayName(e.target.value); setNameSaved(false) }}
                      placeholder="Your name"
                      style={{
                        flex: 1, background: 'var(--muted)', border: '1px solid var(--border)',
                        borderRadius: '6px', padding: '9px 12px',
                        color: 'var(--foreground)', fontFamily: 'var(--font-ui)', fontSize: '13px',
                        outline: 'none',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-dim)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                    />
                    <JolyButton
                      size="sm"
                      onClick={saveDisplayName}
                      disabled={savingName || nameSaved}
                      variant={nameSaved ? 'outline' : 'default'}
                    >
                      {nameSaved ? <><Check size={12} /> Saved</> : savingName ? '…' : 'Save'}
                    </JolyButton>
                  </div>
                </div>

                {/* Change password */}
                <div style={{ padding: '14px 20px' }}>
                  <button
                    onClick={() => { setChangePassword(o => !o); setPasswordError(''); setPasswordSaved(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                      background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <Key size={14} style={{ color: 'var(--foreground-subtle)', flexShrink: 0 }} />
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--foreground)', flex: 1 }}>
                      Change password
                    </p>
                    <ChevronDown
                      size={13}
                      style={{
                        color: 'var(--foreground-subtle)', opacity: 0.5,
                        transform: changePassword ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s',
                      }}
                    />
                  </button>

                  {changePassword && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="New password"
                        style={{
                          width: '100%', background: 'var(--muted)', border: '1px solid var(--border)',
                          borderRadius: '6px', padding: '9px 12px',
                          color: 'var(--foreground)', fontFamily: 'var(--font-ui)', fontSize: '13px', outline: 'none',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-dim)' }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        style={{
                          width: '100%', background: 'var(--muted)', border: '1px solid var(--border)',
                          borderRadius: '6px', padding: '9px 12px',
                          color: 'var(--foreground)', fontFamily: 'var(--font-ui)', fontSize: '13px', outline: 'none',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-dim)' }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                      />
                      {passwordError && (
                        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: '#c0392b' }}>
                          {passwordError}
                        </p>
                      )}
                      <JolyButton
                        className="w-full"
                        disabled={savingPassword || passwordSaved}
                        variant={passwordSaved ? 'outline' : 'default'}
                        onClick={savePassword}
                      >
                        {passwordSaved ? <><Check size={12} /> Password updated</> : savingPassword ? 'Saving…' : 'Update password'}
                      </JolyButton>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Appearance ──────────────────────────────────────────── */}
          <div className="animate-fade-up delay-100" style={{ marginBottom: '2rem' }}>
            <SectionLabel label="Appearance" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Dark card */}
              <button
                onClick={() => setTheme('dark')}
                style={{
                  background: 'var(--card)',
                  border: theme === 'dark' ? '2px solid var(--accent)' : '2px solid var(--border)',
                  borderRadius: '12px', padding: '16px', cursor: 'pointer',
                  textAlign: 'left', transition: 'all 0.2s', position: 'relative',
                }}
              >
                <div style={{
                  background: '#0b0c0e', borderRadius: '6px',
                  padding: '10px 10px 8px', marginBottom: '10px', border: '1px solid #252318',
                }}>
                  <div style={{ width: '60%', height: '3px', background: '#c8956a', borderRadius: '2px', marginBottom: '5px', opacity: 0.7 }} />
                  <div style={{ width: '90%', height: '2px', background: '#524839', borderRadius: '2px', marginBottom: '3px' }} />
                  <div style={{ width: '75%', height: '2px', background: '#524839', borderRadius: '2px', opacity: 0.6 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Moon size={13} style={{ color: 'var(--foreground-muted)', marginBottom: '3px' }} />
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--foreground)', fontWeight: 500 }}>Dark</p>
                  </div>
                  {theme === 'dark' && (
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%', background: 'var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={10} style={{ color: '#fff' }} />
                    </div>
                  )}
                </div>
              </button>

              {/* Light card */}
              <button
                onClick={() => setTheme('light')}
                style={{
                  background: 'var(--card)',
                  border: theme === 'light' ? '2px solid var(--accent)' : '2px solid var(--border)',
                  borderRadius: '12px', padding: '16px', cursor: 'pointer',
                  textAlign: 'left', transition: 'all 0.2s', position: 'relative',
                }}
              >
                <div style={{
                  background: '#f5efe6', borderRadius: '6px',
                  padding: '10px 10px 8px', marginBottom: '10px', border: '1px solid #cbbfa8',
                }}>
                  <div style={{ width: '60%', height: '3px', background: '#a85e28', borderRadius: '2px', marginBottom: '5px', opacity: 0.7 }} />
                  <div style={{ width: '90%', height: '2px', background: '#8a7560', borderRadius: '2px', marginBottom: '3px' }} />
                  <div style={{ width: '75%', height: '2px', background: '#8a7560', borderRadius: '2px', opacity: 0.6 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Sun size={13} style={{ color: 'var(--foreground-muted)', marginBottom: '3px' }} />
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--foreground)', fontWeight: 500 }}>Light</p>
                  </div>
                  {theme === 'light' && (
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%', background: 'var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={10} style={{ color: '#fff' }} />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* ── Reminders ───────────────────────────────────────────── */}
          <div className="animate-fade-up delay-200" style={{ marginBottom: '2rem' }}>
            <SectionLabel label="Reminders" />

            {permission === 'denied' && (
              <div style={{
                background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)',
                borderRadius: '8px', padding: '10px 14px', marginBottom: '10px',
                display: 'flex', gap: '10px', alignItems: 'center',
              }}>
                <BellOff size={13} style={{ color: '#c0392b', flexShrink: 0 }} />
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: '#c0392b', lineHeight: 1.5 }}>
                  Notifications are blocked. Enable them in your browser settings.
                </p>
              </div>
            )}

            {permission === 'default' && (
              <button
                onClick={requestPermission}
                style={{
                  width: '100%', marginBottom: '10px',
                  background: 'var(--accent-whisper)', border: '1px solid var(--accent-dim)',
                  borderRadius: '8px', padding: '10px 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}
              >
                <Bell size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--accent)', textAlign: 'left' }}>
                  Enable browser notifications
                </p>
              </button>
            )}

            <Card>
              <ReminderRow
                symbol="◐"
                label="Morning practice"
                enabled={prefs.morningEnabled}
                time={prefs.morningTime}
                browserOn={prefs.morningEnabled}
                emailOn={prefs.emailMorningEnabled}
                onToggle={() => {
                  if (!prefs.morningEnabled && permission === 'default') { requestPermission(); return }
                  updatePref('morningEnabled', !prefs.morningEnabled)
                }}
                onTimeChange={v => updatePref('morningTime', v)}
                onBrowserToggle={() => {
                  if (permission === 'default') { requestPermission(); return }
                  updatePref('morningEnabled', !prefs.morningEnabled)
                }}
                onEmailToggle={() => updatePref('emailMorningEnabled', !prefs.emailMorningEnabled)}
              />
              <ReminderRow
                symbol="◑"
                label="Evening reflection"
                enabled={prefs.eveningEnabled}
                time={prefs.eveningTime}
                browserOn={prefs.eveningEnabled}
                emailOn={prefs.emailEveningEnabled}
                onToggle={() => {
                  if (!prefs.eveningEnabled && permission === 'default') { requestPermission(); return }
                  updatePref('eveningEnabled', !prefs.eveningEnabled)
                }}
                onTimeChange={v => updatePref('eveningTime', v)}
                onBrowserToggle={() => {
                  if (permission === 'default') { requestPermission(); return }
                  updatePref('eveningEnabled', !prefs.eveningEnabled)
                }}
                onEmailToggle={() => updatePref('emailEveningEnabled', !prefs.emailEveningEnabled)}
                last
              />
            </Card>

            <JolyButton
              className="w-full mt-2.5"
              size="lg"
              variant={prefsSaved ? 'outline' : 'default'}
              onClick={savePrefs}
            >
              {prefsSaved ? <><Check size={14} /> Saved</> : 'Save reminders'}
            </JolyButton>
          </div>

          {/* ── Your Practice ────────────────────────────────────────── */}
          <div className="animate-fade-up delay-300" style={{ marginBottom: '2rem' }}>
            <SectionLabel label="Your practice" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>

              {/* Streak card */}
              <div style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                  <p style={{
                    fontFamily: 'var(--font-display)', fontSize: '2rem',
                    fontWeight: 400, color: 'var(--accent)', lineHeight: 1,
                  }}>
                    {stats.streak}
                  </p>
                  {tier.symbol && (
                    <span style={{
                      fontSize: '1rem', color: 'var(--accent)', opacity: 0.7, lineHeight: 1,
                    }}>
                      {tier.symbol}
                    </span>
                  )}
                </div>
                <p style={{
                  fontFamily: 'var(--font-ui)', fontSize: '10px',
                  color: 'var(--foreground-subtle)', letterSpacing: '0.06em', marginBottom: '6px',
                }}>
                  day streak
                </p>
                {tier.label && (
                  <span style={{
                    display: 'inline-block', fontFamily: 'var(--font-ui)', fontSize: '8px',
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: 'var(--accent)', border: '1px solid var(--accent-dim)',
                    borderRadius: '20px', padding: '2px 7px', opacity: 0.85,
                    marginBottom: '8px',
                  }}>
                    {tier.label}
                  </span>
                )}
                {/* Progress to next tier */}
                {tier.next !== null && stats.streak > 0 && (
                  <div>
                    <div style={{
                      height: '2px', background: 'var(--border)',
                      borderRadius: '1px', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', width: `${tier.progress * 100}%`,
                        background: 'var(--accent)', borderRadius: '1px',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <p style={{
                      fontFamily: 'var(--font-ui)', fontSize: '8px',
                      color: 'var(--foreground-subtle)', opacity: 0.5,
                      marginTop: '3px', letterSpacing: '0.04em',
                    }}>
                      {tier.next - stats.streak} days to {
                        tier.next <= 7 ? 'Practitioner' :
                        tier.next <= 30 ? 'Philosopher' : 'Sage'
                      }
                    </p>
                  </div>
                )}
                {tier.next === null && (
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '8px', color: 'var(--accent)', opacity: 0.6, letterSpacing: '0.04em' }}>
                    Highest rank
                  </p>
                )}
              </div>

              {/* Total entries */}
              <div style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '16px',
              }}>
                <p style={{
                  fontFamily: 'var(--font-display)', fontSize: '2rem',
                  fontWeight: 400, color: 'var(--foreground)', lineHeight: 1,
                  marginBottom: '2px',
                }}>
                  {stats.total}
                </p>
                <p style={{
                  fontFamily: 'var(--font-ui)', fontSize: '10px',
                  color: 'var(--foreground-subtle)', letterSpacing: '0.06em', marginBottom: '10px',
                }}>
                  total entries
                </p>
                {stats.lastDate && (
                  <p style={{
                    fontFamily: 'var(--font-ui)', fontSize: '9px',
                    color: 'var(--foreground-subtle)', opacity: 0.5, lineHeight: 1.4,
                  }}>
                    Last entry{'\n'}
                    {new Date(stats.lastDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Data ────────────────────────────────────────────────── */}
          <div className="animate-fade-up delay-400" style={{ marginBottom: '2rem' }}>
            <SectionLabel label="Data" />
            <Card>
              <Row
                icon={<Download size={15} />}
                label={exporting ? 'Preparing export…' : 'Export journal'}
                sublabel="Opens a print-ready PDF view"
                onClick={exporting ? undefined : handleExport}
                last
              />
            </Card>
          </div>

          {/* ── About ───────────────────────────────────────────────── */}
          <div className="animate-fade-up delay-500" style={{ marginBottom: '2rem' }}>
            <SectionLabel label="About" />
            <Card>
              <Row label="Version" value="1.0.0" />
              <Row
                icon={<Shield size={15} />}
                label="Privacy policy"
                onClick={() => router.push('/privacy')}
              />
              <Row
                icon={<FileText size={15} />}
                label="Terms of service"
                onClick={() => router.push('/terms')}
                last
              />
            </Card>

            <div style={{
              marginTop: '10px', padding: '14px 16px',
              border: '1px solid var(--border)', borderLeft: '2px solid var(--accent-dim)',
              borderRadius: '8px',
            }}>
              <p style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: '0.82rem', color: 'var(--foreground-subtle)', lineHeight: 1.7,
              }}>
                Amor Fati — love of fate. Not merely to bear what is necessary,
                but to love it. This practice is built on that conviction.
              </p>
            </div>
          </div>

          {/* ── Account ─────────────────────────────────────────────── */}
          <div className="animate-fade-up delay-600" style={{ marginBottom: '2rem' }}>
            <SectionLabel label="Account" />
            <Card>
              {/* Sign out */}
              <div>
                <Row
                  icon={<LogOut size={15} />}
                  label={signingOut ? 'Signing out…' : signOutConfirm ? 'Confirm sign out' : 'Sign out'}
                  onClick={signOutConfirm ? undefined : () => setSignOutConfirm(true)}
                />
                {signOutConfirm && (
                  <ConfirmBanner
                    message="You'll need to sign back in to continue your practice."
                    confirmLabel={signingOut ? 'Signing out…' : 'Yes, sign out'}
                    onConfirm={handleSignOut}
                    onCancel={() => setSignOutConfirm(false)}
                  />
                )}
              </div>

              {/* Delete account */}
              <div style={{ borderTop: '1px solid var(--border)' }}>
                <Row
                  icon={<Trash2 size={15} />}
                  label="Delete account"
                  onClick={() => setDeleteModalOpen(true)}
                  danger
                  last
                />
              </div>
            </Card>
          </div>

        </div>
        <Nav current="/settings" />
      </main>
    </>
  )
}
