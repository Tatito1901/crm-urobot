'use client'

import { useEffect, memo } from 'react'
import { useRouter } from 'next/navigation'

// SVG del checkmark memoizado
const CheckmarkIcon = memo(() => (
  <svg 
    className="w-10 h-10 sm:w-12 sm:h-12 text-white scale-0 animate-in zoom-in-50 duration-700 delay-300" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2.5} 
      d="M5 13l4 4L19 7"
    />
  </svg>
))
CheckmarkIcon.displayName = 'CheckmarkIcon'

// Dots animados memoizados
const AnimatedDots = memo(() => (
  <div className="flex space-x-1.5">
    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#04070e]/95 backdrop-blur-md animate-in fade-in duration-300"
      role="dialog"
      aria-live="polite"
      aria-label="Inicio de sesión exitoso"
    >
      <div className="relative space-y-6 text-center animate-in zoom-in-95 duration-500">
        {/* Checkmark animado */}
        <div className="mx-auto w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-teal-500/40">
          <CheckmarkIcon />
        </div>
        
        {/* Mensaje de éxito */}
        <div className="space-y-2.5 animate-in slide-in-from-bottom-4 duration-700 delay-300">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-jakarta tracking-tight">
            ¡Bienvenido!
          </h2>
          <p className="text-white/40 text-sm max-w-xs mx-auto px-4">
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
