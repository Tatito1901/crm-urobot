'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { initialAuthState, type AuthFormState } from './state'
import { resetPasswordAction, signInAction } from './actions'

export default function AuthPage() {
  const [showReset, setShowReset] = useState(false)
  
  const [signInState, signInFormAction, signInPending] = useActionState<AuthFormState, FormData>(
    signInAction,
    initialAuthState,
  )
  const [resetState, resetFormAction, resetPending] = useActionState<AuthFormState, FormData>(
    resetPasswordAction,
    initialAuthState,
  )

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4 py-10 text-white">
      {/* Efectos de fondo mejorados */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
        <div className="absolute right-1/4 bottom-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      {/* Contenedor principal */}
      <div className="relative w-full max-w-md space-y-8">
        {/* Logo y header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
              />
            </svg>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-blue-400/60 font-medium">
              CRM Urología
            </p>
            <h1 className="mt-3 text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Acceso al sistema
            </h1>
            <p className="mt-3 text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              Plataforma integral para gestión de consultas, pacientes y leads médicos
            </p>
          </div>
        </div>

        {/* Card de login */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
          <div className="p-8 space-y-6">
            {!showReset ? (
              <>
                {/* Formulario de login */}
                <form action={signInFormAction} className="space-y-5">
                  <div className="space-y-2">
                    <label 
                      htmlFor="login-email" 
                      className="text-sm font-medium text-slate-300 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      Correo electrónico
                    </label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="doctor@clinica.com"
                      autoComplete="email"
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-400/50 focus:ring-blue-400/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label 
                      htmlFor="login-password" 
                      className="text-sm font-medium text-slate-300 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Contraseña
                    </label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-400/50 focus:ring-blue-400/20"
                      required
                    />
                  </div>

                  {signInState.error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-200">
                        {signInState.error}
                      </p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 hover:scale-[1.02]" 
                    disabled={signInPending}
                  >
                    {signInPending ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Ingresando...
                      </span>
                    ) : (
                      'Iniciar sesión'
                    )}
                  </Button>
                </form>

                {/* Link para recuperar contraseña */}
                <div className="text-center">
                  <button
                    onClick={() => setShowReset(true)}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors underline-offset-4 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Formulario de recuperación */}
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-semibold text-white">Recuperar contraseña</h2>
                    <p className="text-sm text-slate-400">
                      Ingresa tu correo y te enviaremos un enlace de recuperación
                    </p>
                  </div>

                  <form action={resetFormAction} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="reset-email" className="text-sm font-medium text-slate-300">
                        Correo electrónico
                      </label>
                      <Input
                        id="reset-email"
                        name="email"
                        type="email"
                        placeholder="doctor@clinica.com"
                        autoComplete="email"
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-400/50 focus:ring-blue-400/20"
                        required
                      />
                    </div>

                    {resetState.error && (
                      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-red-200">{resetState.error}</p>
                      </div>
                    )}

                    {resetState.message && (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-start gap-3">
                        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-emerald-200">{resetState.message}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={() => setShowReset(false)}
                        variant="outline"
                        className="flex-1 h-12 border-white/10 hover:bg-white/5"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        disabled={resetPending}
                      >
                        {resetPending ? 'Enviando...' : 'Enviar enlace'}
                      </Button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>

          {/* Footer del card */}
          <div className="border-t border-white/10 bg-white/[0.01] px-8 py-4">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Conexión segura • Cifrado de extremo a extremo</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600">
          CRM Urología © 2025 • Desarrollado con Next.js y Supabase
        </p>
      </div>
    </div>
  )
}
