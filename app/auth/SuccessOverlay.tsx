'use client'

import { useEffect, memo } from 'react'
import { useRouter } from 'next/navigation'

// SVG del checkmark memoizado
const CheckmarkIcon = memo(() => (
  <svg 
    className="w-12 h-12 sm:w-14 sm:h-14 text-white scale-0 animate-in zoom-in-50 duration-700 delay-300" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={3} 
      d="M5 13l4 4L19 7"
    />
  </svg>
))
CheckmarkIcon.displayName = 'CheckmarkIcon'

// Dots animados memoizados
const AnimatedDots = memo(() => (
  <div className="flex space-x-2">
    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
))
AnimatedDots.displayName = 'AnimatedDots'

export const SuccessOverlay = memo(() => {
  const router = useRouter()

  useEffect(() => {
    // Redirigir después de 2 segundos
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-sm animate-in fade-in duration-300"
      role="dialog"
      aria-live="polite"
      aria-label="Inicio de sesión exitoso"
    >
      <div className="relative space-y-6 text-center animate-in zoom-in-95 duration-500">
        {/* Checkmark animado */}
        <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-2xl shadow-emerald-500/50 animate-pulse">
          <CheckmarkIcon />
        </div>
        
        {/* Mensaje de éxito */}
        <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-700 delay-300">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
            ¡Bienvenido de vuelta!
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto px-4">
            Acceso concedido. Redirigiendo al sistema...
          </p>
        </div>

        {/* Spinner de carga */}
        <div className="flex justify-center animate-in fade-in duration-1000 delay-500">
          <AnimatedDots />
        </div>
      </div>
    </div>
  )
})
SuccessOverlay.displayName = 'SuccessOverlay'
