'use client'

import { ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/providers/theme-provider'

/**
 * Configuración global SWR - Base conservadora
 * Los hooks individuales pueden hacer override con configs más específicas
 * 
 * IMPORTANTE: Esta config aplica como fallback para hooks sin config propia
 */
const swrConfig = {
  // ✅ Deduplicación: Previene múltiples requests al mismo endpoint
  dedupingInterval: 5 * 60 * 1000, // 5 minutos - sincronizado con hooks
  
  // ✅ Throttle: Limita frecuencia de revalidación al volver al tab
  focusThrottleInterval: 60 * 1000, // 1 minuto mínimo entre revalidaciones
  
  // ✅ Comportamiento conservador por defecto (hooks pueden override)
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  
  // ✅ Mantener datos previos para evitar parpadeos
  keepPreviousData: true,
  
  // ✅ Retry con backoff para errores de red
  shouldRetryOnError: true,
  errorRetryCount: 2,
  errorRetryInterval: 5000,
  
  // Handler de errores global (para monitoring)
  onError: (error: Error, key: string) => {
    // Solo loguear en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('SWR Error:', key, error.message)
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
        </TooltipProvider>
      </SWRConfig>
    </ThemeProvider>
  )
}
