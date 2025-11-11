# 📚 Esquema Detallado de Base de Datos

## Tabla: `leads`

### Descripción
Almacena los prospectos del CRM antes de convertirse en pacientes. Representa el primer punto de contacto con usuarios interesados.

### Campos

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NOT NULL | Identificador único interno |
| `lead_id` | text | UNIQUE | ID legible (ej: "JUAN-a1b2c3d4") |
| `telefono_whatsapp` | text | UNIQUE, NOT NULL | Teléfono completo de WhatsApp |
| `telefono_mx10` | text | Nullable | Teléfono normalizado a 10 dígitos MX |
| `nombre_completo` | text | NOT NULL | Nombre del lead |
| `fuente_lead` | text | DEFAULT 'WhatsApp' | Origen del lead |
| `canal_marketing` | text | Nullable | Canal de marketing |
| `campana_id` | text | Nullable | ID de campaña |
| `utm_source` | text | Nullable | UTM source |
| `utm_medium` | text | Nullable | UTM medium |
| `utm_campaign` | text | Nullable | UTM campaign |
| `fecha_primer_contacto` | timestamptz | DEFAULT now() | Primera interacción |
| `ultima_interaccion` | timestamptz | DEFAULT now() | Última interacción |
| `total_mensajes_enviados` | integer | DEFAULT 0 | Contador de mensajes enviados |
| `total_mensajes_recibidos` | integer | DEFAULT 0 | Contador de mensajes recibidos |
| `total_interacciones` | integer | DEFAULT 0 | Total de interacciones |
| `estado` | text | CHECK, DEFAULT 'Nuevo' | Ver Estados Posibles ⬇️ |
| `temperatura` | text | CHECK, DEFAULT 'Frio' | Ver Temperatura ⬇️ |
| `puntuacion_lead` | integer | CHECK 0-100, DEFAULT 0 | Score del lead |
| `notas_iniciales` | text | Nullable | Notas al crear el lead |
| `session_id` | text | Nullable | ID de sesión de WhatsApp |
| `ultimo_mensaje_id` | text | Nullable | ID del último mensaje |
| `paciente_id` | uuid | FK, Nullable | Referencia a pacientes.id |
| `fecha_conversion` | timestamptz | Nullable | Cuándo se convirtió a paciente |
| `created_at` | timestamptz | DEFAULT now() | Fecha de creación |
| `updated_at` | timestamptz | DEFAULT now() | Última actualización |

### Estados Posibles
- `Nuevo`: Primer contacto
- `Contactado`: Ya se estableció comunicación
- `Interesado`: Mostró interés
- `Calificado`: Cumple criterios
- `Convertido`: Ya es paciente
- `No_Interesado`: No desea seguir
- `Perdido`: Se perdió el contacto

### Temperatura
- `Frio`: Poco interés o interacción
- `Tibio`: Interés moderado
- `Caliente`: Alta probabilidad de conversión

### Índices y Constraints
- PRIMARY KEY: `id`
- UNIQUE: `lead_id`, `telefono_whatsapp`
- FOREIGN KEY: `paciente_id` → `pacientes(id)`

### Triggers
- `biu_leads_telefono_mx10` (BEFORE INSERT/UPDATE): Normaliza teléfono
- `update_leads_updated_at` (BEFORE UPDATE): Actualiza timestamp

---

## Tabla: `pacientes`

### Descripción
Pacientes registrados en el sistema con al menos una consulta.

### Campos

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NOT NULL | Identificador único interno |
| `paciente_id` | text | UNIQUE, NOT NULL | ID legible (ej: "PAC-123") |
| `nombre_completo` | text | NOT NULL | Nombre completo del paciente |
| `telefono` | text | NOT NULL | Teléfono principal |
| `telefono_mx10` | text | Nullable | Teléfono normalizado MX10 |
| `email` | text | Nullable | Email del paciente |
| `fecha_registro` | timestamptz | DEFAULT now() | Fecha de registro inicial |
| `fuente_original` | text | DEFAULT 'WhatsApp' | Canal de adquisición |
| `ultima_consulta` | timestamptz | Nullable | Fecha de última consulta |
| `total_consultas` | integer | DEFAULT 0 | Contador de consultas |
| `estado` | text | CHECK, DEFAULT 'Activo' | `Activo` o `Inactivo` |
| `notas` | text | Nullable | Notas generales |
| `created_at` | timestamptz | DEFAULT now() | Fecha de creación |
| `updated_at` | timestamptz | DEFAULT now() | Última actualización |

