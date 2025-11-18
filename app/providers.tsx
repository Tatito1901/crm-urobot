'use client'

import { ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { TooltipProvider } from '@/components/ui/tooltip'

const swrConfig = {
  // ✅ Configuración optimizada para reducir llamadas a API
  dedupingInterval: 60000, // No duplicar llamadas en 1 minuto (antes 10s)
  focusThrottleInterval: 60000, // Throttle de 1 minuto al volver al tab (antes 5s)
  revalidateOnFocus: false, // ❌ Deshabilitar revalidación automática en focus
  revalidateOnReconnect: false, // ❌ Deshabilitar revalidación automática en reconexión
  revalidateIfStale: false, // ❌ No revalidar data "stale" automáticamente
  shouldRetryOnError: true,
  errorRetryCount: 2, // Reducir reintentos de 3 a 2
  errorRetryInterval: 10000, // Aumentar intervalo entre reintentos
  
  // Handler de errores global
  onError: (error: Error, key: string) => {
    console.error('SWR Error:', key, error)
    // Aquí puedes agregar notificaciones o enviar a un servicio de monitoring
  },
  
  // Fetcher global por defecto
  fetcher: (resource: string, init?: RequestInit) => 
    fetch(resource, init).then(res => res.json()),
}

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SWRConfig value={swrConfig}>
      <TooltipProvider delayDuration={200}>
        {children}
      </TooltipProvider>
    </SWRConfig>
  )
}
