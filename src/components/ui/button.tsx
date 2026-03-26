import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium",
    "transition-all duration-200 outline-offset-2",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "shadow-[0_2px_16px_rgba(200,149,106,0.25)]",
          "hover:brightness-110 hover:shadow-[0_4px_24px_rgba(200,149,106,0.4)]",
          "active:scale-[0.98]",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground",
          "shadow-sm hover:bg-destructive/90",
          "active:scale-[0.98]",
        ].join(" "),
        outline: [
          "border border-border bg-transparent text-foreground",
          "hover:bg-accent hover:border-[var(--accent-dim)] hover:text-primary",
          "active:scale-[0.98]",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground border border-border",
          "hover:border-[var(--accent-dim)] hover:text-foreground",
          "active:scale-[0.98]",
        ].join(" "),
        ghost: [
          "bg-transparent text-muted-foreground",
          "hover:bg-accent hover:text-foreground",
          "active:scale-[0.98]",
        ].join(" "),
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm:      "h-8 px-3 text-xs rounded-lg",
        lg:      "h-12 px-8 text-base rounded-xl",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
