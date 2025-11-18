import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        // Default - Sky blue
        default:
          "border-sky-500/30 bg-sky-500/10 text-sky-300 [a&]:hover:bg-sky-500/20 [a&]:hover:border-sky-500/40",
        
        // Primary - Sky blue (alias)
        primary:
          "border-sky-500/30 bg-sky-500/10 text-sky-300 [a&]:hover:bg-sky-500/20 [a&]:hover:border-sky-500/40",
        
        // Secondary - Semi-transparent white
        secondary:
          "border-white/20 bg-white/10 text-white/90 [a&]:hover:bg-white/15 [a&]:hover:border-white/30",
        
        // Destructive - Red
        destructive:
          "border-red-500/30 bg-red-500/10 text-red-300 [a&]:hover:bg-red-500/20 [a&]:hover:border-red-500/40",
        
        // Success - Green
        success:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 [a&]:hover:bg-emerald-500/20 [a&]:hover:border-emerald-500/40",
        
        // Warning - Amber
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-300 [a&]:hover:bg-amber-500/20 [a&]:hover:border-amber-500/40",
        
        // Info - Blue
        info:
          "border-blue-500/30 bg-blue-500/10 text-blue-300 [a&]:hover:bg-blue-500/20 [a&]:hover:border-blue-500/40",
        
        // Purple
        purple:
          "border-purple-500/30 bg-purple-500/10 text-purple-300 [a&]:hover:bg-purple-500/20 [a&]:hover:border-purple-500/40",
        
        // Outline - Transparent con borde
        outline:
          "border-white/25 bg-transparent text-white/80 [a&]:hover:bg-white/10 [a&]:hover:border-white/40",
        
        // Ghost - Solo color, sin borde ni fondo
        ghost:
          "border-transparent bg-transparent text-white/70 [a&]:hover:text-white/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
