# 🔨 Guía de Implementación CRM ↔ n8n ↔ Supabase

## 🎯 Objetivo

Integrar completamente el CRM Next.js con los flujos n8n y la base de datos Supabase para crear un sistema bidireccional y en tiempo real.

---

## 📋 Checklist de Implementación

### Fase 1: Correcciones en n8n (CRÍTICO)
- [ ] **UROBOT**: Agregar registro de conversaciones
- [ ] **ENVIAR_CONFIRMACIONES**: Usar tabla recordatorios
- [ ] **ESCALAR_HUMANO**: Crear registro en escalamientos
- [ ] **Crear función**: `buscar_consulta_para_reagendar`
- [ ] **Agregar webhooks**: Notificaciones a CRM

### Fase 2: API Routes en CRM
- [ ] `/api/webhooks/n8n` - Receptor de eventos
- [ ] `/api/leads/track` - Proxy para tracking
- [ ] `/api/consultas/disponibilidad` - Proxy disponibilidad
- [ ] `/api/recordatorios/pending` - Lista pendientes
- [ ] `/api/escalamientos` - Gestión de escalamientos

### Fase 3: Componentes UI
- [ ] Dashboard de leads en tiempo real
- [ ] Panel de conversaciones
- [ ] Calendario de consultas
- [ ] Alertas de escalamientos
- [ ] Monitor de recordatorios

---

## 🔧 Implementación Paso a Paso

### PASO 1: Crear Funciones SQL Faltantes en Supabase

#### A. Función `buscar_consulta_para_reagendar`

```sql
CREATE OR REPLACE FUNCTION public.buscar_consulta_para_reagendar(
  p_telefono TEXT,
  p_consulta_id TEXT
)
RETURNS TABLE (
  id UUID,
  consulta_id TEXT,
  paciente_id UUID,
  paciente_nombre TEXT,
  paciente_telefono TEXT,
  fecha_hora_utc TIMESTAMPTZ,
  fecha_consulta DATE,
  hora_consulta TIME,
  sede TEXT,
  tipo_cita TEXT,
  motivo_consulta TEXT,
  estado_cita TEXT,
  confirmado_paciente BOOLEAN,
  calendar_event_id TEXT,
  calendar_link TEXT,
  cancelado_por TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_telefono_mx10 TEXT;
BEGIN
  -- Normalizar teléfono
  v_telefono_mx10 := to_mx10(p_telefono);
  
  -- Buscar consultas activas
  RETURN QUERY
  SELECT 
    c.id,
    c.consulta_id,
    c.paciente_id,
    p.nombre_completo AS paciente_nombre,
    p.telefono AS paciente_telefono,
    c.fecha_hora_utc,
    c.fecha_consulta,
    c.hora_consulta,
    c.sede,
    c.tipo_cita,
    c.motivo_consulta,
    c.estado_cita,
    c.confirmado_paciente,
    c.calendar_event_id,
    c.calendar_link,
    c.cancelado_por,
    c.created_at,
    c.updated_at
  FROM public.consultas c
  INNER JOIN public.pacientes p ON c.paciente_id = p.id
  WHERE 
    c.estado_cita IN ('Programada', 'Confirmada', 'Reagendada')
    AND c.cancelado_por IS NULL
    AND c.fecha_hora_utc > NOW()
    AND (
      -- Buscar por consulta_id
      (p_consulta_id IS NOT NULL AND c.consulta_id = p_consulta_id)
      OR
      -- Buscar por teléfono
      (p_telefono IS NOT NULL AND (
        p.telefono_mx10 = v_telefono_mx10 OR
        p.telefono = p_telefono
      ))
    )
  ORDER BY c.fecha_hora_utc ASC
  LIMIT 5;
END;
$$;

-- Dar permisos
GRANT EXECUTE ON FUNCTION public.buscar_consulta_para_reagendar TO anon, authenticated, service_role;
```

#### B. Vista para Dashboard de Recordatorios

