// Componente Button de shadcn/ui — Premium Edition GP Medical
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/btn relative inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-white transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_4px_12px_-2px_rgba(16,185,129,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_8px_24px_-4px_rgba(16,185,129,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] hover:-translate-y-[1px] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        premium:
          "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border-0 shadow-[0_6px_20px_-4px_rgba(16,185,129,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_10px_32px_-4px_rgba(16,185,129,0.6),inset_0_1px_0_rgba(255,255,255,0.25)] hover:-translate-y-[2px] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        destructive:
          "bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[0_4px_12px_-2px_rgba(244,63,94,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_8px_24px_-4px_rgba(244,63,94,0.5)] hover:-translate-y-[1px] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        outline:
          "border border-slate-200/80 bg-white/60 backdrop-blur-sm shadow-[0_2px_4px_-1px_rgba(0,0,0,0.04)] hover:bg-white hover:border-emerald-200 hover:shadow-[0_4px_12px_-2px_rgba(16,185,129,0.12)] hover:-translate-y-[1px] hover:text-emerald-700",
        secondary:
          "bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800 border border-slate-200/60 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] hover:-translate-y-[1px]",
        ghost:
          "hover:bg-slate-100/60 hover:text-emerald-700 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]",
        link: "text-emerald-600 underline-offset-4 hover:underline hover:text-emerald-700",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
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
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
