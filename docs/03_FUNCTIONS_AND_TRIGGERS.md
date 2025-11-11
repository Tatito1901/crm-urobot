# 🔧 Funciones y Triggers de Supabase

## 📚 Funciones SQL Disponibles

### 1. `to_mx10(text)` → `text`

**Descripción**: Normaliza cualquier número telefónico a formato MX de 10 dígitos.

**Parámetros**:
- `t` (text): Teléfono a normalizar

**Retorna**: `text` - Teléfono normalizado o NULL si inválido

**Lógica**:
1. Extrae solo dígitos
2. Remueve prefijos comunes: `521`, `52`, `01`, `044`, `045`, `0`
3. Toma los últimos 10 dígitos si hay más
4. Retorna NULL si no tiene 10 dígitos

**Ejemplos**:
```sql
SELECT to_mx10('+52 1 624 123 4567');  -- '6241234567'
SELECT to_mx10('521-624-123-4567');    -- '6241234567'
SELECT to_mx10('01 624 123 4567');     -- '6241234567'
SELECT to_mx10('(624) 123-4567');      -- '6241234567'
SELECT to_mx10('044 624 123 4567');    -- '6241234567'
```

**Uso en TypeScript**:
```typescript
const { data: telefono } = await supabase.rpc('to_mx10', {
  t: '+52 624 123 4567'
})
console.log(telefono) // '6241234567'
```

---

### 2. `upsert_lead_interaction(...)`

**Descripción**: Crea un nuevo lead o actualiza uno existente basado en el teléfono.

**Parámetros**:
- `p_nombre_completo` (text, required)
- `p_telefono_whatsapp` (text, required)
- `p_fuente_lead` (text, default: 'WhatsApp')
- `p_estado` (text, default: 'Nuevo')
- `p_notas_iniciales` (text, nullable)
- `p_session_id` (text, nullable)
- `p_message_id` (text, nullable)
- `p_paciente_id` (uuid, nullable)
- `p_fecha_conversion` (timestamptz, nullable)

**Retorna**: `jsonb`

**Respuesta Exitosa - CREATED**:
```json
{
  "success": true,
  "action": "CREATED",
  "is_duplicate": false,
  "lead_id": "JUAN-a1b2c3d4",
  "lead_uuid": "123e4567-e89b-12d3-a456-426614174000",
  "telefono": "6241234567",
  "telefono_original": "+52 624 123 4567",
  "total_interacciones": 1,
  "estado": "Nuevo",
  "message": "Lead creado"
}
```

**Respuesta Exitosa - UPDATED**:
```json
{
  "success": true,
  "action": "UPDATED",
  "is_duplicate": true,
  "lead_id": "JUAN-a1b2c3d4",
  "lead_uuid": "123e4567-e89b-12d3-a456-426614174000",
  "telefono": "6241234567",
  "total_interacciones": 5,
  "estado": "Interesado",
  "message": "Lead actualizado"
}
```

**Respuesta de Error**:
```json
{
  "success": false,
  "error": "INVALID_PHONE",
  "error_detail": "No se pudo normalizar el teléfono",
  "telefono_original": "invalid"
}
```

**Ejemplo de Uso**:
```typescript
const { data, error } = await supabase.rpc('upsert_lead_interaction', {
  p_nombre_completo: 'Juan Pérez',
  p_telefono_whatsapp: '+52 624 123 4567',
  p_fuente_lead: 'WhatsApp',
  p_estado: 'Nuevo',
  p_notas_iniciales: 'Interesado en consulta de urología',
  p_session_id: 'session_123',
  p_message_id: 'msg_456'
})

if (data?.success) {
  console.log(`Lead ${data.action}: ${data.lead_id}`)
  console.log(`Total interacciones: ${data.total_interacciones}`)
}
```

---

### 3. `upsert_appointment_atomic_from_calendar(...)`

**Descripción**: Crea/actualiza un paciente y su consulta de forma atómica. Ideal para sincronización con Google Calendar.

**Parámetros**:
- `p_paciente_id` (text, required): ID único del paciente
- `p_nombre_completo` (text, required)
- `p_telefono` (text, required)
- `p_consulta_id` (text, required): ID único de la consulta
- `p_sede` (text, required): 'HERMOSILLO' | 'NOGALES'
- `p_tipo_cita` (text, required)
- `p_motivo_consulta` (text, required)
- `p_duracion_minutos` (integer, required)
- `p_fecha_hora_utc` (timestamptz, required)
- `p_fecha_consulta` (date, required)
- `p_hora_consulta` (time, required)
- `p_calendar_event_id` (text, required)
- `p_calendar_link` (text, required)
- `p_operation_id` (text, required)
- `p_email` (text, default: NULL)
- `p_fuente_original` (text, default: 'WhatsApp')
- `p_timezone` (text, default: 'America/Mexico_City')
- `p_canal_origen` (text, default: 'WhatsApp')
- `p_lead_telefono_whatsapp` (text, default: NULL)
- `p_event_key` (text, default: NULL)
- `p_idempotency_key` (text, default: NULL)

