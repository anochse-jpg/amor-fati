interface StreakBadgeProps {
  streak: number
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '4px 10px',
      }}
    >
      <span style={{ fontSize: '10px', color: 'var(--accent)', opacity: 0.8 }}>◈</span>
      <span
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '10px',
          color: 'var(--accent)',
          letterSpacing: '0.06em',
        }}
      >
        {streak} day{streak !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
