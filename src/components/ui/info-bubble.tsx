'use client'

import { useState, useRef, useEffect } from 'react'
import { Info } from 'lucide-react'

interface InfoBubbleProps {
  text: string
  size?: number
}

export function InfoBubble({ text, size = 14 }: InfoBubbleProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="More information"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0',
          margin: '0',
          lineHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: open ? 'var(--accent)' : 'var(--foreground-subtle)',
          opacity: open ? 1 : 0.5,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9' }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLElement).style.opacity = '0.5' }}
      >
        <Info size={size} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '12px 14px',
            width: '240px',
            boxShadow: 'var(--shadow-md)',
            zIndex: 50,
            animation: 'fadeUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
          }}
        >
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11.5px',
            color: 'var(--foreground-muted)',
            lineHeight: 1.6,
          }}>
            {text}
          </p>
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            bottom: '-5px',
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '10px',
            height: '10px',
            background: 'var(--card)',
            borderRight: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
          }} />
        </div>
      )}
    </div>
  )
}
