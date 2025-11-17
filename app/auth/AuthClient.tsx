'use client'

import { useActionState, useEffect, useState, memo, lazy, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signInAction } from './actions'
import { initialAuthState } from './state'
import { EmailIcon, LockIcon, AlertIcon } from './AuthIcons'

// Lazy load del overlay para reducir bundle inicial
const SuccessOverlay = lazy(() => import('./SuccessOverlay').then(mod => ({ default: mod.SuccessOverlay })))

// Icono de spinner memoizado
const SpinnerIcon = memo(() => (
  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
))
SpinnerIcon.displayName = 'SpinnerIcon'

// Componente de alerta de error memoizado
const ErrorAlert = memo(({ message }: { message: string }) => (
  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-start gap-3" role="alert">
    <AlertIcon />
    <p className="text-sm text-red-200">{message}</p>
  </div>
))
ErrorAlert.displayName = 'ErrorAlert'

/**
 * Componente cliente que maneja toda la lógica del formulario de login
 * Incluye el formulario y el overlay de éxito
 */
export function AuthClient() {
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialAuthState,
  )

  // Mostrar overlay cuando el login es exitoso
  useEffect(() => {
    if (state.success && !isPending) {
      setShowSuccessOverlay(true)
    }
  }, [state.success, isPending])

  return (
    <>
      {showSuccessOverlay && (
        <Suspense fallback={null}>
          <SuccessOverlay />
        </Suspense>
      )}
      
      <form action={formAction} className="space-y-4 sm:space-y-5" noValidate>
        <div className="space-y-2">
          <label 
            htmlFor="login-email" 
            className="text-sm font-medium text-slate-300 flex items-center gap-2"
          >
            <EmailIcon />
            Correo electrónico
          </label>
          <Input
            id="login-email"
            name="email"
            type="email"
            placeholder="doctor@clinica.com"
            autoComplete="email"
            className="h-11 sm:h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-400/50 focus:ring-blue-400/20 transition-colors"
            required
            aria-required="true"
            aria-invalid={state.error ? 'true' : 'false'}
          />
        </div>

        <div className="space-y-2">
          <label 
            htmlFor="login-password" 
            className="text-sm font-medium text-slate-300 flex items-center gap-2"
          >
            <LockIcon />
            Contraseña
          </label>
          <Input
            id="login-password"
            name="password"
            type="password"
            placeholder="••••••••••••"
            autoComplete="current-password"
            className="h-11 sm:h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-400/50 focus:ring-blue-400/20 transition-colors"
            required
            aria-required="true"
            aria-invalid={state.error ? 'true' : 'false'}
          />
        </div>

        {state.error && <ErrorAlert message={state.error} />}

        <Button 
          type="submit" 
          className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <SpinnerIcon />
              <span>Ingresando...</span>
            </span>
          ) : (
            'Iniciar sesión'
          )}
        </Button>
      </form>
    </>
  )
}