### Índices y Constraints
- PRIMARY KEY: `id`
- UNIQUE: `paciente_id`
- CHECK: `estado IN ('Activo', 'Inactivo')`

### Triggers
- `biu_pacientes_telefono_mx10` (BEFORE INSERT/UPDATE): Normaliza teléfono
- `update_pacientes_updated_at` (BEFORE UPDATE): Actualiza timestamp

### Relaciones
- **1:N** con `consultas` (un paciente tiene muchas consultas)
- **1:N** con `conversaciones`
- **1:1** con `leads` (un lead puede convertirse en paciente)

---

## Tabla: `consultas`

### Descripción
Registro de todas las citas médicas programadas, incluyendo su estado y metadatos.

### Campos

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NOT NULL | Identificador único interno |
| `consulta_id` | text | UNIQUE, NOT NULL | ID legible (ej: "CONS-2025-001") |
| `paciente_id` | uuid | FK, NOT NULL | Referencia al paciente |
| `lead_id` | uuid | FK, Nullable | Lead original (si aplica) |
| `fecha_hora_utc` | timestamptz | NOT NULL | Fecha/hora en UTC |
| `fecha_consulta` | date | NOT NULL | Solo fecha (YYYY-MM-DD) |
| `hora_consulta` | time | NOT NULL | Solo hora (HH:MM:SS) |
| `timezone` | text | DEFAULT 'America/Mexico_City' | Zona horaria |
| `sede` | text | FK, NOT NULL | `HERMOSILLO` o `NOGALES` |
| `tipo_cita` | text | DEFAULT 'primera_vez' | Tipo de consulta |
| `motivo_consulta` | text | Nullable | Motivo de la cita |
| `duracion_minutos` | integer | DEFAULT 30 | Duración en minutos |
| `estado_cita` | text | CHECK, DEFAULT 'Programada' | Ver Estados de Cita ⬇️ |
| `estado_confirmacion` | text | DEFAULT 'Pendiente' | Estado de confirmación |
| `confirmado_paciente` | boolean | DEFAULT false | Si el paciente confirmó |
| `fecha_confirmacion` | timestamptz | Nullable | Cuándo confirmó |
| `fecha_limite_confirmacion` | timestamptz | Nullable | Límite para confirmar |
| `rem_confirmacion_inicial_enviado` | boolean | DEFAULT false | Flag: recordatorio inicial |
| `rem_48h_enviado` | boolean | DEFAULT false | Flag: recordatorio 48h |
| `rem_24h_enviado` | boolean | DEFAULT false | Flag: recordatorio 24h |
| `rem_3h_enviado` | boolean | DEFAULT false | Flag: recordatorio 3h |
| `calendar_event_id` | text | UNIQUE, Nullable | ID del evento en Google Calendar |
| `calendar_link` | text | Nullable | Link al evento de Calendar |
| `canal_origen` | text | DEFAULT 'WhatsApp' | Canal de origen |
| `cancelado_por` | text | Nullable | Quién canceló |
| `motivo_cancelacion` | text | Nullable | Razón de cancelación |
| `fecha_cancelacion` | timestamptz | Nullable | Cuándo se canceló |
| `created_at` | timestamptz | DEFAULT now() | Fecha de creación |
| `updated_at` | timestamptz | DEFAULT now() | Última actualización |
| `historial_cambios` | jsonb | DEFAULT '[]' | Historial de modificaciones |
| `slot_guard` | boolean | DEFAULT true | Guard para evitar doble reserva |
| `idempotency_key` | text | UNIQUE, Nullable | Key para deduplicación |

### Estados de Cita
- `Programada`: Cita agendada
- `Confirmada`: Paciente confirmó
- `Reagendada`: Se cambió la fecha
- `Cancelada`: Fue cancelada
- `No Asistió`: El paciente no llegó

### Índices y Constraints
- PRIMARY KEY: `id`
- UNIQUE: `consulta_id`, `calendar_event_id`, `idempotency_key`
- FOREIGN KEY: `paciente_id` → `pacientes(id)`
- FOREIGN KEY: `lead_id` → `leads(id)`
- FOREIGN KEY: `sede` → `sedes(sede)`

### Triggers
- `trigger_generar_recordatorios` (AFTER INSERT): Crea recordatorios automáticamente
- `trigger_actualizar_total_consultas` (AFTER INSERT/UPDATE): Actualiza totales en pacientes
- `update_consultas_updated_at` (BEFORE UPDATE): Actualiza timestamp

---

## Tabla: `recordatorios`