```sql
CREATE OR REPLACE VIEW public.vw_recordatorios_dashboard AS
SELECT 
  r.id,
  r.recordatorio_id,
  r.tipo,
  r.programado_para,
  r.enviado_en,
  r.estado,
  r.entregado,
  r.leido,
  r.respondido,
  r.intentos,
  c.consulta_id,
  c.fecha_hora_utc AS consulta_fecha,
  c.sede AS consulta_sede,
  c.estado_cita AS consulta_estado,
  p.nombre_completo AS paciente_nombre,
  p.telefono AS paciente_telefono,
  p.email AS paciente_email,
  (r.programado_para <= NOW() AND r.estado = 'pendiente') AS is_due,
  EXTRACT(EPOCH FROM (r.programado_para - NOW()))/3600 AS hours_until_due
FROM public.recordatorios r
INNER JOIN public.consultas c ON r.consulta_id = c.id
INNER JOIN public.pacientes p ON c.paciente_id = p.id
WHERE c.estado_cita IN ('Programada', 'Confirmada', 'Reagendada')
  AND c.cancelado_por IS NULL
ORDER BY r.programado_para ASC;

GRANT SELECT ON public.vw_recordatorios_dashboard TO anon, authenticated;
```

---

### PASO 2: Modificar Flujo UROBOT en n8n

Agregar nodo después del agente para registrar conversaciones:

```javascript
// Nodo: "Register Conversation"
// Tipo: Code (JavaScript)

const leadCapture = $('LEAD_CAPTURE').first()?.json;
const userMessage = $('Edit Fields1').first()?.json?.mensajeUsuario;
const botResponse = $input.first()?.json?.output;

if (leadCapture?.lead_uuid && userMessage) {
  // Registrar mensaje del usuario
  const { data: userMsg } = await $request.post({
    url: $env.SUPABASE_URL + '/rest/v1/rpc/registrar_mensaje_conversacion',
    headers: {
      'apikey': $env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${$env.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: {
      p_lead_id: leadCapture.lead_uuid,
      p_mensaje_id: $('Webhook1').first().json.body.data.messages.key.id,
      p_es_bot: false,
      p_contenido: userMessage,
      p_tipo_mensaje: 'texto'
    }
  });
  
  // Registrar respuesta del bot
  if (botResponse) {
    await $request.post({
      url: $env.SUPABASE_URL + '/rest/v1/rpc/registrar_mensaje_conversacion',
      headers: {
        'apikey': $env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${$env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: {
        p_lead_id: leadCapture.lead_uuid,
        p_mensaje_id: `bot_${Date.now()}`,
        p_es_bot: true,
        p_contenido: botResponse,
        p_tipo_mensaje: 'texto'
      }
    });
  }
}

return $input.all();
```

---

### PASO 3: Modificar ENVIAR_CONFIRMACIONES

Reescribir el flujo para usar las funciones RPC correctas:

```javascript
// Nodo: "Claim Recordatorios"
// Tipo: PostgreSQL

SELECT * FROM claim_due_recordatorios(50);
```

```javascript
// Nodo: "Process & Send"
// Tipo: Code Loop (por cada recordatorio)

const recordatorio = $input.first().json;

// Construir mensaje
const mensaje = buildReminderMessage(recordatorio);

// Enviar WhatsApp
const waResult = await sendWhatsApp(
  recordatorio.consultas.pacientes.telefono,
  mensaje
);

// Marcar como enviado solo si fue exitoso
if (waResult.success) {
  await $request.post({
    url: $env.SUPABASE_URL + '/rest/v1/rpc/mark_recordatorio_enviado',
    headers: {
      'apikey': $env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${$env.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: {
      p_recordatorio_id: recordatorio.id,
      p_mensaje: mensaje,
      p_entregado: true
    }
  });
}

return [{
  json: {
    recordatorio_id: recordatorio.id,
    sent: waResult.success,
    error: waResult.error
  }
}];
```

---

### PASO 4: Modificar ESCALAR_A_HUMANO

