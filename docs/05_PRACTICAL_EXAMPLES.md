# 🎯 Ejemplos Prácticos

## Ejemplo 1: Crear Lead desde WhatsApp

```typescript
async function crearLeadDesdeWhatsApp(
  nombre: string,
  telefono: string,
  mensaje: string,
  messageId: string
) {
  // 1. Crear/actualizar lead
  const { data: leadResult } = await supabase.rpc('upsert_lead_interaction', {
    p_nombre_completo: nombre,
    p_telefono_whatsapp: telefono,
    p_fuente_lead: 'WhatsApp',
    p_estado: 'Nuevo',
    p_notas_iniciales: `Primer mensaje: ${mensaje.substring(0, 100)}`,
    p_message_id: messageId
  })

  if (!leadResult?.success) {
    throw new Error(leadResult?.error || 'Error creando lead')
  }

  // 2. Registrar el mensaje
  await supabase.rpc('registrar_mensaje_conversacion', {
    p_lead_id: leadResult.lead_uuid,
    p_mensaje_id: messageId,
    p_es_bot: false,
    p_contenido: mensaje,
    p_tipo_mensaje: 'texto'
  })

  return leadResult
}

// Uso
const result = await crearLeadDesdeWhatsApp(
  'Juan Pérez',
  '+52 624 123 4567',
  'Hola, quisiera información sobre consultas',
  'wamid.12345'
)
```

## Ejemplo 2: Agendar Consulta desde Calendar

```typescript
async function agendarConsultaDesdeCalendar(
  eventData: GoogleCalendarEvent
) {
  const fechaHora = new Date(eventData.start.dateTime)
  
  const { data, error } = await supabase.rpc(
    'upsert_appointment_atomic_from_calendar',
    {
      p_paciente_id: eventData.attendees[0].id || `PAC-${Date.now()}`,
      p_nombre_completo: eventData.attendees[0].displayName,
      p_telefono: eventData.attendees[0].phoneNumber,
      p_email: eventData.attendees[0].email,
      p_consulta_id: `CONS-${Date.now()}`,
      p_sede: eventData.location === 'Hermosillo' ? 'HERMOSILLO' : 'NOGALES',
      p_tipo_cita: 'primera_vez',
      p_motivo_consulta: eventData.summary || 'Consulta general',
      p_duracion_minutos: 30,
      p_fecha_hora_utc: fechaHora.toISOString(),
      p_fecha_consulta: fechaHora.toISOString().split('T')[0],
      p_hora_consulta: fechaHora.toTimeString().split(' ')[0],
      p_calendar_event_id: eventData.id,
      p_calendar_link: eventData.htmlLink,
      p_operation_id: `op-${Date.now()}`,
      p_idempotency_key: `idem-${eventData.id}`
    }
  )

  if (data?.success) {
    console.log('✅ Consulta creada:', data.consulta_uuid)
    console.log(`📅 Recordatorios creados automáticamente`)
  }

  return data
}
```

## Ejemplo 3: Procesar Recordatorios (Cron Job)

