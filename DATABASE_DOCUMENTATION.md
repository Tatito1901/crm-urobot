# 🗄️ Documentación Base de Datos - UROBOT CRM

**Proyecto Supabase:** UROBOT  
**ID:** uxqksgdpgxkgvasysvsb  
**Región:** us-east-2  
**PostgreSQL:** 17.4.1.074  
**Estado:** ACTIVE_HEALTHY ✅

---

## 📊 Resumen de la Base de Datos

### Tablas Principales: 8
- **pacientes** - 3 registros
- **leads** - 5 registros
- **consultas** - 4 registros
- **recordatorios** - 9 registros
- **sedes** - 2 registros
- **conversaciones** - 0 registros
- **escalamientos** - 0 registros
- **conocimiento_procedimientos_urologia_v2** - 504 registros (embeddings)

### Funciones RPC: 8
- `get_dashboard_metrics()`
- `upsert_appointment_atomic_from_calendar()`
- `upsert_lead_interaction()`
- `claim_due_recordatorios()`
- `mark_recordatorio_enviado()`
- `registrar_mensaje_conversacion()`
- `match_documents()` (búsqueda vectorial)
- `refresh_dashboard_metricas()`

### Vistas Materializadas: 1
- `dashboard_metricas`

---

## 🏗️ Arquitectura de Datos

```
┌─────────────┐
│   LEADS     │ (Punto de entrada)
└──────┬──────┘
       │
       ├─→ conversaciones (historial mensajes)
       │
       └─→ pacientes (cuando se convierten)
              │
              ├─→ consultas (citas médicas)
              │      │
              │      ├─→ recordatorios (automáticos)
              │      └─→ conversaciones
              │
              └─→ escalamientos (casos especiales)

┌─────────────┐
│   SEDES     │ (Configuración)
└──────┬──────┘
       │
       └─→ consultas.sede (FK)

┌──────────────────────────────────────┐
│  conocimiento_procedimientos_v2     │ (IA/RAG)
└──────────────────────────────────────┘
```

---

## 📋 Tablas Detalladas

### 1. **pacientes** (Core)

**Propósito:** Registro maestro de pacientes del consultorio

**Columnas Principales:**
```sql
id                UUID PRIMARY KEY
paciente_id       TEXT UNIQUE (ID generado)
nombre_completo   TEXT
telefono          TEXT
telefono_mx10     TEXT (formato normalizado)
email             TEXT
```

**Estados y Tracking:**
```sql
fecha_registro     TIMESTAMPTZ
ultima_consulta    TIMESTAMPTZ
total_consultas    INTEGER DEFAULT 0
estado             TEXT CHECK (Activo|Inactivo)
fuente_original    TEXT DEFAULT 'WhatsApp'
```

**Relaciones:**
- ← `leads.paciente_id` (conversión de lead)
- → `consultas.paciente_id` (historial médico)
- → `conversaciones.paciente_id` (comunicación)
- → `escalamientos.paciente_id` (casos especiales)

**Uso en CRM:**
- Listado de pacientes (`/pacientes`)
- Perfil de paciente (`/pacientes/[id]`)
- Vinculación con leads convertidos

---

### 2. **leads** (Funnel de Conversión)

**Propósito:** Gestión de leads/prospectos antes de convertirse en pacientes

**Identificación:**
```sql
id                       UUID PRIMARY KEY
lead_id                  TEXT UNIQUE
telefono_whatsapp        TEXT UNIQUE (principal)
telefono_mx10            TEXT (normalizado MX)
nombre_completo          TEXT
```

**Scoring y Clasificación:**
```sql
estado              TEXT CHECK (Nuevo|Contactado|Interesado|Calificado|Convertido|No_Interesado|Perdido)
temperatura         TEXT CHECK (Frio|Tibio|Caliente)
puntuacion_lead     INTEGER CHECK (0-100)
```

