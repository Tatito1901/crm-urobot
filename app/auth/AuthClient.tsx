'use client'

import { useActionState, useEffect, useState, memo, lazy, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signInAction } from './actions'
import { initialAuthState } from './state'
import { AlertIcon } from './AuthIcons'
import { Loader2 } from 'lucide-react'

// Lazy load del overlay
const SuccessOverlay = lazy(() => import('./SuccessOverlay').then(mod => ({ default: mod.SuccessOverlay })))

// Componente de alerta de error minimalista
const ErrorAlert = memo(({ message }: { message: string }) => (
  <div className="flex items-center gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20" role="alert">
    <AlertIcon />
    <p>{message}</p>
  </div>
))
ErrorAlert.displayName = 'ErrorAlert'

/**
 * Formulario de login optimizado y moderno
 */
export function AuthClient() {
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialAuthState,
  )

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
        <div className="grid gap-2">
          <label 
            htmlFor="email" 
            className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 ml-1"
          >
            Correo electrónico
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="urologo@urobot.mx"
            autoComplete="email"
            className="h-11 bg-white dark:bg-black border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all rounded-xl shadow-sm"
            required
            aria-invalid={!!state.error}
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between ml-1">
            <label 
              htmlFor="password" 
              className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300"
            >
              Contraseña
            </label>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="h-11 bg-white dark:bg-black border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all rounded-xl shadow-sm"
            required
            aria-invalid={!!state.error}
          />
        </div>

        {state.error && <ErrorAlert message={state.error} />}

        <Button 
          type="submit" 
          className="w-full h-11 mt-2 bg-slate-950 hover:bg-slate-900 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed" 
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
