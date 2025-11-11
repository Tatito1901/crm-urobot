# ⚡ Guía de Fetching Eficiente para CRM-UROBOT

## 🎯 Principios Fundamentales

### Reglas de Oro
1. **Never fetch on every render** - useEffect con deps correctas
2. **Cache aggressively** - SWR o React Query
3. **Paginate everything** - Límites de 20-50 items
4. **Aggregate on server** - Views y funciones SQL
5. **Real-time only for critical** - Solo alertas urgentes
6. **Debounce user input** - 300-500ms en búsquedas

### Pirámide de Prioridades

```
┌─────────────────────┐
│  Real-time          │  Escalamientos urgentes
├─────────────────────┤
│  Polling 30s        │  Dashboard principal
├─────────────────────┤
│  On-demand          │  Tablas y listas
├─────────────────────┤
│  Caché (SWR)        │  Todo lo demás
└─────────────────────┘
```

---

## 🗄️ Vistas Materializadas

### 1. Dashboard Principal

```sql
CREATE OR REPLACE VIEW public.vw_dashboard_metrics AS
SELECT 
  (SELECT COUNT(*) FROM leads WHERE estado != 'Convertido') AS leads_activos,
  (SELECT COUNT(*) FROM leads WHERE estado = 'Nuevo' AND created_at > NOW() - INTERVAL '24 hours') AS leads_hoy,
  (SELECT COUNT(*) FROM consultas WHERE fecha_consulta = CURRENT_DATE AND estado_cita IN ('Programada', 'Confirmada')) AS consultas_hoy,
  (SELECT COUNT(*) FROM recordatorios WHERE estado = 'pendiente' AND programado_para <= NOW()) AS recordatorios_vencidos,
  (SELECT COUNT(*) FROM escalamientos WHERE estado = 'pendiente' AND prioridad = 'alta') AS escalamientos_urgentes,
  NOW() AS calculated_at;
```

### 2. Leads con Score

```sql
CREATE OR REPLACE VIEW public.vw_leads_dashboard AS
SELECT 
  l.*,
  CASE 
    WHEN l.ultima_interaccion > NOW() - INTERVAL '1 hour' THEN 'Muy Reciente'
    WHEN l.ultima_interaccion > NOW() - INTERVAL '24 hours' THEN 'Reciente'
    ELSE 'Antiguo'
  END AS antiguedad,
  EXISTS(SELECT 1 FROM consultas WHERE lead_id = l.id AND fecha_hora_utc > NOW()) AS tiene_consulta_futura
FROM public.leads l
WHERE l.estado != 'Convertido'
ORDER BY l.temperatura DESC, l.puntuacion_lead DESC;
```

---

## 🎣 Hooks Optimizados

### 1. Dashboard con SWR

```typescript
// hooks/useDashboard.ts
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR(
    'dashboard',
    async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('vw_dashboard_metrics')
        .select('*')
        .single()
      return data
    },
    {
      refreshInterval: 30000, // 30s
      revalidateOnFocus: true,
      dedupingInterval: 10000
    }
  )
  
  return { metrics: data, error, loading: isLoading, refresh: mutate }
}
```

### 2. Leads con Paginación

```typescript
// hooks/useLeads.ts
import useSWRInfinite from 'swr/infinite'
import { createClient } from '@/lib/supabase/client'

const PAGE_SIZE = 20

export function useLeads() {
  const { data, size, setSize, isLoading } = useSWRInfinite(
    (index) => ['leads', index],
    async ([_, index]) => {
      const supabase = createClient()
      const { data } = await supabase
        .from('vw_leads_dashboard')
        .select('*')
        .range(index * PAGE_SIZE, (index + 1) * PAGE_SIZE - 1)
      return data
    }
  )
  
  const leads = data?.flat() || []
  const hasMore = data?.[data.length - 1]?.length === PAGE_SIZE
  
  return {
    leads,
    hasMore,
    loadMore: () => setSize(size + 1),
    loading: isLoading
  }
}
```