Agregar registro en base de datos:

```javascript
// Nodo: "Create Escalamiento Record"
// Después de "Process Escalation"

const escalamiento = $input.first().json;

// Buscar lead_id por teléfono
const { data: lead } = await $request.post({
  url: $env.SUPABASE_URL + '/rest/v1/rpc/to_mx10',
  headers: {
    'apikey': $env.SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
  },
  body: { t: escalamiento.paciente.telefono }
});

const telefono_mx10 = lead;

// Buscar lead
const { data: leads } = await $request.get({
  url: $env.SUPABASE_URL + '/rest/v1/leads',
  headers: {
    'apikey': $env.SUPABASE_ANON_KEY
  },
  query: {
    telefono_mx10: `eq.${telefono_mx10}`,
    select: 'id,paciente_id'
  }
});

const leadRecord = leads?.[0];

// Crear escalamiento
await $request.post({
  url: $env.SUPABASE_URL + '/rest/v1/escalamientos',
  headers: {
    'apikey': $env.SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${$env.SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: {
    lead_id: leadRecord?.id,
    paciente_id: leadRecord?.paciente_id,
    telefono_mx10: telefono_mx10,
    canal: 'WhatsApp',
    motivo: escalamiento.motivo,
    prioridad: escalamiento.prioridad,
    resumen_contexto: escalamiento.contexto,
    conversation_snapshot: escalamiento.conversation_history,
    estado: 'pendiente'
  }
});

return $input.all();
```

---

### PASO 5: Crear API Routes en Next.js

#### A. Webhook Receiver

```typescript
// app/api/webhooks/n8n/route.ts

import { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'

const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET!

// Validar firma
function validateSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha256', N8N_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hash)
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = headers()
  const signature = headersList.get('x-n8n-signature')
  
  // Validar firma
  if (!signature || !validateSignature(body, signature)) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const payload = JSON.parse(body)
  
  // Procesar según acción
  switch (payload.action) {
    case 'lead_created':
      await handleLeadCreated(payload.data)
      break
      
    case 'consulta_agendada':
      await handleConsultaAgendada(payload.data)
      break
      
    case 'escalamiento_created':
      await handleEscalamiento(payload.data)
      break
      
    case 'recordatorio_enviado':
      await handleRecordatorioEnviado(payload.data)
      break
      
    default:
      console.warn('Unknown action:', payload.action)
  }
  
  return Response.json({ received: true })
}

async function handleLeadCreated(data: any) {
  // Emitir evento Server-Sent Events
  const channel = await getSSEChannel('leads')
  channel.send({
    type: 'lead_created',
    data: data
  })
  
  // Opcional: enviar notificación push
  await sendPushNotification({
    title: 'Nuevo Lead',
    body: `${data.nombre_completo} - ${data.fuente_lead}`,
    tag: 'lead'
  })
}

async function handleConsultaAgendada(data: any) {
  const channel = await getSSEChannel('consultas')
  channel.send({
    type: 'consulta_agendada',
    data: data
  })
}
```

#### B. Proxy para Disponibilidad

```typescript
// app/api/disponibilidad/route.ts

import { NextRequest } from 'next/server'

const N8N_WEBHOOK_URL = process.env.N8N_DISPONIBILIDAD_WEBHOOK!

export async function POST(request: NextRequest) {
  const { fecha, sede, windowDays = 14 } = await request.json()
  
  // Validaciones
  if (!fecha || !['POLANCO', 'SATELITE'].includes(sede)) {
    return Response.json(
      { error: 'Parámetros inválidos' },
      { status: 400 }
    )
  }
  
  // Llamar a n8n
  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      desiredStart: fecha,
      sedePreferida: sede.toUpperCase(),
      timezone: 'America/Mexico_City',
      windowDays,
      maxResults: 50,
      source: 'crm_web'
    })
  })
  
  if (!response.ok) {
    return Response.json(
      { error: 'Error consultando disponibilidad' },
      { status: 500 }
    )
  }
  
  const disponibilidad = await response.json()
  
  return Response.json({
    success: true,
    disponibilidad: disponibilidad.llmContext,
    slots: disponibilidad.slots
  })
}
```