**Retorna**: `jsonb`

**Respuesta Exitosa**:
```json
{
  "success": true,
  "operation_id": "op-2025-001",
  "paciente_uuid": "123e4567-e89b-12d3-a456-426614174000",
  "consulta_uuid": "987fcdeb-51a2-43f7-8ea3-098765432100",
  "is_new_paciente": true,
  "is_new_consulta": true,
  "is_update_consulta": false,
  "lead_updated": true,
  "calendar_event_id": "evt_google_123",
  "calendar_link": "https://calendar.google.com/...",
  "idempotency_hash": "a1b2c3d4"
}
```

**Ejemplo de Uso**:
```typescript
const fechaConsulta = new Date('2025-01-20T14:00:00-07:00')

const { data, error } = await supabase.rpc('upsert_appointment_atomic_from_calendar', {
  p_paciente_id: 'PAC-2025-001',
  p_nombre_completo: 'María González',
  p_telefono: '+52 624 123 4567',
  p_email: 'maria@email.com',
  p_consulta_id: 'CONS-2025-001',
  p_sede: 'HERMOSILLO',
  p_tipo_cita: 'primera_vez',
  p_motivo_consulta: 'Consulta general de urología',
  p_duracion_minutos: 30,
  p_fecha_hora_utc: fechaConsulta.toISOString(),
  p_fecha_consulta: fechaConsulta.toISOString().split('T')[0],
  p_hora_consulta: '14:00:00',
  p_calendar_event_id: 'evt_google_abc123',
  p_calendar_link: 'https://calendar.google.com/event?eid=...',
  p_operation_id: 'op-2025-001',
  p_lead_telefono_whatsapp: '+52 624 123 4567',
  p_idempotency_key: 'idempotency-key-123'
})

if (data?.success) {
  console.log('Paciente:', data.is_new_paciente ? 'NUEVO' : 'EXISTENTE')
  console.log('Consulta:', data.is_new_consulta ? 'NUEVA' : 'ACTUALIZADA')
  if (data.lead_updated) {
    console.log('Lead actualizado a estado Convertido')
  }
}
```

---

### 4. `registrar_mensaje_conversacion(...)`

**Descripción**: Registra un mensaje en el historial de conversación y actualiza contadores del lead.

**Parámetros**:
- `p_lead_id` (uuid, required)
- `p_mensaje_id` (text, required): ID único del mensaje de WhatsApp
- `p_es_bot` (boolean, required): true si fue enviado por el bot
- `p_contenido` (text, required): Contenido del mensaje
- `p_tipo_mensaje` (text, default: 'texto'): 'texto', 'audio', 'imagen', 'documento', 'video'
- `p_sentimiento` (text, nullable): 'positivo', 'neutral', 'negativo'
- `p_intencion` (text, nullable): Intención detectada por IA

**Retorna**: `jsonb`

**Respuesta Exitosa**:
```json
{
  "success": true,
  "conversacion_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Respuesta de Error**:
```json
{
  "success": false,
  "error_code": "P0001",
  "error_message": "LEAD_NOT_FOUND"
}
```

**Ejemplo de Uso**:
```typescript
// Mensaje recibido del usuario
const { data: result1 } = await supabase.rpc('registrar_mensaje_conversacion', {
  p_lead_id: leadUuid,
  p_mensaje_id: 'wamid.123456789',
  p_es_bot: false,
  p_contenido: 'Hola, quisiera agendar una consulta',
  p_tipo_mensaje: 'texto',
  p_sentimiento: 'positivo',
  p_intencion: 'agendar_consulta'
})

// Mensaje enviado por el bot
const { data: result2 } = await supabase.rpc('registrar_mensaje_conversacion', {
  p_lead_id: leadUuid,
  p_mensaje_id: 'bot_msg_987654321',
  p_es_bot: true,
  p_contenido: '¡Claro! ¿Qué día te gustaría?',
  p_tipo_mensaje: 'texto'
})

