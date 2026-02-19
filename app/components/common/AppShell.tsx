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
    return null
  }

  return (
    <div className="flex min-h-screen w-full bg-background relative">
      <RouteProgress />
      {/* Subtle noise texture for depth */}
      <div className="pointer-events-none fixed inset-0 noise-overlay z-0" aria-hidden />
      <Suspense fallback={<div className="hidden lg:block lg:w-60 xl:w-72 2xl:w-80 shrink-0" />}>
        <Sidebar />
      </Suspense>
      <div className="relative z-[1] flex min-h-screen flex-1 flex-col min-w-0">
        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-16 lg:pb-0">{children}</main>
        <Suspense fallback={<div className="h-16 lg:hidden" />}>
          <BottomNav />
        </Suspense>
      </div>
    </div>
  )
}
