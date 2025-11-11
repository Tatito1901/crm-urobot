'use client'

import { useMemo } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { useLeadsOptimized } from '@/hooks/useLeadsOptimized'
import { useConsultasOptimized } from '@/hooks/useConsultasOptimized'
import { useRecordatoriosOptimized } from '@/hooks/useRecordatoriosOptimized'
import { MetricCard } from '@/app/components/analytics/MetricCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/crm/ui'
import { formatDate, STATE_COLORS } from '@/app/lib/crm-data'
import { AlertCircle, TrendingUp, TrendingDown, Users, Calendar, Bell, AlertTriangle } from 'lucide-react'

export default function DashboardOptimizedPage() {
  // Hooks optimizados con SWR
  const { metrics, loading: loadingMetrics, refresh: refreshMetrics } = useDashboard()
  const { leads, loading: loadingLeads, totalCount: totalLeads } = useLeadsOptimized()
  const { consultas, consultasHoy, stats: consultasStats, loading: loadingConsultas } = useConsultasOptimized({ 
    realtime: true // Activar real-time para consultas
  })
  const { recordatorios, stats: recordatoriosStats, loading: loadingRecordatorios } = useRecordatoriosOptimized({ 
    polling: true // Activar polling para recordatorios
  })
  
  // Métricas principales
  const mainMetrics = useMemo(() => {
    if (!metrics) return []
    
    return [
      {
        title: 'Leads Activos',
        value: metrics.leads_activos.toLocaleString('es-MX'),
        subtitle: `${metrics.leads_hoy} hoy · ${metrics.leads_calientes} calientes`,
        icon: '👥',
        color: 'blue' as const,
        trend: metrics.leads_hoy > 0 ? { value: metrics.leads_hoy, isPositive: true } : undefined,
        urgent: metrics.leads_calientes > 5
      },
      {
        title: 'Consultas Hoy',
        value: metrics.consultas_hoy.toLocaleString('es-MX'),
        subtitle: `${metrics.consultas_semana} esta semana`,
        icon: '📅',
        color: 'green' as const,
        trend: metrics.consultas_sin_confirmar > 0 ? { 
          value: metrics.consultas_sin_confirmar, 
          isPositive: false,
          label: 'sin confirmar' 
        } : undefined
      },
      {
        title: 'Recordatorios',
        value: metrics.recordatorios_vencidos.toLocaleString('es-MX'),
        subtitle: `${metrics.recordatorios_proxima_hora} próxima hora`,
        icon: '⏰',
        color: metrics.recordatorios_vencidos > 0 ? 'red' as const : 'blue' as const,
        urgent: metrics.recordatorios_vencidos > 0
      },
      {
        title: 'Escalamientos',
        value: metrics.escalamientos_urgentes.toLocaleString('es-MX'),
        subtitle: `${metrics.escalamientos_pendientes} pendientes`,
        icon: '🚨',
        color: metrics.escalamientos_urgentes > 0 ? 'red' as const : 'blue' as const,
        urgent: metrics.escalamientos_urgentes > 0
      },
    ]
  }, [metrics])
  
  // Leads recientes (últimos 5)
  const recentLeads = useMemo(() => {
    return leads.slice(0, 5)
  }, [leads])
  
  // Recordatorios urgentes
  const recordatoriosUrgentes = useMemo(() => {
    return recordatorios
      .filter(r => r.is_due)
      .slice(0, 5)
  }, [recordatorios])
  
  // Loading state
  if (loadingMetrics && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white/60">Cargando dashboard...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#03060f] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header con botón de refresh */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard Optimizado</h1>
            <p className="text-white/60 mt-1">
              Datos en tiempo real con caché y optimización
            </p>
          </div>
          
          <button
            onClick={() => refreshMetrics()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>
        
        {/* Alertas urgentes */}
        {metrics && (metrics.recordatorios_vencidos > 0 || metrics.escalamientos_urgentes > 0) && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-400">Atención requerida</p>
              <p className="text-sm text-white/60 mt-1">
                {metrics.recordatorios_vencidos > 0 && `${metrics.recordatorios_vencidos} recordatorios vencidos`}
                {metrics.recordatorios_vencidos > 0 && metrics.escalamientos_urgentes > 0 && ' · '}
                {metrics.escalamientos_urgentes > 0 && `${metrics.escalamientos_urgentes} escalamientos urgentes`}
              </p>
            </div>
          </div>
        )}
        
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainMetrics.map((metric) => (
            <div 
              key={metric.title}
              className={`bg-white/[0.03] border ${metric.urgent ? 'border-red-500/30 animate-pulse' : 'border-white/10'} rounded-xl p-6`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{metric.icon}</span>
                {metric.trend && (
                  <div className={`flex items-center gap-1 text-sm ${metric.trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {metric.trend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{metric.trend.value}</span>
                    {metric.trend.label && <span className="text-xs text-white/40 ml-1">{metric.trend.label}</span>}
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-3xl font-bold mb-1">{metric.value}</p>
                <p className="text-sm text-white/60">{metric.title}</p>
                {metric.subtitle && (
                  <p className="text-xs text-white/40 mt-2">{metric.subtitle}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Grid de contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads recientes */}
          <Card className="bg-white/[0.03] border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Leads Recientes</CardTitle>
                  <CardDescription>Últimos contactos ingresados</CardDescription>
                </div>
                <Badge label={`${totalLeads} totales`} variant="outline" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingLeads ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-white/5 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : recentLeads.length === 0 ? (
                <p className="text-center text-white/40 py-8">No hay leads registrados</p>
              ) : (
                recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white">{lead.nombre_completo}</p>
                      <div className="flex items-center gap-2 text-xs text-white/50 mt-1">
                        <span>{lead.telefono_whatsapp}</span>
                        <span>·</span>
                        <span>{lead.fuente_lead}</span>
                        <span>·</span>
                        <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge label={lead.temperatura} tone={
                        lead.temperatura === 'Caliente' ? 'red' :
                        lead.temperatura === 'Tibio' ? 'yellow' : 'blue'
                      } />
                      <Badge label={lead.estado} variant="outline" />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          
          {/* Recordatorios vencidos */}
          <Card className="bg-white/[0.03] border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Recordatorios Urgentes</CardTitle>
                  <CardDescription>Requieren atención inmediata</CardDescription>
                </div>
                {recordatoriosStats.vencidos > 0 && (
                  <Badge label={`${recordatoriosStats.vencidos} vencidos`} tone="red" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingRecordatorios ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-white/5 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : recordatoriosUrgentes.length === 0 ? (
                <div className="text-center py-8 text-white/40">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay recordatorios vencidos</p>
                </div>
              ) : (
                recordatoriosUrgentes.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-lg border border-red-500/20 bg-red-500/5 p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {rec.consultas?.pacientes?.nombre_completo}
                        </p>
                        <div className="text-xs text-white/50 mt-1">
                          <p>Tipo: {rec.tipo} · Sede: {rec.consultas?.sede}</p>
                          <p className="text-red-400 mt-1">{rec.tiempo_restante}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => rec.marcarComoEnviado?.(rec.id)}
                        className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 rounded transition-colors"
                      >
                        Marcar enviado
                      </button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          
          {/* Consultas de hoy */}
          <Card className="bg-white/[0.03] border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Consultas de Hoy</CardTitle>
                  <CardDescription>Agenda del día</CardDescription>
                </div>
                <Badge label={`${consultasHoy.length} consultas`} variant="outline" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingConsultas ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-white/5 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : consultasHoy.length === 0 ? (
                <div className="text-center py-8 text-white/40">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay consultas programadas para hoy</p>
                </div>
              ) : (
                consultasHoy.map((consulta) => (
                  <div
                    key={consulta.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white">
                        {consulta.pacientes?.nombre_completo}
                      </p>
                      <div className="text-xs text-white/50 mt-1">
                        <p>{consulta.hora_consulta} · {consulta.sede}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {consulta.confirmado_paciente ? (
                        <Badge label="Confirmada" tone="green" />
                      ) : (
                        <Badge label="Por confirmar" tone="yellow" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          
          {/* Estadísticas rápidas */}
          <Card className="bg-white/[0.03] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Estadísticas Rápidas</CardTitle>
              <CardDescription>Resumen del día</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Tasa de confirmación</span>
                  <span className="font-medium">
                    {consultasStats.total > 0 
                      ? `${Math.round((consultasStats.confirmadas / consultasStats.total) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Consultas sin confirmar</span>
                  <span className="font-medium text-yellow-400">{consultasStats.sinConfirmar}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Recordatorios próxima hora</span>
                  <span className="font-medium">{recordatoriosStats.proximaHora}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Recordatorios próximas 3h</span>
                  <span className="font-medium">{recordatoriosStats.proximas3Horas}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Total leads activos</span>
                  <span className="font-medium">{totalLeads}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Footer con información de actualización */}
        <div className="text-center text-xs text-white/40">
          <p>
            Última actualización: {metrics?.calculated_at 
              ? new Date(metrics.calculated_at).toLocaleString('es-MX')
              : 'Nunca'
            }
          </p>
          <p className="mt-1">
            Dashboard con caché SWR · Real-time en consultas · Polling en recordatorios
          </p>
        </div>
      </div>
    </div>
  )
}
