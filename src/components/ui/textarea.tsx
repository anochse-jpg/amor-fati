import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded resize-none",
          "px-3 py-2 text-sm",
          "transition-all duration-200",
          "focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{
          background: 'var(--muted)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
          fontFamily: 'var(--font-display)',
          fontSize: '1rem',
          lineHeight: 1.75,
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