```typescript
async function procesarRecordatoriosPendientes() {
  // 1. Claim recordatorios listos
  const { data: recordatorios } = await supabase.rpc('claim_due_recordatorios', {
    p_limit: 50
  })

  if (!recordatorios || recordatorios.length === 0) {
    console.log('No hay recordatorios pendientes')
    return
  }

  console.log(`📨 Procesando ${recordatorios.length} recordatorios...`)

  // 2. Procesar cada uno
  for (const rec of recordatorios) {
    try {
      // Obtener datos de la consulta y paciente
      const { data: consulta } = await supabase
        .from('consultas')
        .select('*, pacientes(*)')
        .eq('id', rec.consulta_id)
        .single()

      // Generar mensaje según tipo
      const mensaje = generarMensajeRecordatorio(rec.tipo, consulta)

      // Enviar por WhatsApp
      await enviarWhatsApp(consulta.pacientes.telefono, mensaje)

      // Marcar como enviado
      await supabase.rpc('mark_recordatorio_enviado', {
        p_recordatorio_id: rec.id,
        p_mensaje: mensaje,
        p_entregado: true
      })

      console.log(`✅ Enviado: ${rec.tipo} para ${consulta.pacientes.nombre_completo}`)
    } catch (error) {
      // Marcar como error
      await supabase
        .from('recordatorios')
        .update({
          estado: 'error',
          error_mensaje: error.message,
          intentos: rec.intentos + 1
        })
        .eq('id', rec.id)

      console.error(`❌ Error: ${error.message}`)
    }
  }
}

function generarMensajeRecordatorio(tipo: string, consulta: any): string {
  const { pacientes, fecha_consulta, hora_consulta, sede } = consulta
  const nombre = pacientes.nombre_completo.split(' ')[0]

  switch (tipo) {
    case 'confirmacion_inicial':
      return `Hola ${nombre}, tu consulta está programada para el ${fecha_consulta} a las ${hora_consulta} en ${sede}. Por favor confirma tu asistencia.`
    case 'recordatorio_48h':
      return `Hola ${nombre}, te recordamos tu consulta en 48 horas. ¿Confirmas tu asistencia?`
    case 'recordatorio_24h':
      return `Hola ${nombre}, tu consulta es mañana a las ${hora_consulta} en ${sede}.`
    case 'recordatorio_3h':
      return `Hola ${nombre}, tu consulta es en 3 horas. Te esperamos!`
    default:
      return `Recordatorio de consulta`
  }
}
```

## Ejemplo 4: Dashboard de Leads

```typescript
async function obtenerDashboardLeads() {
  // Obtener todos los leads
  const { data: leads } = await supabase
    .from('leads')
    .select('*')

  if (!leads) return null

  // Calcular métricas
  const dashboard = {
    total: leads.length,
    porEstado: {} as Record<string, number>,
    porTemperatura: {} as Record<string, number>,
    promedioScore: 0,
    conversionRate: 0
  }

  leads.forEach(lead => {
    // Contar por estado
    dashboard.porEstado[lead.estado] = (dashboard.porEstado[lead.estado] || 0) + 1
    
    // Contar por temperatura
    dashboard.porTemperatura[lead.temperatura] = (dashboard.porTemperatura[lead.temperatura] || 0) + 1
    
    // Sumar scores
    dashboard.promedioScore += lead.puntuacion_lead
  })

  // Calcular promedios y rates
  dashboard.promedioScore = dashboard.promedioScore / leads.length
  dashboard.conversionRate = (dashboard.porEstado['Convertido'] || 0) / leads.length * 100

  return dashboard
}

// Uso
const dashboard = await obtenerDashboardLeads()
console.log('📊 Dashboard:', dashboard)
// {
//   total: 150,
//   porEstado: { Nuevo: 50, Interesado: 40, Convertido: 30, ... },
//   porTemperatura: { Frio: 60, Tibio: 50, Caliente: 40 },
//   promedioScore: 45.5,
//   conversionRate: 20
// }
```

## Ejemplo 5: Actualizar Temperatura de Lead con IA

```typescript
async function actualizarTemperaturaConIA(leadId: string) {
  // 1. Obtener historial de conversaciones
  const { data: lead } = await supabase
    .from('leads')
    .select(`
      *,
      conversaciones(*)
    `)
    .eq('id', leadId)
    .single()

  if (!lead) return

  // 2. Analizar con IA
  const analisis = await analizarConIA(lead.conversaciones)
  
  // 3. Calcular nueva temperatura y score
  let nuevaTemperatura: string
  let nuevoScore = lead.puntuacion_lead

  if (analisis.interes === 'alto' && analisis.urgencia === 'alta') {
    nuevaTemperatura = 'Caliente'
    nuevoScore = Math.min(100, nuevoScore + 20)
  } else if (analisis.interes === 'medio') {
    nuevaTemperatura = 'Tibio'
    nuevoScore = Math.min(100, nuevoScore + 10)
  } else {
    nuevaTemperatura = 'Frio'
  }

  // 4. Actualizar lead
  const { data } = await supabase
    .from('leads')
    .update({
      temperatura: nuevaTemperatura,
      puntuacion_lead: nuevoScore,
      estado: analisis.interes === 'alto' ? 'Calificado' : lead.estado
    })
    .eq('id', leadId)
    .select()
    .single()

  return data
}
```