**Engagement Tracking:**
```sql
total_mensajes_enviados    INTEGER DEFAULT 0
total_mensajes_recibidos   INTEGER DEFAULT 0
total_interacciones        INTEGER DEFAULT 0
fecha_primer_contacto      TIMESTAMPTZ
ultima_interaccion         TIMESTAMPTZ
```

**Marketing Attribution:**
```sql
fuente_lead         TEXT DEFAULT 'WhatsApp'
canal_marketing     TEXT (ej: Google Ads, Facebook, etc.)
```

**Conversión:**
```sql
paciente_id         UUID FK → pacientes.id
fecha_conversion    TIMESTAMPTZ
```

**Session Management:**
```sql
session_id           TEXT (conversación activa)
ultimo_mensaje_id    TEXT (último mensaje WhatsApp)
```

**Relaciones:**
- → `pacientes.id` (cuando se convierte)
- → `consultas.lead_id` (citas pre-conversión)
- → `conversaciones.lead_id` (historial de chat)
- → `escalamientos.lead_id` (casos complejos)

**Uso en CRM:**
- Lista de leads (`/leads`)
- Scoring automático
- Funnel de conversión
- Dashboard de métricas

---

### 3. **consultas** (Agenda Médica)

**Propósito:** Sistema completo de gestión de citas médicas

**Identificación y Referencias:**
```sql
id                  UUID PRIMARY KEY
consulta_id         TEXT UNIQUE
paciente_id         UUID FK → pacientes REQUIRED
lead_id             UUID FK → leads OPTIONAL
```

**Fecha y Horario:**
```sql
fecha_hora_utc      TIMESTAMPTZ (momento exacto UTC)
fecha_consulta      DATE (día de la cita)
hora_consulta       TIME (hora local)
timezone            TEXT DEFAULT 'America/Mexico_City'
```

**Detalles de la Cita:**
```sql
sede                TEXT FK → sedes (POLANCO|SATELITE)
tipo_cita           TEXT DEFAULT 'primera_vez'
motivo_consulta     TEXT
duracion_minutos    INTEGER DEFAULT 30
```

**Estados del Flujo:**
```sql
estado_cita                TEXT CHECK (Programada|Confirmada|Reagendada|Cancelada|No Asistió)
estado_confirmacion        TEXT DEFAULT 'Pendiente'
confirmado_paciente        BOOLEAN DEFAULT false
fecha_confirmacion         TIMESTAMPTZ
fecha_limite_confirmacion  TIMESTAMPTZ
```

**Sistema de Recordatorios:**
```sql
rem_confirmacion_inicial_enviado  BOOLEAN DEFAULT false
rem_48h_enviado                  BOOLEAN DEFAULT false
rem_24h_enviado                  BOOLEAN DEFAULT false
rem_3h_enviado                   BOOLEAN DEFAULT false
```

**Integración Google Calendar:**
```sql
calendar_event_id    TEXT UNIQUE (ID del evento en Google)
calendar_link        TEXT (link directo al evento)
```

**Cancelaciones:**
```sql
cancelado_por          TEXT
motivo_cancelacion     TEXT
fecha_cancelacion      TIMESTAMPTZ
```

**Metadata:**
```sql
canal_origen         TEXT DEFAULT 'WhatsApp'
historial_cambios    JSONB DEFAULT '[]'
created_at           TIMESTAMPTZ
updated_at           TIMESTAMPTZ
```

**Concurrencia y Duplicados:**
```sql
slot_guard           BOOLEAN DEFAULT true (previene doble reserva)
idempotency_key      TEXT UNIQUE (previene duplicados)
```

**Relaciones:**
- ← `pacientes.id` (paciente de la cita)
- ← `leads.id` (opcional, si viene de lead)
- ← `sedes.sede` (ubicación)
- → `recordatorios.consulta_id` (recordatorios automáticos)
- → `conversaciones.consulta_id` (mensajes relacionados)
- → `escalamientos.consulta_id` (problemas)

