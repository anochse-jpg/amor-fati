import { cn } from "@/lib/utils"
import * as React from "react"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-full w-full bg-transparent px-2 py-2 text-sm text-foreground",
          "placeholder:text-muted-foreground/60 placeholder:italic",
          "focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        style={{ fontFamily: "var(--font-ui)" }}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
