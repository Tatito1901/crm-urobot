'use client'

import { usePathname, useRouter } from 'next/navigation'
import { lazy, Suspense, useEffect, useState, type PropsWithChildren } from 'react'
import { usePrefetchRoutes } from '@/hooks/common/usePrefetchRoutes'
import { createClient } from '@/lib/supabase/client'
import { RouteProgress } from './RouteProgress'

// Lazy loading de componentes pesados para optimizar carga inicial
const Sidebar = lazy(() => import('./Sidebar').then(mod => ({ default: mod.Sidebar })))
const BottomNav = lazy(() => import('./Sidebar').then(mod => ({ default: mod.BottomNav })))

const AUTH_PREFIX = '/auth'
const AGENDA_PREFIX = '/agenda'

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname() ?? ''
  const router = useRouter()
  const isAuthRoute = pathname.startsWith(AUTH_PREFIX)
  const isAgendaRoute = pathname.startsWith(AGENDA_PREFIX)
  const isPublicRoute = isAuthRoute || isAgendaRoute
  const [authChecked, setAuthChecked] = useState(isPublicRoute)

  // ✅ OPTIMIZACIÓN: Prefetch inteligente de rutas probables
  usePrefetchRoutes()

  // Auth guard — redirigir a /auth si no hay sesión
  useEffect(() => {
    if (isPublicRoute) {
      setAuthChecked(true)
      return
    }
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/auth')
      } else {
        setAuthChecked(true)
      }
    })
  }, [pathname, isPublicRoute, router])

  if (isAuthRoute || isAgendaRoute) {
    return <>{children}</>
  }

  if (!authChecked) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="relative text-center space-y-4">
          <div className="relative mx-auto h-12 w-12">
            <div className="absolute inset-0 rounded-full border border-teal-400/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-2 rounded-full border border-teal-400/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_12px_2px] shadow-teal-400/40" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-[0.2em]">Verificando sesión</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-background relative overflow-hidden">
      <RouteProgress />
      {/* Atmospheric layers for depth */}
      <div className="ambient-mesh" aria-hidden />
      <div className="pointer-events-none fixed inset-0 noise-overlay z-0" aria-hidden />
      <Suspense fallback={<div className="hidden lg:block lg:w-60 xl:w-72 2xl:w-80 shrink-0 h-full" />}>
        <Sidebar />
      </Suspense>
      <div className="relative z-[1] flex h-full flex-1 flex-col min-w-0">
        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-safe-bottom lg:pb-0">{children}</main>
        <Suspense fallback={<div className="h-16 lg:hidden shrink-0" />}>
          <BottomNav />
        </Suspense>
      </div>
    </div>
  )
}