### Descripción
Sistema de recordatorios automáticos para las consultas.

### Campos

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NOT NULL | Identificador único interno |
| `recordatorio_id` | text | UNIQUE, Nullable | ID legible |
| `consulta_id` | uuid | FK, NOT NULL | Referencia a la consulta |
| `tipo` | text | NOT NULL | Ver Tipos de Recordatorio ⬇️ |
| `programado_para` | timestamptz | NOT NULL | Cuándo debe enviarse |
| `enviado_en` | timestamptz | Nullable | Cuándo se envió |
| `estado` | text | DEFAULT 'pendiente' | `pendiente`, `procesando`, `enviado`, `error` |
| `mensaje_enviado` | text | Nullable | Mensaje que se envió |
| `plantilla_usada` | text | Nullable | Plantilla utilizada |
| `canal` | text | DEFAULT 'whatsapp' | Canal de envío |
| `entregado` | boolean | DEFAULT false | Si fue entregado |
| `leido` | boolean | DEFAULT false | Si fue leído |
| `respondido` | boolean | DEFAULT false | Si hubo respuesta |
| `respuesta_texto` | text | Nullable | Texto de la respuesta |
| `intentos` | integer | DEFAULT 0 | Número de intentos de envío |
| `error_mensaje` | text | Nullable | Mensaje de error si falló |
| `created_at` | timestamptz | DEFAULT now() | Fecha de creación |
| `updated_at` | timestamptz | DEFAULT now() | Última actualización |
| `idempotency_key` | text | UNIQUE, Nullable | Key para deduplicación |
| `dedup_hash` | text | UNIQUE, Nullable | Hash de deduplicación |

### Tipos de Recordatorio
- `confirmacion_inicial`: Primer recordatorio (hasta 48h antes)
- `recordatorio_48h`: 48 horas antes
- `recordatorio_24h`: 24 horas antes
- `recordatorio_3h`: 3 horas antes

### Índices y Constraints
- PRIMARY KEY: `id`
- UNIQUE: `recordatorio_id`, `idempotency_key`, `dedup_hash`
- FOREIGN KEY: `consulta_id` → `consultas(id)`

### Triggers
- `trigger_actualizar_flags_recordatorios` (AFTER UPDATE): Actualiza flags en consultas
- `update_recordatorios_updated_at` (BEFORE UPDATE): Actualiza timestamp

---

## Tabla: `conversaciones`

### Descripción
Historial completo de todas las conversaciones con leads y pacientes.

### Campos

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NOT NULL | Identificador único interno |
| `lead_id` | uuid | FK, NOT NULL | Referencia al lead |
| `paciente_id` | uuid | FK, Nullable | Referencia al paciente |
| `consulta_id` | uuid | FK, Nullable | Consulta relacionada |
| `mensaje_id` | text | UNIQUE, NOT NULL | ID del mensaje de WhatsApp |
| `es_bot` | boolean | DEFAULT false | Si fue enviado por el bot |
| `contenido` | text | NOT NULL | Contenido del mensaje |
| `tipo_mensaje` | text | CHECK, DEFAULT 'texto' | Ver Tipos de Mensaje ⬇️ |
| `sentimiento` | text | CHECK, Nullable | `positivo`, `neutral`, `negativo` |
| `intencion` | text | Nullable | Intención detectada por IA |
| `keywords` | jsonb | Nullable | Keywords extraídos |
| `timestamp_mensaje` | timestamptz | DEFAULT now() | Timestamp del mensaje |
| `tiempo_respuesta_segundos` | integer | Nullable | Tiempo de respuesta |
| `created_at` | timestamptz | DEFAULT now() | Fecha de creación |

### Tipos de Mensaje
- `texto`: Mensaje de texto
- `audio`: Audio/nota de voz
- `imagen`: Imagen
- `documento`: Documento/PDF
- `video`: Video

### Índices y Constraints
- PRIMARY KEY: `id`
- UNIQUE: `mensaje_id`
- FOREIGN KEY: `lead_id` → `leads(id)`
- FOREIGN KEY: `paciente_id` → `pacientes(id)`
- FOREIGN KEY: `consulta_id` → `consultas(id)`
- CHECK: `tipo_mensaje IN ('texto', 'audio', 'imagen', 'documento', 'video')`
- CHECK: `sentimiento IN ('positivo', 'neutral', 'negativo')`

---

## Tabla: `escalamientos`

### Descripción
Casos que requieren intervención humana debido a complejidad o problemas.

