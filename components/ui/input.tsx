'use client'

import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

const baseStyles =
  'w-full rounded-lg border border-white/20 bg-white/[0.08] px-3 py-2.5 min-h-[44px] text-sm text-white placeholder:text-white/50 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, isInvalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        baseStyles,
        isInvalid && 'border-rose-400/60 focus-visible:outline-rose-300',
        className
      )}
      {...props}
    />
  )
)

Input.displayName = 'Input'
