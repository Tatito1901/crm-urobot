'use client'

import { ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { localStorageProvider } from '@/lib/swr-config'

/**
 * ============================================================
 * CONFIGURACIÓN GLOBAL SWR - OPTIMIZADA PARA AHORRO DE API
 * ============================================================
 * 
 * ESTRATEGIA:
 * 1. Cache persistente en localStorage (sobrevive recargas)
 * 2. Deduplicación agresiva (15 min)
 * 3. NO revalidación automática (solo manual o Realtime)
 * 4. Retry mínimo para no saturar en errores
 */
const swrConfig = {
  // ✅ Cache persistente en localStorage
  provider: localStorageProvider,
  
  // ✅ Deduplicación agresiva: 15 minutos
  dedupingInterval: 15 * 60 * 1000,
  
  // ✅ Throttle al volver al tab: 5 minutos mínimo
  focusThrottleInterval: 5 * 60 * 1000,
  
  // ❌ NO revalidar automáticamente (ahorro masivo)
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  
  // ✅ Mantener datos previos (UX sin parpadeos)
  keepPreviousData: true,
  
  // ✅ Retry mínimo (1 intento, esperar 5s)
  shouldRetryOnError: true,
  errorRetryCount: 1,
  errorRetryInterval: 5000,
  
  // Handler de errores (solo dev)
  onError: (error: Error, key: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[SWR]', key, error.message)
    }
  },
}

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <SWRConfig value={swrConfig}>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </TooltipProvider>
      </SWRConfig>
    </ThemeProvider>
  )
}
