'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

interface FloatingLabelTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function FloatingLabelTextarea({
  label = 'Write freely',
  className,
  onFocus,
  onBlur,
  ...props
}: FloatingLabelTextareaProps) {
  return (
    <Textarea
      placeholder={label}
      className={cn('min-h-[150px]', className)}
      onFocus={e => {
        e.currentTarget.style.borderColor = 'var(--accent-dim)'
        onFocus?.(e)
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        onBlur?.(e)
      }}
      {...props}
    />
  )
}
