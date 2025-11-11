# 🎨 Componentes Listos para Usar - CRM UROBOT

## 📋 Componentes Incluidos

1. Dashboard Principal
2. Tabla de Leads con Filtros
3. Calendario de Consultas
4. Panel de Recordatorios
5. Alertas de Escalamientos
6. Gráficas de Métricas
7. Barra de Búsqueda Universal

---

## 1️⃣ Dashboard Principal

### Archivo: `app/dashboard/page.tsx`

```typescript
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './dashboard-client'
import { DashboardSkeleton } from '@/components/skeletons'

// Server Component con prefetch
async function getDashboardData() {
  const supabase = createClient()
  
  const [metrics, recentLeads, todayConsultas] = await Promise.all([
    supabase.from('vw_dashboard_metrics').select('*').single(),
    supabase.from('vw_leads_dashboard').select('*').limit(5),
    supabase.from('vw_calendario_consultas').select('*')
      .eq('fecha_consulta', new Date().toISOString().split('T')[0])
  ])
  
  return {
    metrics: metrics.data,
    recentLeads: recentLeads.data || [],
    todayConsultas: todayConsultas.data || []
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard UROBOT</h1>
      
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardClient initialData={data} />
      </Suspense>
    </div>
  )
}
```

### Archivo: `app/dashboard/dashboard-client.tsx`

```typescript
'use client'

import { MetricsCards } from '@/components/dashboard/MetricsCards'
import { RecentLeads } from '@/components/dashboard/RecentLeads'
import { TodaySchedule } from '@/components/dashboard/TodaySchedule'
import { ConversionChart } from '@/components/dashboard/ConversionChart'
import { RecordatoriosAlert } from '@/components/dashboard/RecordatoriosAlert'
import { useDashboard } from '@/hooks/useDashboard'
import { useEffect } from 'react'

interface Props {
  initialData: any
}

export function DashboardClient({ initialData }: Props) {
  const { metrics, refresh } = useDashboard()
  
  // Auto-refresh cada 30s
  useEffect(() => {
    const interval = setInterval(refresh, 30000)
    return () => clearInterval(interval)
  }, [refresh])
  
  return (
    <>
      <RecordatoriosAlert 
        vencidos={metrics?.recordatorios_vencidos || 0}
        urgentes={metrics?.escalamientos_urgentes || 0}
      />
      
      <MetricsCards metrics={metrics || initialData.metrics} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentLeads initialLeads={initialData.recentLeads} />
        <TodaySchedule initialConsultas={initialData.todayConsultas} />
      </div>
      
      <ConversionChart />
    </>
  )
}
```

---

## 2️⃣ Tabla de Leads con Filtros

### Archivo: `components/leads/LeadsTable.tsx`

```typescript
'use client'

import { useState, useMemo } from 'react'
import { useLeads } from '@/hooks/useLeads'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Phone, Mail, Calendar } from 'lucide-react'

export function LeadsTable() {
  const { leads, loadMore, hasMore, loading } = useLeads()
  const [searchQuery, setSearchQuery] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('all')
  const [tempFilter, setTempFilter] = useState('all')
  
  // Filtrado en cliente (idealmente en servidor)
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchSearch = !searchQuery || 
        lead.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.telefono_whatsapp.includes(searchQuery)
      
      const matchEstado = estadoFilter === 'all' || lead.estado === estadoFilter
      const matchTemp = tempFilter === 'all' || lead.temperatura === tempFilter
      
      return matchSearch && matchEstado && matchTemp
    })
  }, [leads, searchQuery, estadoFilter, tempFilter])
  
  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Buscar por nombre o teléfono..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        
        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <option value="all">Todos los estados</option>
          <option value="Nuevo">Nuevo</option>
          <option value="Contactado">Contactado</option>
          <option value="Interesado">Interesado</option>
          <option value="Calificado">Calificado</option>
        </Select>
        
        <Select value={tempFilter} onValueChange={setTempFilter}>
          <option value="all">Todas las temperaturas</option>
          <option value="Caliente">Caliente</option>
          <option value="Tibio">Tibio</option>
          <option value="Frio">Frío</option>
        </Select>
      </div>
      
      {/* Tabla */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Lead</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Contacto</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Temperatura</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Score</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Última Interacción</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{lead.nombre_completo}</p>
                      <p className="text-sm text-gray-500">{lead.fuente_lead}</p>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <a href={`tel:${lead.telefono_whatsapp}`} className="flex items-center gap-1 text-sm hover:underline">
                        <Phone className="w-3 h-3" />
                        {lead.telefono_whatsapp}
                      </a>
                      {lead.tiene_consulta_futura && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <Calendar className="w-3 h-3" />
                          Consulta programada
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <Badge variant="outline">{lead.estado}</Badge>
                  </td>
                  
                  <td className="px-4 py-3">
                    <Badge variant={
                      lead.temperatura === 'Caliente' ? 'destructive' :
                      lead.temperatura === 'Tibio' ? 'warning' : 'secondary'
                    }>
                      {lead.temperatura}
                    </Badge>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600"
                          style={{ width: `${lead.puntuacion_lead}%` }}
                        />
                      </div>
                      <span className="text-sm">{lead.puntuacion_lead}</span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600">{lead.antiguedad}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(lead.ultima_interaccion).toLocaleDateString()}
                    </p>
                  </td>
                  
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost">Ver detalles</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button onClick={loadMore} disabled={loading}>
            {loading ? 'Cargando...' : 'Cargar más'}
          </Button>
        </div>
      )}
      
      {/* Resultados */}
      <p className="text-sm text-gray-500 text-center">
        Mostrando {filteredLeads.length} de {leads.length} leads
      </p>
    </div>
  )
}
```

