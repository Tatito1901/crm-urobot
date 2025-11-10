'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { initialAuthState, type AuthFormState } from './state'
import { resetPasswordAction, signInAction, signUpAction } from './actions'

const TAB_TRIGGER_CLASSES =
  'rounded-lg px-4 py-2 text-sm font-medium transition data-[state=active]:bg-white data-[state=active]:text-[#0b1120] data-[state=inactive]:text-white/60'

export default function AuthPage() {
  const router = useRouter()
  const [signInState, signInFormAction, signInPending] = useActionState<AuthFormState, FormData>(
    signInAction,
    initialAuthState,
  )
  const [signUpState, signUpFormAction, signUpPending] = useActionState<AuthFormState, FormData>(
    signUpAction,
    initialAuthState,
  )
  const [resetState, resetFormAction, resetPending] = useActionState<AuthFormState, FormData>(
    resetPasswordAction,
    initialAuthState,
  )

  // Redirigir al dashboard cuando la autenticación sea exitosa
  useEffect(() => {
    if (signInState.success || signUpState.success) {
      router.push('/dashboard')
      router.refresh()
    }
  }, [signInState.success, signUpState.success, router])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#101c3b,_#02040a_70%)] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg space-y-6 rounded-3xl border border-white/10 bg-white/5 px-8 py-10 shadow-2xl shadow-black/20 backdrop-blur">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">CRM médico</p>
          <h1 className="mt-2 text-3xl font-semibold">Bienvenido de nuevo</h1>
          <p className="mt-2 text-sm text-white/60">
            Gestiona leads, pacientes y consultas en una sola plataforma.
          </p>
        </header>

        <Tabs defaultValue="login" className="space-y-6">
          <TabsList className="grid grid-cols-2 gap-2 rounded-xl bg-white/10 p-2">
            <TabsTrigger className={TAB_TRIGGER_CLASSES} value="login">
              Iniciar sesión
            </TabsTrigger>
            <TabsTrigger className={TAB_TRIGGER_CLASSES} value="register">
              Crear cuenta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form action={signInFormAction} className="space-y-4">
              <Input
                name="email"
                type="email"
                placeholder="Correo corporativo"
                autoComplete="email"
                required
              />
              <Input
                name="password"
                type="password"
                placeholder="Contraseña"
                autoComplete="current-password"
                required
              />
              {signInState.error ? (
                <p className="rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-sm text-rose-100">
                  {signInState.error}
                </p>
              ) : null}
              <Button type="submit" className="w-full" disabled={signInPending}>
                {signInPending ? 'Ingresando…' : 'Entrar'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form action={signUpFormAction} className="space-y-4">
              <Input name="email" type="email" placeholder="Correo institucional" required />
              <Input
                name="password"
                type="password"
                placeholder="Contraseña segura"
                minLength={8}
                required
              />
              {signUpState.error ? (
                <p className="rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-sm text-rose-100">
                  {signUpState.error}
                </p>
              ) : null}
              <Button type="submit" className="w-full" variant="secondary" disabled={signUpPending}>
                {signUpPending ? 'Creando cuenta…' : 'Registrarme'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">¿Olvidaste tu contraseña?</p>
          <form action={resetFormAction} className="flex flex-col gap-3 sm:flex-row">
            <Input
              name="email"
              type="email"
              placeholder="Correo registrado"
              autoComplete="email"
              className="flex-1"
              required
            />
            <Button
              type="submit"
              variant="outline"
              className="whitespace-nowrap"
              disabled={resetPending}
            >
              {resetPending ? 'Enviando…' : 'Recuperar acceso'}
            </Button>
          </form>
          {resetState.error ? (
            <p className="rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-xs text-rose-100">
              {resetState.error}
            </p>
          ) : null}
          {resetState.message ? (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
              {resetState.message}
            </p>
          ) : null}
        </section>

        <footer className="text-center text-xs text-white/40">
          Acceso seguro con Supabase • Sesiones cifradas y monitoreo en tiempo real
        </footer>
      </div>
    </div>
  )
}