#### C. Dashboard de Recordatorios

```typescript
// app/api/recordatorios/pending/route.ts

import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('vw_recordatorios_dashboard')
    .select('*')
    .eq('estado', 'pendiente')
    .lte('programado_para', new Date().toISOString())
    .order('programado_para', { ascending: true })
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
  
  return Response.json({
    recordatorios: data,
    count: data?.length || 0
  })
}
```

---

### PASO 6: Crear Hooks de React

#### A. Hook para Leads en Tiempo Real

```typescript
// hooks/useLeadsRealtime.ts

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Lead = Database['public']['Tables']['leads']['Row']

export function useLeadsRealtime() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  
  useEffect(() => {
    // Cargar leads iniciales
    const fetchLeads = async () => {
      const { data } = await supabase
        .from('leads')
        .select('*')
        .order('fecha_primer_contacto', { ascending: false })
        .limit(100)
      
      setLeads(data || [])
      setLoading(false)
    }
    
    fetchLeads()
    
    // Suscribirse a cambios
    const channel = supabase
      .channel('leads-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'leads'
      }, (payload) => {
        setLeads(prev => [payload.new as Lead, ...prev])
        
        // Mostrar notificación
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Nuevo Lead', {
            body: `${payload.new.nombre_completo} - ${payload.new.fuente_lead}`,
            icon: '/icon-lead.png'
          })
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'leads'
      }, (payload) => {
        setLeads(prev => prev.map(l => 
          l.id === payload.new.id ? payload.new as Lead : l
        ))
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  return { leads, loading }
}
```

#### B. Hook para Consultas del Día

```typescript
// hooks/useConsultasHoy.ts

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useConsultasHoy() {
  const [consultas, setConsultas] = useState([])
  const supabase = createClient()
  
  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0]
    
    const fetchConsultas = async () => {
      const { data } = await supabase
        .from('consultas')
        .select(`
          *,
          pacientes(*),
          sedes(*)
        `)
        .eq('fecha_consulta', hoy)
        .in('estado_cita', ['Programada', 'Confirmada'])
        .order('hora_consulta', { ascending: true })
      
      setConsultas(data || [])
    }
    
    fetchConsultas()
    
    const channel = supabase
      .channel('consultas-hoy')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'consultas',
        filter: `fecha_consulta=eq.${hoy}`
      }, () => {
        fetchConsultas()
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  return { consultas }
}
```

---

### PASO 7: Componentes UI

#### A. Dashboard de Leads

```typescript
// components/dashboard/LeadsDashboard.tsx

'use client'

import { useLeadsRealtime } from '@/hooks/useLeadsRealtime'
import { Badge } from '@/components/ui/badge'

export function LeadsDashboard() {
  const { leads, loading } = useLeadsRealtime()
  
  if (loading) return <LoadingSkeleton />
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Leads Recientes</h2>
      
      <div className="grid gap-4">
        {leads.map((lead) => (
          <div key={lead.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{lead.nombre_completo}</h3>
                <p className="text-sm text-gray-500">{lead.telefono_whatsapp}</p>
              </div>
              
              <div className="flex gap-2">
                <Badge variant={getTemperaturaBadgeVariant(lead.temperatura)}>
                  {lead.temperatura}
                </Badge>
                <Badge variant="outline">{lead.estado}</Badge>
              </div>
            </div>
            
            <div className="mt-2 text-sm">
              <p className="text-gray-600">{lead.notas_iniciales}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(lead.fecha_primer_contacto).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getTemperaturaBadgeVariant(temp: string) {
  switch(temp) {
    case 'Caliente': return 'destructive'
    case 'Tibio': return 'warning'
    case 'Frio': return 'secondary'
    default: return 'default'
  }
}
```