**Uso en CRM:**
- Agenda principal (`/agenda`)
- Vistas: día/semana/mes
- Sistema de confirmaciones (`/confirmaciones`)
- Tracking de estados

---

### 4. **recordatorios** (Automatización)

**Propósito:** Sistema automatizado de recordatorios para citas

**Identificación:**
```sql
id                 UUID PRIMARY KEY
recordatorio_id    TEXT UNIQUE
consulta_id        UUID FK → consultas REQUIRED
```

**Programación:**
```sql
tipo                 TEXT (confirmacion_inicial|48h|24h|3h)
programado_para      TIMESTAMPTZ
estado               TEXT DEFAULT 'pendiente'
```

**Ejecución:**
```sql
enviado_en           TIMESTAMPTZ
mensaje_enviado      TEXT
plantilla_usada      TEXT
canal                TEXT DEFAULT 'whatsapp'
```

**Tracking de Entrega:**
```sql
entregado            BOOLEAN DEFAULT false
leido                BOOLEAN DEFAULT false
respondido           BOOLEAN DEFAULT false
respuesta_texto      TEXT
```

**Control de Errores:**
```sql
intentos             INTEGER DEFAULT 0
error_mensaje        TEXT
```

**Deduplicación:**
```sql
idempotency_key      TEXT UNIQUE
dedup_hash           TEXT UNIQUE
```

**Uso en CRM:**
- Automatización n8n
- Dashboard de confirmaciones
- Reportes de entrega

---

### 5. **sedes** (Configuración)

**Propósito:** Configuración de sedes/consultorios

**Datos Principales:**
```sql
sede             TEXT PRIMARY KEY (POLANCO|SATELITE)
calendar_id      TEXT (ID de Google Calendar)
display_name     TEXT
direccion        TEXT
```

**Configuración Horaria:**
```sql
timezone            TEXT DEFAULT 'America/Mexico_City'
horario_json        JSONB (horarios de atención)
anchor_week_type    TEXT (configuración calendario)
anchor_date         DATE
```

**Contacto:**
```sql
telefono            TEXT
whatsapp            TEXT
maps_url            TEXT
```

**Uso en CRM:**
- Selector de sede en agenda
- Badges de sede
- Filtros por ubicación

---

### 6. **conversaciones** (Historial de Chat)

**Propósito:** Registro de todas las conversaciones con leads/pacientes

**Relaciones:**
```sql
id               UUID PRIMARY KEY
lead_id          UUID FK → leads REQUIRED
paciente_id      UUID FK → pacientes OPTIONAL
consulta_id      UUID FK → consultas OPTIONAL
```

**Contenido:**
```sql
mensaje_id        TEXT UNIQUE (ID WhatsApp)
es_bot            BOOLEAN DEFAULT false
contenido         TEXT
tipo_mensaje      TEXT CHECK (texto|audio|imagen|documento|video)
```

**Análisis IA:**
```sql
sentimiento       TEXT CHECK (positivo|neutral|negativo)
intencion         TEXT (detectada por IA)
keywords          JSONB (palabras clave)
```

**Timing:**
```sql
timestamp_mensaje            TIMESTAMPTZ
tiempo_respuesta_segundos    INTEGER (SLA)
```

**Uso en CRM:**
- Historial de conversaciones
- Análisis de sentimiento
- Métricas de engagement

---

### 7. **escalamientos** (Casos Especiales)

**Propósito:** Gestión de casos que requieren intervención humana

**Relaciones:**
```sql
id              UUID PRIMARY KEY
lead_id         UUID FK → leads OPTIONAL
paciente_id     UUID FK → pacientes OPTIONAL
consulta_id     UUID FK → consultas OPTIONAL
```

**Clasificación:**
```sql
motivo          TEXT (razón del escalamiento)
prioridad       TEXT CHECK (alta|normal|baja)
canal           TEXT DEFAULT 'WhatsApp'
```

