'use client'

import { forwardRef, useMemo } from 'react'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/app/lib/utils'

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60'

const variants = {
  primary:
    'bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 focus-visible:outline-sky-300',
  secondary:
    'bg-white/10 text-white hover:bg-white/15 focus-visible:outline-sky-200',
  outline:
    'border border-white/20 bg-transparent text-white hover:bg-white/10 focus-visible:outline-sky-200',
  ghost: 'text-white/70 hover:text-white hover:bg-white/10 focus-visible:outline-sky-200',
} as const

const sizes = {
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
  sm: 'h-9 px-3 text-sm',
  xs: 'h-8 px-2 text-xs',
} as const

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'primary', size = 'md', ...props }, ref) => {
    const composed = useMemo(
      () => cn(baseStyles, variants[variant], sizes[size], className),
      [className, size, variant]
    )

    return (
      <button ref={ref} className={composed} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