---

## 3️⃣ Calendario de Consultas

### Archivo: `components/calendar/ConsultasCalendar.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useConsultas } from '@/hooks/useConsultas'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'

export function ConsultasCalendar() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    }
  })
  
  const { consultas } = useConsultas(currentMonth.start, currentMonth.end, true)
  
  const events = consultas.map(c => ({
    id: c.id,
    title: `${c.paciente_nombre} - ${c.sede}`,
    start: c.fecha_hora_utc,
    end: new Date(
      new Date(c.fecha_hora_utc).getTime() + 30 * 60000
    ).toISOString(),
    backgroundColor: c.color,
    borderColor: c.color,
    extendedProps: {
      telefono: c.paciente_telefono,
      estado: c.estado_cita,
      confirmado: c.confirmado_paciente,
      sede: c.sede
    }
  }))
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={esLocale}
        events={events}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        height="auto"
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: '09:00',
          endTime: '20:00'
        }}
        eventClick={(info) => {
          // Modal con detalles
          alert(`
            Paciente: ${info.event.title}
            Estado: ${info.event.extendedProps.estado}
            Confirmado: ${info.event.extendedProps.confirmado ? 'Sí' : 'No'}
          `)
        }}
        datesSet={(dateInfo) => {
          // Actualizar rango cuando cambie el mes
          setCurrentMonth({
            start: dateInfo.start.toISOString().split('T')[0],
            end: dateInfo.end.toISOString().split('T')[0]
          })
        }}
      />
    </div>
  )
}
```

---

## 4️⃣ Panel de Recordatorios

### Archivo: `components/recordatorios/RecordatoriosPanel.tsx`

```typescript
'use client'

import { useRecordatorios } from '@/hooks/useRecordatorios'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, AlertCircle, Phone } from 'lucide-react'