// Se actualizan automáticamente:
// - total_mensajes_recibidos (msg del usuario)
// - total_mensajes_enviados (msg del bot)
// - total_interacciones
// - ultima_interaccion
```

---

### 5. `claim_due_recordatorios(integer)`

**Descripción**: Obtiene y "reclama" recordatorios pendientes que están listos para enviarse. Cambia su estado a `'procesando'` para evitar procesamiento duplicado.

**Parámetros**:
- `p_limit` (integer, default: 50): Máximo de recordatorios a reclamar

**Retorna**: `SETOF recordatorios` (array de filas de recordatorios)

**Lógica**:
1. Busca recordatorios con `estado = 'pendiente'`
2. Donde `programado_para <= now()`
3. Los marca como `'procesando'`
4. Usa `FOR UPDATE SKIP LOCKED` para evitar race conditions

**Ejemplo de Uso**:
```typescript
// Procesar recordatorios en un worker/cron job
const { data: recordatorios, error } = await supabase.rpc('claim_due_recordatorios', {
  p_limit: 50
})

if (recordatorios && recordatorios.length > 0) {
  console.log(`Procesando ${recordatorios.length} recordatorios...`)
  
  for (const rec of recordatorios) {
    try {
      // Enviar recordatorio por WhatsApp
      await enviarWhatsApp(rec.consultas.pacientes.telefono, mensaje)
      
      // Marcar como enviado
      await supabase.rpc('mark_recordatorio_enviado', {
        p_recordatorio_id: rec.id,
        p_mensaje: mensaje,
        p_entregado: true
      })
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
    }
  }
}
```

---

### 6. `mark_recordatorio_enviado(...)`

**Descripción**: Marca un recordatorio como enviado y actualiza sus metadatos.

**Parámetros**:
- `p_recordatorio_id` (uuid, required)
- `p_mensaje` (text, nullable): Mensaje que se envió
- `p_entregado` (boolean, nullable): Si fue entregado
- `p_leido` (boolean, nullable): Si fue leído
- `p_respondido` (boolean, nullable): Si el usuario respondió

**Retorna**: `void`

**Efecto Secundario**: Trigger `trigger_actualizar_flags_recordatorios` actualiza los flags en la tabla `consultas`.

**Ejemplo de Uso**:
```typescript
await supabase.rpc('mark_recordatorio_enviado', {
  p_recordatorio_id: recordatorioUuid,
  p_mensaje: 'Hola Juan, te recordamos tu consulta mañana a las 2:00 PM',
  p_entregado: true,
  p_leido: false,
  p_respondido: false
})

// Esto automáticamente actualiza el flag correspondiente en consultas:
// - rem_confirmacion_inicial_enviado
// - rem_48h_enviado
// - rem_24h_enviado
// - rem_3h_enviado
```

---

## 🔄 Triggers Automáticos

### 1. Normalización de Teléfonos

#### `biu_leads_telefono_mx10`
- **Tabla**: `leads`
- **Timing**: BEFORE INSERT, BEFORE UPDATE
- **Función**: `set_lead_telefono_mx10()`
- **Propósito**: Normaliza `telefono_whatsapp` → `telefono_mx10`

#### `biu_pacientes_telefono_mx10`
- **Tabla**: `pacientes`
- **Timing**: BEFORE INSERT, BEFORE UPDATE
- **Función**: `set_paciente_telefono_mx10()`
- **Propósito**: Normaliza `telefono` → `telefono_mx10`

**Ejemplo**:
```typescript
// Al insertar, no necesitas especificar telefono_mx10
await supabase.from('leads').insert({
  nombre_completo: 'Juan Pérez',
  telefono_whatsapp: '+52-624-123-4567'
  // telefono_mx10 se genera automáticamente = '6241234567'
})
```

---

### 2. Generación Automática de Recordatorios

#### `trigger_generar_recordatorios`
- **Tabla**: `consultas`
- **Timing**: AFTER INSERT
- **Función**: `generar_recordatorios_automaticos()`
- **Propósito**: Genera 4 recordatorios al crear una consulta

**Recordatorios Generados**:
1. **Confirmación Inicial**:
   - Tipo: `'confirmacion_inicial'`
   - Cuándo: Máximo 48h antes de la consulta, o ahora + 5 minutos
   - ID: `CONFIRM_{consulta_id}`

2. **48 Horas Antes**:
   - Tipo: `'recordatorio_48h'`
   - Cuándo: Si la consulta es en más de 48h
   - ID: `R48_{consulta_id}`

3. **24 Horas Antes**:
   - Tipo: `'recordatorio_24h'`
   - Cuándo: Si la consulta es en más de 24h
   - ID: `R24_{consulta_id}`

4. **3 Horas Antes**:
   - Tipo: `'recordatorio_3h'`
   - Cuándo: Si la consulta es en más de 3h
   - ID: `R3_{consulta_id}`

**Ejemplo**:
```typescript
// Solo insertas la consulta
const fechaConsulta = new Date()
fechaConsulta.setDate(fechaConsulta.getDate() + 7) // En 7 días