**Gestión:**
```sql
estado          TEXT CHECK (pendiente|en_proceso|resuelto|descartado)
asignado_a      TEXT (equipo responsable)
resuelto_por    TEXT
resuelto_en     TIMESTAMPTZ
```

**Contexto:**
```sql
resumen_contexto           TEXT
conversation_snapshot      TEXT
whatsapp_message_id        TEXT
telefono_mx10              TEXT
```

**Uso en CRM:**
- Casos que el bot no puede manejar
- Requieren atención médica urgente
- Problemas de comunicación

---

### 8. **conocimiento_procedimientos_urologia_v2** (IA/RAG)

**Propósito:** Base de conocimiento vectorial para IA conversacional

**Estructura:**
```sql
id           UUID PRIMARY KEY
content      TEXT (contenido del documento)
metadata     JSONB (metadatos del chunk)
embedding    VECTOR (embedding para búsqueda semántica)
```

**Uso en CRM:**
- Búsqueda semántica de procedimientos
- Respuestas automáticas del bot
- Sistema RAG (Retrieval Augmented Generation)

**Función Asociada:**
```sql
match_documents(
  query_embedding VECTOR,
  match_count INTEGER,
  filter JSONB
) RETURNS documentos similares
```

---

## 🔄 Funciones RPC (Lógica de Negocio)

### 1. `get_dashboard_metrics()`

**Propósito:** Obtener métricas en tiempo real del dashboard

**Returns:**
```json
{
  "leads_totales": integer,
  "leads_mes": integer,
  "leads_convertidos": integer,
  "tasa_conversion_pct": number,
  "pacientes_activos": integer,
  "total_pacientes": integer,
  "consultas_futuras": integer,
  "consultas_hoy": integer,
  "polanco_futuras": integer,
  "satelite_futuras": integer,
  "pendientes_confirmacion": integer
}
```

**Uso:** Hook `useDashboardMetrics()`

---

### 2. `upsert_appointment_atomic_from_calendar()`

**Propósito:** Crear/actualizar cita desde Google Calendar (atomic)

**Parámetros:**
```sql
p_calendar_event_id      TEXT
p_paciente_id            TEXT
p_nombre_completo        TEXT
p_telefono               TEXT
p_email                  TEXT
p_fecha_hora_utc         TIMESTAMPTZ
p_sede                   TEXT
p_tipo_cita              TEXT
p_duracion_minutos       INTEGER
p_motivo_consulta        TEXT
p_idempotency_key        TEXT (previene duplicados)
```

**Características:**
- ✅ Atomic operation (todo o nada)
- ✅ Deduplicación automática
- ✅ Crea paciente si no existe
- ✅ Vincula con lead si existe
- ✅ Programa recordatorios

**Uso:** Webhooks de Google Calendar

---

### 3. `upsert_lead_interaction()`

**Propósito:** Registrar interacción con lead (upsert automático)

**Parámetros:**
```sql
p_telefono_whatsapp      TEXT REQUIRED
p_nombre_completo        TEXT
p_contenido              TEXT (del mensaje)
p_es_bot                 BOOLEAN
p_tipo_mensaje           TEXT
p_session_id             TEXT
p_estado                 TEXT
```

**Comportamiento:**
- Si lead existe → actualiza contadores
- Si no existe → crea nuevo lead
- Registra conversación
- Actualiza última interacción

**Uso:** Webhooks de WhatsApp, integraciones n8n

---

### 4. `claim_due_recordatorios()`

**Propósito:** Obtener recordatorios pendientes para enviar

**Parámetros:**
```sql
p_limit  INTEGER DEFAULT 100
```

**Returns:** Lista de recordatorios que deben enviarse ahora

**Uso:** Workers/crons de n8n

---

### 5. `mark_recordatorio_enviado()`

**Propósito:** Marcar recordatorio como enviado

