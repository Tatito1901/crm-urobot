import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        // Primario - Sky blue (tema principal del CRM)
        default: "bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 active:bg-sky-600 active:scale-95 focus-visible:outline-sky-300",
        primary: "bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 active:bg-sky-600 active:scale-95 focus-visible:outline-sky-300",
        
        // Destructivo - Red
        destructive: "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-400 active:bg-red-600 active:scale-95 focus-visible:outline-red-300",
        
        // Outline - Borde con fondo transparente
        outline: "border border-white/25 bg-transparent text-white hover:bg-white/10 active:bg-white/15 active:scale-95 focus-visible:outline-sky-200",
        
        // Secondary - Fondo semi-transparente
        secondary: "bg-white/10 text-white hover:bg-white/15 active:bg-white/20 active:scale-95 focus-visible:outline-sky-200",
        
        // Ghost - Solo texto
        ghost: "text-white/70 hover:text-white hover:bg-white/10 active:bg-white/15 active:scale-95 focus-visible:outline-sky-200",
        
        // Link - Estilo de enlace
        link: "text-sky-400 underline-offset-4 hover:underline hover:text-sky-300",
        
        // Success - Verde
        success: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:bg-emerald-600 active:scale-95 focus-visible:outline-emerald-300",
        
        // Warning - Amarillo/Ámbar
        warning: "bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:bg-amber-600 active:scale-95 focus-visible:outline-amber-300",
      },
      size: {
        default: "h-11 px-4 py-2 has-[>svg]:px-3",
        xs: "h-8 px-2 text-xs rounded-md gap-1 has-[>svg]:px-1.5",
        sm: "h-9 px-3 text-sm rounded-md gap-1.5 has-[>svg]:px-2.5",
        lg: "h-12 px-6 text-base rounded-lg has-[>svg]:px-4",
        xl: "h-14 px-8 text-lg rounded-lg has-[>svg]:px-6",
        icon: "size-11",
        "icon-xs": "size-8",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
        "icon-xl": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