### 3. Consultas con Real-time Selectivo

```typescript
// hooks/useConsultas.ts
import { useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

export function useConsultas(fecha: string, realtime = false) {
  const { data, mutate } = useSWR(
    `consultas-${fecha}`,
    async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('vw_calendario_consultas')
        .select('*')
        .eq('fecha_consulta', fecha)
      return data
    }
  )
  
  useEffect(() => {
    if (!realtime) return
    
    const supabase = createClient()
    const channel = supabase
      .channel('consultas')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'consultas',
        filter: `fecha_consulta=eq.${fecha}`
      }, () => mutate())
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [realtime, fecha, mutate])
  
  return { consultas: data || [], refresh: mutate }
}
```

---

## 💾 Configuración SWR Global

```typescript
// app/providers.tsx
'use client'

import { SWRConfig } from 'swr'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{
      dedupingInterval: 10000,
      focusThrottleInterval: 5000,
      revalidateOnFocus: true,
      shouldRetryOnError: true,
      errorRetryCount: 3
    }}>
      {children}
    </SWRConfig>
  )
}
```

---

## 📊 Componentes Optimizados

### 1. Tabla Virtual

```typescript
// components/LeadsTable.tsx
import { useVirtualizer } from '@tanstack/react-virtual'
import { useLeads } from '@/hooks/useLeads'
import { useRef } from 'react'

export function LeadsTable() {
  const { leads, loadMore, hasMore } = useLeads()
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: leads.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5
  })
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(row => (
          <div
            key={leads[row.index].id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${row.start}px)`
            }}
          >
            <LeadRow lead={leads[row.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 2. Búsqueda con Debounce

```typescript
// components/Search.tsx
import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { createClient } from '@/lib/supabase/client'

export function Search() {
  const [results, setResults] = useState([])
  
  const search = useDebouncedCallback(async (query: string) => {
    if (query.length < 2) return
    
    const supabase = createClient()
    const { data } = await supabase
      .from('leads')
      .select('*')
      .ilike('nombre_completo', `%${query}%`)
      .limit(10)
    
    setResults(data || [])
  }, 500)
  
  return (
    <input
      type="text"
      onChange={(e) => search(e.target.value)}
      placeholder="Buscar..."
    />
  )
}
```

### 3. Métricas con Polling Adaptativo

```typescript
// components/MetricsCard.tsx
import { useDashboard } from '@/hooks/useDashboard'
import { useEffect } from 'react'

export function MetricsCard() {
  const { metrics, refresh } = useDashboard()
  
  // Refresh al volver al tab
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) refresh()
    }
    
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [refresh])
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <Metric label="Leads Hoy" value={metrics?.leads_hoy} />
      <Metric label="Consultas" value={metrics?.consultas_hoy} />
      <Metric label="Recordatorios" value={metrics?.recordatorios_vencidos} />
      <Metric label="Escalamientos" value={metrics?.escalamientos_urgentes} urgent />
    </div>
  )
}
```

---

## ✅ Checklist de Optimización

### Implementación Básica
- [ ] Instalar SWR: `npm install swr`
- [ ] Crear vistas materializadas en Supabase
- [ ] Configurar SWRConfig global
- [ ] Crear hooks base (useDashboard, useLeads, useConsultas)

### Componentes UI
- [ ] Tabla con virtualización
- [ ] Búsqueda con debounce
- [ ] Cards con polling adaptativo
- [ ] Calendario optimizado

### Performance
- [ ] Límites de paginación (20-50 items)
- [ ] Debounce en inputs (500ms)
- [ ] Real-time solo donde sea crítico
- [ ] Prefetch en Server Components

### Monitoring
- [ ] Logs de SWR errors
- [ ] Métricas de cache hit/miss
- [ ] Alertas de queries lentas

---

## 📚 Referencias

- [SWR Documentation](https://swr.vercel.app/)
- [TanStack Virtual](https://tanstack.com/virtual)
- [Supabase Performance](https://supabase.com/docs/guides/database/performance)
