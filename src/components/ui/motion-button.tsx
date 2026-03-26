'use client'

import { FC } from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MotionButtonProps {
  label: string
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}

const MotionButton: FC<MotionButtonProps> = ({
  label,
  href,
  onClick,
  type = 'button',
  disabled = false,
  className,
}) => {
  const shared = cn(
    'group relative h-14 w-full cursor-pointer rounded-full p-1 outline-none transition-opacity',
    'border border-[var(--accent-dim)]',
    disabled && 'opacity-40 cursor-not-allowed',
    className
  )

  const inner = (
    <>
      {/* Expanding circle */}
      <span
        className="absolute top-1 left-1 block h-12 w-12 overflow-hidden rounded-full duration-500 group-hover:w-[calc(100%-0.5rem)]"
        style={{ background: 'var(--accent)' }}
        aria-hidden="true"
      />
      {/* Arrow icon */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 translate-x-0 duration-500 group-hover:translate-x-[0.4rem] z-10">
        <ArrowRight
          className="size-5"
          style={{ color: '#0c0b0a' }}
        />
      </div>
      {/* Label */}
      <span
        className="absolute top-1/2 left-1/2 ml-4 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center duration-500 group-hover:text-[#0c0b0a] z-10"
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          fontWeight: 500,
          letterSpacing: '0.08em',
          color: 'var(--foreground)',
        }}
      >
        {label}
      </span>
    </>
  )

  if (href) {
    return (
      <a href={href} className={shared} style={{ display: 'block', textDecoration: 'none' }}>
        {inner}
      </a>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={shared}
      style={{ background: 'transparent' }}
    >
      {inner}
    </button>
  )
}

export default MotionButton