#### B. Panel de Recordatorios

```typescript
// components/dashboard/RecordatoriosPanel.tsx

'use client'

import { useEffect, useState } from 'react'

export function RecordatoriosPanel() {
  const [pendientes, setPendientes] = useState([])
  
  useEffect(() => {
    const fetchPendientes = async () => {
      const res = await fetch('/api/recordatorios/pending')
      const data = await res.json()
      setPendientes(data.recordatorios)
    }
    
    fetchPendientes()
    
    // Refrescar cada minuto
    const interval = setInterval(fetchPendientes, 60000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        Recordatorios Pendientes ({pendientes.length})
      </h2>
      
      {pendientes.map((rec) => (
        <div key={rec.id} className="border-l-4 border-orange-500 pl-4 py-2">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">{rec.paciente_nombre}</p>
              <p className="text-sm text-gray-600">
                {rec.tipo} - {rec.consulta_sede}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm">
                {rec.hours_until_due > 0 
                  ? `En ${Math.floor(rec.hours_until_due)}h`
                  : 'Vencido'
                }
              </p>
              <p className="text-xs text-gray-500">
                {new Date(rec.consulta_fecha).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## 🔐 Seguridad

### Variables de Entorno

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://uxqksgdpgxkgvasysvsb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... # Solo backend

# n8n
N8N_WEBHOOK_SECRET=your-secret-key-here
N8N_DISPONIBILIDAD_WEBHOOK=https://n8n.yourdomain.com/webhook/...
N8N_AGENDAR_WEBHOOK=https://n8n.yourdomain.com/webhook/...

# WhatsApp
WASENDER_API_URL=https://wasenderapi.com
WASENDER_API_KEY=...
```

### Validación de Webhooks

Siempre validar firma HMAC en webhooks n8n → CRM:

```typescript
import crypto from 'crypto'

function validateWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(`sha256=${hash}`),
    Buffer.from(signature)
  )
}
```

---

## 📊 Monitoreo

### Agregar Logging en n8n

En cada flujo, agregar nodo final de logging:

```javascript
// Nodo: "Log to Supabase"

await $request.post({
  url: $env.SUPABASE_URL + '/rest/v1/workflow_logs',
  headers: {
    'apikey': $env.SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${$env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: {
    workflow_name: 'AGENDAR_CONSULTA',
    execution_id: $execution.id,
    status: 'success',
    duration_ms: Date.now() - $execution.startTime,
    data: {
      consulta_id: $json.consulta_id,
      paciente: $json.patient.nombre
    }
  }
});
```

---

## ✅ Testing

### Test de Integración Completa

```typescript
// __tests__/integration/n8n-supabase.test.ts

describe('n8n → Supabase Integration', () => {
  it('should create lead via n8n webhook', async () => {
    const response = await fetch('http://localhost:5678/webhook/...', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Test User',
        telefono: '+526241234567',
        fuente: 'Test'
      })
    })
    
    expect(response.ok).toBe(true)
    
    // Verificar en Supabase
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('telefono_whatsapp', '+526241234567')
      .single()
    
    expect(data).toBeDefined()
    expect(data.nombre_completo).toBe('Test User')
  })
})
```

---

## 🚀 Deployment

### Configurar Webhooks en Producción

1. Obtener URL de producción del CRM
2. Configurar en n8n:
   ```
   Webhook CRM: https://your-crm.vercel.app/api/webhooks/n8n
   ```
3. Configurar headers de autenticación
4. Probar con Postman/curl

### Checklist Pre-Deploy

- [ ] Todas las funciones SQL creadas
- [ ] Variables de entorno configuradas
- [ ] Webhooks n8n actualizados
- [ ] API Routes desplegadas
- [ ] RLS habilitado (si aplica)
- [ ] Monitoring configurado
- [ ] Tests pasando

---

## 📚 Referencias

- [Supabase RPC Functions](https://supabase.com/docs/guides/database/functions)
- [n8n Webhooks](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
