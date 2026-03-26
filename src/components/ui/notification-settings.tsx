'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Bell, X, Check, ChevronRight } from 'lucide-react'

interface NotificationPrefs {
  morningEnabled: boolean
  morningTime: string
  eveningEnabled: boolean
  eveningTime: string
}

const DEFAULT_PREFS: NotificationPrefs = {
  morningEnabled: false,
  morningTime: '07:00',
  eveningEnabled: false,
  eveningTime: '20:30',
}

function sendPrefsToSW(prefs: NotificationPrefs) {
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker.ready.then((reg) => {
    reg.active?.postMessage({ type: 'SET_NOTIFICATION_PREFS', prefs })
  })
}

function formatTime12h(t: string): { hours: string; minutes: string; period: string } {
  const [hStr, mStr] = t.split(':')
  let h = parseInt(hStr, 10)
  const m = mStr ?? '00'
  const period = h >= 12 ? 'PM' : 'AM'
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  return { hours: String(h).padStart(2, '0'), minutes: m, period }
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function NotificationSettings() {
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('amor-fati-notification-prefs')
    if (stored) {
      try { setPrefs(JSON.parse(stored)) } catch { /* ignore */ }
    }
    if ('Notification' in window) setPermission(Notification.permission)
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  const handleSave = () => {
    localStorage.setItem('amor-fati-notification-prefs', JSON.stringify(prefs))
    sendPrefsToSW(prefs)
    setSaved(true)
    setTimeout(() => { setSaved(false); setOpen(false) }, 1200)
  }

  const update = (key: keyof NotificationPrefs, value: boolean | string) => {
    setPrefs(prev => ({ ...prev, [key]: value }))
  }

  const anyEnabled = prefs.morningEnabled || prefs.eveningEnabled

  return (
    <>
      {/* ── Trigger button ───────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        title="Set reminders"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: anyEnabled ? 'rgba(200,149,106,0.1)' : 'var(--muted)',
          border: `1px solid ${anyEnabled ? 'var(--accent-dim)' : 'var(--border)'}`,
          borderRadius: '20px',
          padding: '6px 12px 6px 9px',
          cursor: 'pointer',
          color: anyEnabled ? 'var(--accent)' : 'var(--foreground-muted)',
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          letterSpacing: '0.06em',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
        }}
      >
        <Bell size={13} style={{ flexShrink: 0 }} />
        <span>Reminders</span>
        {anyEnabled && (
          <span style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: 'var(--accent)', flexShrink: 0,
            boxShadow: '0 0 6px var(--accent)',
          }} />
        )}
      </button>

      {/* ── Portal ───────────────────────────────────────────────────── */}
      {mounted && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 49,
              background: 'rgba(8,9,11,0.8)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Sheet */}
          <div
            style={{
              position: 'fixed',
              bottom: 0, left: 0, right: 0,
              zIndex: 50,
              transform: open ? 'translateY(0)' : 'translateY(110%)',
              transition: 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)',
              background: 'var(--card)',
              borderTop: '1px solid rgba(200,149,106,0.2)',
              borderRadius: '20px 20px 0 0',
              padding: '12px 20px 44px',
              maxHeight: '88vh',
              overflowY: 'auto',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.6), 0 -1px 0 rgba(200,149,106,0.08)',
            }}
          >
            {/* Handle */}
            <div style={{
              width: '40px', height: '4px', background: 'var(--border)',
              borderRadius: '2px', margin: '0 auto 24px',
              opacity: 0.6,
            }} />

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Icon badge */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(200,149,106,0.2), rgba(200,149,106,0.06))',
                  border: '1px solid rgba(200,149,106,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Bell size={17} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p style={{
                    fontFamily: 'var(--font-ui)', fontSize: '10px',
                    letterSpacing: '0.18em', color: 'var(--accent)',
                    textTransform: 'uppercase', opacity: 0.75, marginBottom: '2px',
                  }}>
                    Practice
                  </p>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontSize: '1.5rem',
                    fontWeight: 400, color: 'var(--foreground)', lineHeight: 1,
                  }}>
                    Reminders
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'var(--muted)', border: '1px solid var(--border)',
                  borderRadius: '50%', width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--foreground-muted)',
                  flexShrink: 0,
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Permission state */}
            {permission === 'default' && (
              <button
                onClick={requestPermission}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', textAlign: 'left',
                  background: 'rgba(200,149,106,0.07)',
                  border: '1px solid rgba(200,149,106,0.25)',
                  borderRadius: '12px', padding: '14px 16px',
                  marginBottom: '20px', cursor: 'pointer',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: 'var(--accent)', flexShrink: 0,
                    boxShadow: '0 0 8px var(--accent)',
                    animation: 'breathe 2s ease-in-out infinite',
                  }} />
                  <p style={{
                    fontFamily: 'var(--font-ui)', fontSize: '12.5px',
                    color: 'var(--foreground)', lineHeight: 1.5,
                  }}>
                    Allow notifications to receive daily reminders
                  </p>
                </div>
                <ChevronRight size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              </button>
            )}

            {permission === 'denied' && (
              <div style={{
                background: 'rgba(239,68,68,0.07)',
                border: '1px solid rgba(239,68,68,0.18)',
                borderRadius: '12px', padding: '14px 16px', marginBottom: '20px',
              }}>
                <p style={{
                  fontFamily: 'var(--font-ui)', fontSize: '12px',
                  color: '#f87171', lineHeight: 1.6,
                }}>
                  Notifications are blocked in your browser settings. Enable them there to use reminders.
                </p>
              </div>
            )}

            {/* Reminder cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <ReminderCard
                symbol="◐"
                label="Morning practice"
                description="Begin the day with intention"
                enabled={prefs.morningEnabled}
                time={prefs.morningTime}
                onToggle={(v) => {
                  if (v && permission === 'default') { requestPermission(); return }
                  update('morningEnabled', v)
                }}
                onTimeChange={(v) => update('morningTime', v)}
                disabled={permission === 'denied'}
              />
              <ReminderCard
                symbol="◑"
                label="Evening reflection"
                description="Examine your day and let it go"
                enabled={prefs.eveningEnabled}
                time={prefs.eveningTime}
                onToggle={(v) => {
                  if (v && permission === 'default') { requestPermission(); return }
                  update('eveningEnabled', v)
                }}
                onTimeChange={(v) => update('eveningTime', v)}
                disabled={permission === 'denied'}
              />
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={permission === 'denied'}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                background: saved
                  ? 'rgba(200,149,106,0.12)'
                  : 'linear-gradient(135deg, #d4a574, #c8956a)',
                border: saved ? '1px solid rgba(200,149,106,0.35)' : 'none',
                color: saved ? 'var(--accent)' : '#1a0e06',
                fontFamily: 'var(--font-ui)',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: permission === 'denied' ? 'not-allowed' : 'pointer',
                opacity: permission === 'denied' ? 0.35 : 1,
                transition: 'all 0.35s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: saved ? 'none' : '0 4px 20px rgba(200,149,106,0.35), 0 1px 0 rgba(255,255,255,0.1) inset',
              }}
            >
              {saved
                ? <><Check size={14} strokeWidth={2.5} /> Saved</>
                : 'Save reminders'}
            </button>

            {/* Fine print */}
            <p style={{
              fontFamily: 'var(--font-ui)', fontSize: '10px',
              color: 'var(--foreground-subtle)', textAlign: 'center',
              marginTop: '14px', lineHeight: 1.6, opacity: 0.5,
            }}>
              Reminders appear when your browser is open.
            </p>
          </div>
        </>,
        document.body
      )}
    </>
  )
}