export function RecordatoriosPanel() {
  const { recordatorios, vencidos, loading, refresh } = useRecordatorios()
  
  if (loading) return <RecordatoriosSkeleton />
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Recordatorios
          {vencidos > 0 && (
            <Badge variant="destructive">{vencidos} vencidos</Badge>
          )}
        </h2>
        
        <Button onClick={refresh} size="sm" variant="outline">
          Actualizar
        </Button>
      </div>
      
      {recordatorios.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p>No hay recordatorios pendientes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recordatorios.map((rec) => (
            <div
              key={rec.id}
              className={`border rounded-lg p-4 ${
                rec.is_due ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {rec.is_due && (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <h3 className="font-semibold">{rec.paciente_nombre}</h3>
                    <Badge variant="outline">{rec.tipo}</Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    Consulta: {new Date(rec.consulta_fecha).toLocaleDateString()} - {rec.consulta_sede}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className={rec.is_due ? 'text-red-600 font-medium' : 'text-gray-500'}>
                      {rec.is_due ? 'Vencido' : `En ${Math.floor(rec.hours_until_due)}h`}
                    </span>
                    
                    <span className="text-gray-400">
                      {new Date(rec.programado_para).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Phone className="w-4 h-4 mr-1" />
                    Llamar
                  </Button>
                  <Button size="sm">
                    Enviar ahora
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 5️⃣ Tarjetas de Métricas

### Archivo: `components/dashboard/MetricsCards.tsx`

```typescript
'use client'

import { TrendingUp, TrendingDown, Users, Calendar, Bell, AlertTriangle } from 'lucide-react'

interface Metric {
  label: string
  value: number
  change?: string
  trend?: 'up' | 'down'
  icon: React.ReactNode
  color: string
  urgent?: boolean
}

export function MetricsCards({ metrics }: { metrics: any }) {
  const cards: Metric[] = [
    {
      label: 'Leads Hoy',
      value: metrics?.leads_hoy || 0,
      change: `${metrics?.leads_activos || 0} activos`,
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'blue'
    },
    {
      label: 'Consultas Hoy',
      value: metrics?.consultas_hoy || 0,
      change: `${metrics?.consultas_sin_confirmar || 0} sin confirmar`,
      icon: <Calendar className="w-6 h-6" />,
      color: 'green'
    },
    {
      label: 'Recordatorios',
      value: metrics?.recordatorios_vencidos || 0,
      change: `${metrics?.recordatorios_proxima_hora || 0} próxima hora`,
      icon: <Bell className="w-6 h-6" />,
      color: 'orange',
      urgent: metrics?.recordatorios_vencidos > 0
    },
    {
      label: 'Escalamientos',
      value: metrics?.escalamientos_urgentes || 0,
      change: `${metrics?.escalamientos_pendientes || 0} pendientes`,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'red',
      urgent: metrics?.escalamientos_urgentes > 0
    }
  ]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white rounded-lg shadow p-6 ${
            card.urgent ? 'ring-2 ring-red-500 animate-pulse' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg bg-${card.color}-100`}>
              {card.icon}
            </div>
            
            {card.trend && (
              <div className="flex items-center text-sm">
                {card.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
              </div>
            )}
          </div>
          
          <div>
            <p className="text-3xl font-bold mb-1">{card.value}</p>
            <p className="text-sm text-gray-600">{card.label}</p>
            {card.change && (
              <p className="text-xs text-gray-500 mt-2">{card.change}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## 6️⃣ Gráfica de Conversión

### Archivo: `components/dashboard/ConversionChart.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function ConversionChart() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const supabase = createClient()
    
    supabase
      .from('vw_metricas_conversion')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data) {
          // Agrupar por fecha
          const grouped = data.reduce((acc: any, item: any) => {
            const fecha = item.fecha.split('T')[0]
            const existing = acc.find((x: any) => x.fecha === fecha)
            
            if (existing) {
              existing.total_leads += item.total_leads
              existing.convertidos += item.leads_convertidos
            } else {
              acc.push({
                fecha,
                total_leads: item.total_leads,
                convertidos: item.leads_convertidos,
                tasa: item.tasa_conversion
              })
            }
            
            return acc
          }, [])
          
          setData(grouped)
        }
        setLoading(false)
      })
  }, [])
  
  if (loading) return <div className="h-[300px] animate-pulse bg-gray-100 rounded" />
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Conversión de Leads (Últimos 30 días)</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="fecha" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="total_leads" 
            stroke="#3b82f6" 
            name="Total Leads" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="convertidos" 
            stroke="#10b981" 
            name="Convertidos" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

---

## 7️⃣ Búsqueda Universal

### Archivo: `components/search/UniversalSearch.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { createClient } from '@/lib/supabase/client'
import { Search, User, Calendar, Phone } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function UniversalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  
  const search = useDebouncedCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }
    
    setLoading(true)
    const supabase = createClient()
    
    const [leads, pacientes, consultas] = await Promise.all([
      supabase
        .from('leads')
        .select('id, nombre_completo, telefono_whatsapp, estado')
        .or(`nombre_completo.ilike.%${searchQuery}%,telefono_whatsapp.ilike.%${searchQuery}%`)
        .limit(5),
      
      supabase
        .from('pacientes')
        .select('id, nombre_completo, telefono')
        .ilike('nombre_completo', `%${searchQuery}%`)
        .limit(5),
      
      supabase
        .from('consultas')
        .select('id, consulta_id, pacientes(nombre_completo)')
        .ilike('consulta_id', `%${searchQuery}%`)
        .limit(5)
    ])
    
    const combined = [
      ...(leads.data || []).map(item => ({ ...item, type: 'lead' })),
      ...(pacientes.data || []).map(item => ({ ...item, type: 'paciente' })),
      ...(consultas.data || []).map(item => ({ ...item, type: 'consulta' }))
    ]
    
    setResults(combined)
    setLoading(false)
    setOpen(true)
  }, 300)
  
  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar leads, pacientes, consultas..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            search(e.target.value)
          }}
          className="pl-10"
        />
      </div>
      
      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-auto">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              className="w-full px-4 py-3 hover:bg-gray-50 text-left border-b last:border-b-0"
              onClick={() => {
                // Navegar al detalle
                setOpen(false)
                setQuery('')
              }}
            >
              <div className="flex items-center gap-3">
                {result.type === 'lead' && <User className="w-4 h-4 text-blue-600" />}
                {result.type === 'paciente' && <User className="w-4 h-4 text-green-600" />}
                {result.type === 'consulta' && <Calendar className="w-4 h-4 text-purple-600" />}
                
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {result.nombre_completo || result.pacientes?.nombre_completo || result.consulta_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {result.type === 'lead' && `Lead - ${result.estado}`}
                    {result.type === 'paciente' && `Paciente - ${result.telefono}`}
                    {result.type === 'consulta' && 'Consulta'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 📦 Instalación de Dependencias

```bash
# Core
npm install swr @tanstack/react-virtual use-debounce

# Calendar
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction

# Charts
npm install recharts

# UI (si usas shadcn/ui)
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input select badge
```

---

## 🚀 Uso Rápido

1. **Copiar vistas SQL** a Supabase (del archivo 09)
2. **Copiar hooks** a `/hooks`
3. **Copiar componentes** a `/components`
4. **Configurar SWR** en providers
5. **Importar en páginas**

```typescript
// app/dashboard/page.tsx
import { LeadsTable } from '@/components/leads/LeadsTable'
import { ConsultasCalendar } from '@/components/calendar/ConsultasCalendar'
import { RecordatoriosPanel } from '@/components/recordatorios/RecordatoriosPanel'

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <LeadsTable />
      <ConsultasCalendar />
      <RecordatoriosPanel />
    </div>
  )
}
```

¡Listo para usar! 🎉