**Parámetros:**
```sql
p_recordatorio_id    TEXT
p_mensaje            TEXT
p_entregado          BOOLEAN
p_leido              BOOLEAN
p_respondido         BOOLEAN
```

**Uso:** Confirmación de envío de mensajes

---

### 6. `registrar_mensaje_conversacion()`

**Propósito:** Registrar mensaje en conversación (con IA)

**Parámetros:**
```sql
p_lead_id          TEXT
p_mensaje_id       TEXT
p_contenido        TEXT
p_es_bot           BOOLEAN
p_tipo_mensaje     TEXT
p_sentimiento      TEXT (positivo|neutral|negativo)
p_intencion        TEXT
```

**Returns:** JSON con confirmación

**Uso:** Registro de chat con análisis

---

### 7. `match_documents()` (RAG/IA)

**Propósito:** Búsqueda semántica en base de conocimiento

**Parámetros:**
```sql
query_embedding    VECTOR (embedding de la pregunta)
match_count        INTEGER (cuántos resultados)
filter             JSONB (filtros opcionales)
```

**Returns:**
```json
[{
  "id": "uuid",
  "content": "texto del documento",
  "metadata": {},
  "similarity": 0.95
}]
```

**Uso:** Sistema RAG del chatbot

---

### 8. `refresh_dashboard_metricas()`

**Propósito:** Refrescar vista materializada de métricas

**Uso:** Scheduled job (cada hora)

---

## 📈 Vista: dashboard_metricas

**Tipo:** Materialized View (refrescada cada hora)

**Propósito:** Performance de dashboard (pre-calculado)

**Columnas:**
```sql
calculated_at              TIMESTAMPTZ
leads_totales              INTEGER
leads_mes                  INTEGER
leads_convertidos          INTEGER
tasa_conversion_pct        NUMERIC
pacientes_activos          INTEGER
total_pacientes            INTEGER
consultas_futuras          INTEGER
consultas_hoy              INTEGER
polanco_futuras            INTEGER
satelite_futuras           INTEGER
pendientes_confirmacion    INTEGER
```

**Uso:** Fallback si RPC falla, caché

---

## 🔐 Seguridad y RLS

### Estado Actual:
```
RLS Habilitado: ❌ NO (todas las tablas)
```

**Razón:** CRM interno, acceso controlado por middleware de Next.js

**Recomendación para Producción:**
- ✅ Habilitar RLS en tablas sensibles
- ✅ Políticas por rol (admin, doctor, recepción)
- ✅ Service role solo para backend

---

## 🔗 Relaciones y Constraints

### Foreign Keys:
```
leads.paciente_id → pacientes.id
consultas.paciente_id → pacientes.id (REQUIRED)
consultas.lead_id → leads.id (OPTIONAL)
consultas.sede → sedes.sede
recordatorios.consulta_id → consultas.id
conversaciones.lead_id → leads.id
conversaciones.paciente_id → pacientes.id
conversaciones.consulta_id → consultas.id
escalamientos.lead_id → leads.id
escalamientos.paciente_id → pacientes.id
escalamientos.consulta_id → consultas.id
```

### Unique Constraints:
```
pacientes.paciente_id          UNIQUE
leads.lead_id                  UNIQUE
leads.telefono_whatsapp        UNIQUE
consultas.consulta_id          UNIQUE
consultas.calendar_event_id    UNIQUE
consultas.idempotency_key      UNIQUE
recordatorios.recordatorio_id  UNIQUE
recordatorios.idempotency_key  UNIQUE
recordatorios.dedup_hash       UNIQUE
conversaciones.mensaje_id      UNIQUE
```

---

## 📝 Convenciones y Estándares

### IDs:
```
id               UUID DEFAULT gen_random_uuid()  (PK interno)
{entidad}_id     TEXT UNIQUE                     (ID de negocio)
```

### Timestamps:
```
created_at       TIMESTAMPTZ DEFAULT now()
updated_at       TIMESTAMPTZ DEFAULT now()
```

