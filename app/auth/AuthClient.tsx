'use client'

import { useActionState, useEffect, useState, useCallback, memo, lazy, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signInAction } from './actions'
import { initialAuthState } from './state'
import { AlertIcon, EyeIcon, EyeOffIcon } from './AuthIcons'
import { Loader2 } from 'lucide-react'

// Lazy load del overlay
const SuccessOverlay = lazy(() => import('./SuccessOverlay').then(mod => ({ default: mod.SuccessOverlay })))

// Componente de alerta de error
const ErrorAlert = memo(({ message }: { message: string }) => (
  <div className="flex items-center gap-2.5 rounded-xl bg-red-500/[0.06] dark:bg-red-500/[0.08] px-3.5 py-3 text-[13px] text-red-600 dark:text-red-400 border border-red-500/10 dark:border-red-500/15" role="alert">
    <AlertIcon />
    <p className="font-medium">{message}</p>
  </div>
))
ErrorAlert.displayName = 'ErrorAlert'

// Input styles compartidos para evitar repetición
const inputStyles = "h-12 bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 dark:focus:border-teal-400/40 transition-all rounded-xl text-[15px]"

/**
 * Formulario de login optimizado y moderno
 */
export function AuthClient() {
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialAuthState,
  )

  const togglePassword = useCallback(() => setShowPassword(prev => !prev), [])

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
      
      <form action={formAction} className="grid gap-5" noValidate>
        {/* Email field */}
        <div className="grid gap-2">
          <label 
            htmlFor="email" 
            className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/40 ml-0.5"
          >
            Correo electrónico
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            className={inputStyles}
            required
            aria-invalid={!!state.error}
          />
        </div>

        {/* Password field with toggle */}
        <div className="grid gap-2">
          <label 
            htmlFor="password" 
            className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/40 ml-0.5"
          >
            Contraseña
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className={`${inputStyles} pr-11`}
              required
              aria-invalid={!!state.error}
            />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 dark:text-white/25 hover:text-slate-600 dark:hover:text-white/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {state.error && <ErrorAlert message={state.error} />}

        <Button 
          type="submit" 
          className="w-full h-12 mt-1 bg-slate-900 hover:bg-slate-800 text-white dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-white font-semibold rounded-xl transition-all shadow-lg shadow-slate-900/10 dark:shadow-teal-500/10 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-[15px] tracking-tight" 
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            'Acceder al Sistema'
          )}
        </Button>
      </form>
    </>
  )
}
