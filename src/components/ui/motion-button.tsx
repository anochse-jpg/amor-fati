'use client'

import { motion } from 'motion/react'
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
    'group relative h-14 w-full cursor-pointer rounded-full p-1 outline-none btn-primary',
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
        <ArrowRight className="size-5" style={{ color: '#0c0b0a' }} />
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

  const buttonEl = href ? (
    <a href={href} className={shared} style={{ display: 'block', textDecoration: 'none' }}>
      {inner}
    </a>
  ) : (
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

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Outer pulsing ring */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '-6px',
          borderRadius: '9999px',
          border: '1px solid rgba(200,149,106,0.2)',
          pointerEvents: 'none',
        }}
        animate={{
          boxShadow: [
            '0 0 0px rgba(200,149,106,0)',
            '0 0 18px 3px rgba(200,149,106,0.32)',
            '0 0 0px rgba(200,149,106,0)',
          ],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      />
      {/* Second outer ring, offset timing */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '-12px',
          borderRadius: '9999px',
          border: '1px solid rgba(200,149,106,0.07)',
          pointerEvents: 'none',
        }}
        animate={{
          opacity: [0, 0.6, 0],
          scale: [0.96, 1.02, 0.96],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />
      {buttonEl}
    </div>
  )
}

export default MotionButton
