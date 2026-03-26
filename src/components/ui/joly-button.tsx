'use client'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, useMotionTemplate, useMotionValue } from 'motion/react'
import * as React from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'group relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap',
    'font-medium text-sm transition-all duration-300',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]',
    'disabled:pointer-events-none disabled:opacity-40',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        // Warm-gold filled — for Continue / Complete actions
        default: [
          'bg-[var(--accent)] text-[#0c0b0a]',
          'rounded-md',
          'shadow-[0_2px_16px_rgba(200,149,106,0.2)]',
          'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:to-transparent before:opacity-0 before:transition-opacity',
          'hover:brightness-110 hover:shadow-[0_4px_24px_rgba(200,149,106,0.35)] hover:before:opacity-100',
          'active:scale-[0.98]',
        ].join(' '),
        // Subtle bordered — for secondary nav actions (View journal, Today's practice)
        outline: [
          'border border-[var(--border)] bg-transparent text-[var(--foreground-muted)]',
          'rounded-md',
          'hover:border-[var(--accent-dim)] hover:text-[var(--accent)] hover:bg-[var(--accent-whisper)]',
          'active:scale-[0.98]',
        ].join(' '),
        // Invisible — for back/dismiss actions
        ghost: [
          'bg-transparent text-[var(--foreground-subtle)]',
          'rounded-md',
          'hover:text-[var(--foreground-muted)] hover:bg-[var(--muted)]',
          'active:scale-[0.98]',
        ].join(' '),
        // Muted fill — for less prominent secondary actions
        secondary: [
          'bg-[var(--muted)] text-[var(--foreground-muted)]',
          'border border-[var(--border)]',
          'rounded-md',
          'hover:border-[var(--accent-dim)] hover:text-[var(--foreground)]',
          'active:scale-[0.98]',
        ].join(' '),
        // Inline text link
        link: [
          'text-[var(--accent)] underline-offset-4',
          'hover:underline hover:text-[var(--gold-bright)]',
        ].join(' '),
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-8 rounded px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const JolyButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      const { left, top } = e.currentTarget.getBoundingClientRect()
      mouseX.set(e.clientX - left)
      mouseY.set(e.clientY - top)
    }

    const radialBg = useMotionTemplate`radial-gradient(circle at ${mouseX}px ${mouseY}px, rgba(200,149,106,0.12), transparent 75%)`

    if (asChild) {
      const Comp = Slot
      return (
        <Comp
          className={cn(buttonVariants({ variant, size }), className)}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    const MotionBtn = motion.button

    return (
      <MotionBtn
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        onMouseMove={handleMouseMove}
        whileHover={{ scale: variant === 'link' || variant === 'ghost' ? 1 : 1.015 }}
        whileTap={{ scale: variant === 'link' ? 1 : 0.97 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        {...(props as any)}
      >
        {/* Radial cursor glow — only on filled variants */}
        {variant !== 'link' && variant !== 'ghost' && (
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: radialBg }}
          />
        )}
        <span className="relative z-10 flex items-center justify-center gap-2" style={{ fontFamily: 'var(--font-ui)', letterSpacing: '0.06em' }}>
          {children}
        </span>
      </MotionBtn>
    )
  },
)
JolyButton.displayName = 'JolyButton'

export { JolyButton, buttonVariants }