### Campos

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | uuid | PK, NOT NULL | Identificador único interno |
| `lead_id` | uuid | FK, Nullable | Lead relacionado |
| `paciente_id` | uuid | FK, Nullable | Paciente relacionado |
| `consulta_id` | uuid | FK, Nullable | Consulta relacionada |
| `telefono_mx10` | text | Nullable | Teléfono normalizado |
| `canal` | text | DEFAULT 'WhatsApp' | Canal donde ocurrió |
| `motivo` | text | NOT NULL | Razón del escalamiento |
| `prioridad` | text | CHECK, DEFAULT 'normal' | `alta`, `normal`, `baja` |
| `estado` | text | CHECK, DEFAULT 'pendiente' | Ver Estados ⬇️ |
| `resumen_contexto` | text | Nullable | Resumen del contexto |
| `conversation_snapshot` | text | Nullable | Snapshot de la conversación |
| `whatsapp_message_id` | text | Nullable | ID del mensaje de WhatsApp |
| `asignado_a` | text | Nullable | Asignado a qué agente |
| `resuelto_por` | text | Nullable | Quién lo resolvió |
| `resuelto_en` | timestamptz | Nullable | Cuándo se resolvió |
| `created_at` | timestamptz | DEFAULT now() | Fecha de creación |
| `updated_at` | timestamptz | DEFAULT now() | Última actualización |

### Estados
- `pendiente`: Esperando atención
- `en_proceso`: Siendo atendido
- `resuelto`: Ya resuelto
- `descartado`: No requirió acción

### Índices y Constraints
- PRIMARY KEY: `id`
- FOREIGN KEY: `lead_id` → `leads(id)`
- FOREIGN KEY: `paciente_id` → `pacientes(id)`
- FOREIGN KEY: `consulta_id` → `consultas(id)`
- CHECK: `prioridad IN ('alta', 'normal', 'baja')`
- CHECK: `estado IN ('pendiente', 'en_proceso', 'resuelto', 'descartado')`

### Triggers
- `update_escalamientos_updated_at` (BEFORE UPDATE): Actualiza timestamp

---

## Tabla: `sedes`

### Descripción
Ubicaciones físicas donde se realizan las consultas.

### Campos

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `sede` | text | PK, CHECK UPPERCASE | Código de la sede |
| `calendar_id` | text | NOT NULL | ID del Google Calendar |
| `timezone` | text | DEFAULT 'America/Mexico_City' | Zona horaria |
| `anchor_week_type` | text | Nullable | Tipo de semana ancla |
| `anchor_date` | date | Nullable | Fecha ancla |
| `horario_json` | jsonb | Nullable | Horarios de disponibilidad |
| `display_name` | text | Nullable | Nombre para mostrar |
| `direccion` | text | Nullable | Dirección física |
| `telefono` | text | Nullable | Teléfono de contacto |
| `whatsapp` | text | Nullable | WhatsApp de la sede |
| `maps_url` | text | Nullable | URL de Google Maps |

### Sedes Actuales
- **HERMOSILLO**
- **NOGALES**

### Índices y Constraints
- PRIMARY KEY: `sede`
- CHECK: `sede = UPPER(sede)`

---

## Tabla: `conocimiento_procedimientos_urologia`

### Descripción
Base de conocimiento con embeddings vectoriales para búsqueda semántica (RAG).

### Campos

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | bigint | PK, NOT NULL | Identificador único |
| `content` | text | NOT NULL | Contenido textual |
| `metadata` | jsonb | DEFAULT '{}' | Metadata del contenido |
| `embedding` | vector | Nullable | Vector embedding |

### Uso
Esta tabla se usa para RAG (Retrieval Augmented Generation) con búsqueda vectorial.

```typescript
// Búsqueda semántica
const { data } = await supabase.rpc('match_procedimientos', {
  query_embedding: embedding, // Vector de OpenAI
  match_threshold: 0.7,
  match_count: 5
})
```

### Índices
- PRIMARY KEY: `id`
- Se recomienda crear índice HNSW o IVFFlat en `embedding` para búsqueda rápida

---

## 📊 Resumen de Relaciones

### Leads → Pacientes (1:1)
Un lead puede convertirse en un paciente cuando agenda su primera consulta.

### Pacientes → Consultas (1:N)
Un paciente puede tener múltiples consultas.

### Consultas → Recordatorios (1:N)
Cada consulta genera 4 recordatorios automáticamente.

### Leads/Pacientes → Conversaciones (1:N)
Todas las interacciones se registran en conversaciones.

### Consultas → Sede (N:1)
Cada consulta pertenece a una sede específica.
