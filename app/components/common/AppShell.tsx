'use client'

import { usePathname } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import { usePrefetchRoutes } from '@/hooks/usePrefetchRoutes'

import { BottomNav, MobileSidebar, Sidebar } from './Sidebar'

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
    <div className="flex min-h-screen bg-urobot">
      <MobileSidebar />
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">{children}</main>
        <BottomNav />
      </div>
    </div>
  )
}