// ─── Reminder card ────────────────────────────────────────────────────────────

function ReminderCard({
  symbol, label, description,
  enabled, time, onToggle, onTimeChange, disabled,
}: {
  symbol: string
  label: string
  description: string
  enabled: boolean
  time: string
  onToggle: (v: boolean) => void
  onTimeChange: (v: string) => void
  disabled?: boolean
}) {
  const { hours, minutes, period } = formatTime12h(time)
  const timeInputRef = useRef<HTMLInputElement>(null)

  return (
    <div style={{
      background: enabled
        ? 'linear-gradient(135deg, rgba(200,149,106,0.09), rgba(200,149,106,0.04))'
        : 'var(--muted)',
      border: `1px solid ${enabled ? 'rgba(200,149,106,0.3)' : 'var(--border)'}`,
      borderRadius: '14px',
      padding: '16px 18px',
      transition: 'all 0.3s ease',
      boxShadow: enabled ? '0 2px 16px rgba(200,149,106,0.08)' : 'none',
    }}>
      {/* Top row: symbol + label + toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Symbol */}
        <span style={{
          fontSize: '20px',
          color: enabled ? 'var(--accent)' : 'var(--foreground-subtle)',
          transition: 'color 0.3s',
          lineHeight: 1,
          flexShrink: 0,
        }}>
          {symbol}
        </span>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.05rem',
            fontWeight: 400,
            color: enabled ? 'var(--foreground)' : 'var(--foreground-muted)',
            transition: 'color 0.3s',
            marginBottom: '1px',
          }}>
            {label}
          </p>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '10.5px',
            color: 'var(--foreground-subtle)',
            letterSpacing: '0.03em',
            opacity: enabled ? 0.7 : 0.45,
          }}>
            {description}
          </p>
        </div>

        {/* iOS-style toggle */}
        <button
          onClick={() => !disabled && onToggle(!enabled)}
          disabled={disabled}
          aria-label={enabled ? 'Disable' : 'Enable'}
          style={{
            width: '50px', height: '28px', borderRadius: '14px',
            background: enabled
              ? 'linear-gradient(135deg, #d4a574, #c8956a)'
              : 'var(--background)',
            border: `1.5px solid ${enabled ? 'transparent' : 'var(--border)'}`,
            cursor: disabled ? 'not-allowed' : 'pointer',
            position: 'relative',
            transition: 'all 0.25s ease',
            flexShrink: 0,
            opacity: disabled ? 0.3 : 1,
            boxShadow: enabled ? '0 2px 8px rgba(200,149,106,0.4)' : 'inset 0 1px 3px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{
            position: 'absolute',
            top: '3px',
            left: enabled ? '23px' : '3px',
            width: '20px', height: '20px',
            borderRadius: '50%',
            background: enabled ? '#fff' : 'var(--foreground-subtle)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            transition: 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }} />
        </button>
      </div>

      {/* Time row — only when enabled */}
      {enabled && (
        <div style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(200,149,106,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '10px',
            letterSpacing: '0.16em',
            color: 'var(--foreground-subtle)',
            textTransform: 'uppercase',
            opacity: 0.6,
          }}>
            Remind me at
          </p>

          {/* Time display — click to open native picker */}
          <div
            onClick={() => timeInputRef.current?.showPicker?.()}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: '3px',
              cursor: 'pointer',
              padding: '6px 12px',
              background: 'rgba(200,149,106,0.1)',
              border: '1px solid rgba(200,149,106,0.25)',
              borderRadius: '8px',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.35rem',
              color: 'var(--accent)',
              letterSpacing: '0.04em',
              lineHeight: 1,
            }}>
              {hours}:{minutes}
            </span>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '10px',
              color: 'var(--accent)',
              opacity: 0.7,
              letterSpacing: '0.08em',
              marginLeft: '4px',
            }}>
              {period}
            </span>

            {/* Hidden native input */}
            <input
              ref={timeInputRef}
              type="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              disabled={disabled}
              style={{
                position: 'absolute', inset: 0,
                opacity: 0, cursor: 'pointer',
                width: '100%', height: '100%',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