### Estados:
```
CHECK constraints para valores permitidos
DEFAULT values para valores iniciales
```

### Teléfonos:
```
telefono          TEXT (original)
telefono_mx10     TEXT (normalizado 10 dígitos)
```

Función helper: `to_mx10(text) → text`

---

## 🎯 Flujos de Datos Principales

### 1. Lead → Paciente → Consulta
```sql
1. Lead entra por WhatsApp
   → upsert_lead_interaction()
   → leads table

2. Lead se convierte
   → leads.estado = 'Convertido'
   → leads.paciente_id = nuevo_paciente.id
   → pacientes table

3. Se agenda cita
   → upsert_appointment_atomic_from_calendar()
   → consultas table
   → recordatorios automáticos

4. Recordatorios
   → claim_due_recordatorios()
   → envío por n8n
   → mark_recordatorio_enviado()
```

### 2. Conversación
```sql
1. Mensaje entrante WhatsApp
   → registrar_mensaje_conversacion()
   → conversaciones table

2. Análisis IA
   → sentimiento
   → intención
   → keywords

3. Si requiere escalamiento
   → escalamientos table
   → notificación equipo
```

### 3. Dashboard
```sql
1. Primera carga
   → get_dashboard_metrics() RPC

2. Fallback
   → dashboard_metricas view

3. Refresh
   → refresh_dashboard_metricas()
```

---

## 🚀 Optimizaciones y Performance

### Índices Recomendados:
```sql
-- Ya existentes (PK, UNIQUE)
CREATE INDEX idx_consultas_fecha ON consultas(fecha_consulta);
CREATE INDEX idx_consultas_estado ON consultas(estado_cita);
CREATE INDEX idx_leads_estado ON leads(estado);
CREATE INDEX idx_recordatorios_estado_fecha ON recordatorios(estado, programado_para);
```

### Materialized View:
```sql
-- Dashboard metrics (pre-calculadas)
REFRESH MATERIALIZED VIEW dashboard_metricas;
```

### Vector Search:
```sql
-- Embeddings indexados con ivfflat
CREATE INDEX ON conocimiento_procedimientos_urologia_v2 
USING ivfflat (embedding vector_cosine_ops);
```

---

## 📊 Estadísticas de Uso

### Registros Actuales:
```
pacientes:        3 registros
leads:            5 registros
consultas:        4 registros
recordatorios:    9 registros
sedes:            2 registros (POLANCO, SATELITE)
conversaciones:   0 registros
escalamientos:    0 registros
conocimiento:     504 chunks vectorizados
```

### Tasa de Conversión:
```
Leads convertidos / Total leads
Calculado en: get_dashboard_metrics()
```

---

## 🔮 Próximas Mejoras Sugeridas

### Corto Plazo:
1. **Habilitar RLS** en producción
2. **Índices adicionales** según queries frecuentes
3. **Auditoría** con triggers de cambios

### Mediano Plazo:
1. **Particionamiento** de conversaciones por fecha
2. **Archiving** de consultas antiguas
3. **Réplicas read** para reportes

### Largo Plazo:
1. **CDC (Change Data Capture)** para analytics
2. **Time-series DB** para métricas
3. **Graph DB** para relaciones paciente-doctor

---

## 📚 Recursos y Documentación

### Archivos Generados:
```
✅ DATABASE_DOCUMENTATION.md  (este archivo)
✅ types/supabase.ts           (TypeScript types)
```

### Comandos Útiles:
```sql
-- Ver todas las tablas
SELECT * FROM pg_tables WHERE schemaname = 'public';

-- Ver funciones
SELECT * FROM pg_proc WHERE pronamespace = 'public'::regnamespace;

-- Métricas dashboard
SELECT * FROM get_dashboard_metrics();

-- Refrescar vista
SELECT refresh_dashboard_metricas();
```

---

**Documentación generada automáticamente con MCP de Supabase**  
**Última actualización:** 17 de Noviembre 2025
