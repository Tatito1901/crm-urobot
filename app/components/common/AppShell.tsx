'use client'

import { usePathname } from 'next/navigation'
import { lazy, Suspense, type PropsWithChildren } from 'react'
import { usePrefetchRoutes } from '@/hooks/usePrefetchRoutes'

// Lazy loading de componentes pesados para optimizar carga inicial
const Sidebar = lazy(() => import('./Sidebar').then(mod => ({ default: mod.Sidebar })))
const BottomNav = lazy(() => import('./Sidebar').then(mod => ({ default: mod.BottomNav })))

const AUTH_PREFIX = '/auth'
const AGENDA_PREFIX = '/agenda'

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname() ?? ''
  const isAuthRoute = pathname.startsWith(AUTH_PREFIX)
  const isAgendaRoute = pathname.startsWith(AGENDA_PREFIX)

  // ✅ OPTIMIZACIÓN: Prefetch inteligente de rutas probables
  usePrefetchRoutes()

  if (isAuthRoute || isAgendaRoute) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      <Suspense fallback={<div className="hidden lg:block lg:w-60 xl:w-72 2xl:w-80 shrink-0" />}>
        <Sidebar />
      </Suspense>
      <div className="flex min-h-screen flex-1 flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-16 lg:pb-0">{children}</main>
        <Suspense fallback={<div className="h-16 lg:hidden" />}>
          <BottomNav />
        </Suspense>
      </div>
    </div>
  )
}