await supabase.from('consultas').insert({
  consulta_id: 'CONS-123',
  paciente_id: pacienteUuid,
  fecha_hora_utc: fechaConsulta.toISOString(),
  fecha_consulta: fechaConsulta.toISOString().split('T')[0],
  hora_consulta: '14:00:00',
  sede: 'HERMOSILLO',
  tipo_cita: 'primera_vez',
  // ... otros campos
})

// Se crean automáticamente 4 recordatorios en la tabla recordatorios
```

---

### 3. Actualización de Totales de Consultas

#### `trigger_actualizar_total_consultas`
- **Tabla**: `consultas`
- **Timing**: AFTER INSERT, AFTER UPDATE
- **Función**: `actualizar_total_consultas()`
- **Propósito**: Actualiza `total_consultas` y `ultima_consulta` en `pacientes`

**Lógica**:
```sql
UPDATE pacientes SET
  total_consultas = (COUNT de consultas del paciente),
  ultima_consulta = (MAX fecha_hora_utc),
  updated_at = now()
WHERE id = consulta.paciente_id
```

**Ejemplo**:
```typescript
// Al insertar una consulta
await supabase.from('consultas').insert({ ... })

// Automáticamente se actualiza en pacientes:
// - total_consultas += 1
// - ultima_consulta = fecha de esta consulta
```

---

### 4. Sincronización de Flags de Recordatorios

#### `trigger_actualizar_flags_recordatorios`
- **Tabla**: `recordatorios`
- **Timing**: AFTER UPDATE
- **Función**: `actualizar_flags_recordatorios()`
- **Propósito**: Actualiza flags en `consultas` cuando se envía un recordatorio

**Lógica**:
Cuando `recordatorios.estado` cambia a `'enviado'`, actualiza en `consultas`:
- Si tipo = `'confirmacion_inicial'` → `rem_confirmacion_inicial_enviado = true`
- Si tipo = `'recordatorio_48h'` → `rem_48h_enviado = true`
- Si tipo = `'recordatorio_24h'` → `rem_24h_enviado = true`
- Si tipo = `'recordatorio_3h'` → `rem_3h_enviado = true`

**Ejemplo**:
```typescript
// Marcar recordatorio como enviado
await supabase
  .from('recordatorios')
  .update({ estado: 'enviado', enviado_en: new Date().toISOString() })
  .eq('id', recordatorioUuid)

// Automáticamente se actualiza el flag correspondiente en consultas
```

---

### 5. Updated_at Automático

Todos estos triggers usan la función `update_updated_at_column()`:

- `update_leads_updated_at` (leads)
- `update_pacientes_updated_at` (pacientes)
- `update_consultas_updated_at` (consultas)
- `update_recordatorios_updated_at` (recordatorios)
- `update_escalamientos_updated_at` (escalamientos)

**Timing**: BEFORE UPDATE
**Propósito**: Actualiza automáticamente el campo `updated_at = now()`

**Ejemplo**:
```typescript
// Solo haces UPDATE, no necesitas especificar updated_at
await supabase
  .from('leads')
  .update({ estado: 'Interesado', temperatura: 'Caliente' })
  .eq('id', leadId)

// updated_at se actualiza automáticamente
```

---

## 🎯 Casos de Uso Comunes

### Crear Lead y Registrar Conversación
```typescript
// 1. Crear/actualizar lead
const { data: leadResult } = await supabase.rpc('upsert_lead_interaction', {
  p_nombre_completo: 'Juan Pérez',
  p_telefono_whatsapp: '+52 624 123 4567',
  p_message_id: 'wamid.123'
})

// 2. Registrar mensaje de conversación
if (leadResult?.success) {
  await supabase.rpc('registrar_mensaje_conversacion', {
    p_lead_id: leadResult.lead_uuid,
    p_mensaje_id: 'wamid.123',
    p_es_bot: false,
    p_contenido: 'Hola, quiero una consulta',
    p_sentimiento: 'positivo'
  })
}
```

### Crear Consulta y Recordatorios Automáticos
```typescript
const { data: appointment } = await supabase.rpc('upsert_appointment_atomic_from_calendar', {
  // ... parámetros
})

// Los recordatorios se crean automáticamente
// Puedes verificarlos:
const { data: recordatorios } = await supabase
  .from('recordatorios')
  .select('*')
  .eq('consulta_id', appointment.consulta_uuid)

console.log(`Se crearon ${recordatorios.length} recordatorios`)
```

### Procesar Recordatorios Pendientes
```typescript
// Cron job cada minuto
const { data: recordatorios } = await supabase.rpc('claim_due_recordatorios', { p_limit: 50 })

for (const rec of recordatorios) {
  // Enviar
  await enviarRecordatorio(rec)
  
  // Marcar como enviado
  await supabase.rpc('mark_recordatorio_enviado', {
    p_recordatorio_id: rec.id,
    p_mensaje: mensajeEnviado,
    p_entregado: true
  })
}
```
