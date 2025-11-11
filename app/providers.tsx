'use client'

import { ReactNode } from 'react'
import { SWRConfig } from 'swr'

const swrConfig = {
  // Configuración global de caché
  dedupingInterval: 10000, // No duplicar llamadas en 10s
  focusThrottleInterval: 5000, // Throttle al volver al tab
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  
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
      {children}
    </SWRConfig>
  )
}