## Ejemplo 6: Buscar Disponibilidad de Consultas

```typescript
async function buscarDisponibilidad(
  sede: 'HERMOSILLO' | 'NOGALES',
  fecha: string // YYYY-MM-DD
) {
  // Obtener consultas del día
  const { data: consultas } = await supabase
    .from('consultas')
    .select('hora_consulta, duracion_minutos')
    .eq('sede', sede)
    .eq('fecha_consulta', fecha)
    .in('estado_cita', ['Programada', 'Confirmada'])
    .order('hora_consulta')

  // Obtener horario de la sede
  const { data: sedeInfo } = await supabase
    .from('sedes')
    .select('horario_json')
    .eq('sede', sede)
    .single()

  // Generar slots disponibles
  const horariosOcupados = consultas?.map(c => ({
    inicio: c.hora_consulta,
    duracion: c.duracion_minutos
  })) || []

  const slotsDisponibles = generarSlots(
    sedeInfo?.horario_json,
    horariosOcupados,
    30 // duración slot
  )

  return slotsDisponibles
}
```

## Ejemplo 7: Webhook de n8n

```typescript
// API Route: /api/webhooks/n8n
export async function POST(request: Request) {
  const payload = await request.json()

  switch (payload.action) {
    case 'lead_created':
      // Registrar nuevo lead
      const { data } = await supabase.rpc('upsert_lead_interaction', {
        p_nombre_completo: payload.nombre,
        p_telefono_whatsapp: payload.telefono,
        p_fuente_lead: payload.fuente || 'WhatsApp'
      })
      return Response.json(data)

    case 'consulta_agendada':
      // Crear consulta
      const result = await supabase.rpc('upsert_appointment_atomic_from_calendar', {
        ...payload.consultaData
      })
      return Response.json(result)

    case 'escalamiento':
      // Crear escalamiento
      await supabase
        .from('escalamientos')
        .insert({
          lead_id: payload.lead_id,
          motivo: payload.motivo,
          prioridad: payload.prioridad || 'normal',
          resumen_contexto: payload.contexto
        })
      return Response.json({ success: true })

    default:
      return Response.json({ error: 'Acción no reconocida' }, { status: 400 })
  }
}
```

## Ejemplo 8: Real-time Dashboard

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function DashboardRealtime() {
  const [leads, setLeads] = useState([])
  const [consultas, setConsultas] = useState([])

  useEffect(() => {
    // Cargar datos iniciales
    cargarDatos()

    // Suscribirse a cambios en leads
    const leadsChannel = supabase
      .channel('leads-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'leads'
      }, () => {
        cargarDatos()
      })
      .subscribe()

    // Suscribirse a cambios en consultas
    const consultasChannel = supabase
      .channel('consultas-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'consultas'
      }, () => {
        cargarDatos()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(leadsChannel)
      supabase.removeChannel(consultasChannel)
    }
  }, [])

  async function cargarDatos() {
    const [{ data: leadsData }, { data: consultasData }] = await Promise.all([
      supabase.from('leads').select('*'),
      supabase.from('consultas').select('*')
    ])
    
    setLeads(leadsData || [])
    setConsultas(consultasData || [])
  }

  return (
    <div>
      <h2>Leads: {leads.length}</h2>
      <h2>Consultas: {consultas.length}</h2>
    </div>
  )
}
```
