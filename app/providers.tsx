'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { SWRConfig, useSWRConfig } from 'swr'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { localStorageProvider, registerSWRCache } from '@/lib/swr-config'

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

/**
 * Registra la referencia al cache de SWR para invalidación centralizada.
 * Debe ser hijo de SWRConfig para acceder a cache y mutate.
 */
function SWRCacheRegistrar({ children }: { children: ReactNode }) {
  const { cache, mutate } = useSWRConfig()
  const registered = useRef(false)

  useEffect(() => {
    if (!registered.current) {
      registerSWRCache(
        cache as unknown as Map<string, unknown>,
        (key: string) => mutate(key)
      )
      registered.current = true
    }
  }, [cache, mutate])

  return <>{children}</>
}

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <SWRConfig value={swrConfig}>
        <SWRCacheRegistrar>
          <TooltipProvider delayDuration={200}>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </TooltipProvider>
        </SWRCacheRegistrar>
      </SWRConfig>
    </ThemeProvider>
  )
}
