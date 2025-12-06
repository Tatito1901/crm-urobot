# 🗄️ UROBOT - Documentación de Base de Datos

**Proyecto:** Urobot CRM  
**Base de datos:** Supabase (PostgreSQL 17)  
**Región:** ca-central-1  
**Última actualización:** 2025-12-05

---

## 📊 Resumen General

| Tabla | Registros | Descripción |
|-------|-----------|-------------|
| `consultas` | ~3,459 | Citas médicas programadas |
| `consultas_notas` | ~3,083 | Notas clínicas por consulta |
| `pacientes` | ~2,380 | Pacientes registrados |
| `conversaciones` | ~534 | Historial de mensajes WhatsApp |
| `urobot_logs` | ~242 | Logs del bot de WhatsApp |
| `conocimiento_procedimientos_urologia_v2` | ~101 | Base de conocimiento RAG |
| `leads` | ~36 | Prospectos (contactos nuevos) |
| `notification_queue` | ~8 | Cola de recordatorios |
| `sedes` | 3 | Ubicaciones (Polanco, Satélite) |
| `urobot_alertas` | ~1 | Alertas del bot |
| `lead_seguimientos` | 0 | Historial de seguimiento leads |
| `destinos_pacientes` | 0 | Destinos finales (cirugías, altas) |

---

## 🔗 Diagrama de Relaciones

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     sedes       │     │    pacientes    │     │     leads       │
│─────────────────│     │─────────────────│     │─────────────────│
│ sede (PK)       │◄────│ id (PK)         │◄────│ id (PK)         │
│ display_name    │     │ nombre_completo │     │ paciente_id (FK)│
│ direccion       │     │ telefono (UK)   │     │ telefono_whatsapp│
│ calendar_id     │     │ email           │     │ estado          │
│ horario_json    │     │ antecedentes    │     │ tipo_contacto   │
└────────┬────────┘     │ medicamentos    │     │ prioridad       │
         │              │ alergias        │     │ score           │
         │              │ notas           │     └────────┬────────┘
         │              └────────┬────────┘              │
         │                       │                       │
         │              ┌────────┴────────┐     ┌────────┴────────┐
         │              │                 │     │ lead_seguimientos│
         │              ▼                 ▼     │─────────────────│
         │     ┌─────────────────┐  ┌─────────────────┐  │ lead_id (FK)  │
         │     │   consultas     │  │ destinos_pacientes│ │ tipo_accion   │
         │     │─────────────────│  │─────────────────│  │ descripcion   │
         └────►│ id (PK)         │  │ paciente_id (FK)│  └───────────────┘
               │ paciente_id (FK)│  │ tipo_destino    │
               │ sede (FK)       │  │ tipo_cirugia    │
               │ fecha_hora_inicio│ │ monto           │
               │ estado_cita     │  └─────────────────┘
               │ motivo_consulta │
               └────────┬────────┘
                        │
               ┌────────┴────────┐
               │ consultas_notas │
               │─────────────────│
               │ consulta_id (FK)│
               │ paciente_id (FK)│
               │ nota            │
               │ titulo          │
               │ fecha           │
               └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│  conversaciones │     │   urobot_logs   │
│─────────────────│     │─────────────────│
│ telefono        │     │ telefono        │
│ rol             │     │ mensaje_usuario │
│ mensaje         │     │ mensaje_bot     │
│ tipo_mensaje    │     │ tiene_error     │
│ media_url       │     │ tiempo_respuesta│
└─────────────────┘     └────────┬────────┘
                                 │
                        ┌────────┴────────┐
                        │ urobot_alertas  │
                        │─────────────────│
                        │ log_id (FK)     │
                        │ tipo_alerta     │
                        │ severidad       │
                        └─────────────────┘

┌─────────────────────────────────────┐
│ conocimiento_procedimientos_urologia│
│─────────────────────────────────────│
│ content (texto)                     │
│ embedding (vector 1536)             │
│ metadata (jsonb)                    │
│ tsv (full-text search)              │
└─────────────────────────────────────┘

┌─────────────────┐
│notification_queue│
│─────────────────│
│ consulta_id (FK)│
│ phone_number    │
│ message_body    │
│ status          │
│ reminder_type   │
└─────────────────┘
```

---

## 📋 Tablas Detalladas

### 1. `pacientes` - Pacientes Registrados

| Columna | Tipo | Default | Nullable | Descripción |
|---------|------|---------|----------|-------------|
| `id` | uuid | gen_random_uuid() | NO | PK |
| `nombre_completo` | text | - | YES | Nombre del paciente |
| `telefono` | text | - | NO | **UNIQUE** - Teléfono normalizado a 10 dígitos |
| `email` | text | - | YES | Email |
| `fecha_nacimiento` | date | - | YES | Fecha de nacimiento |
| `origen_lead` | text | 'WhatsApp' | YES | Origen del paciente |
| `estado` | text | 'Activo' | YES | Activo, Inactivo, Alta |
| `notas` | text | - | YES | Notas administrativas |
| `antecedentes` | text | - | YES | **Historial médico para Urobot** |
| `medicamentos` | text | - | YES | Medicamentos actuales |
| `alergias` | text | - | YES | Alergias conocidas |
| `doctoralia_id` | text | - | YES | **UNIQUE** - ID de Doctoralia |
| `created_at` | timestamptz | now() | YES | - |
| `updated_at` | timestamptz | now() | YES | - |

---

### 2. `consultas` - Citas Médicas

| Columna | Tipo | Default | Nullable | Descripción |
|---------|------|---------|----------|-------------|
| `id` | uuid | gen_random_uuid() | NO | PK |
| `consulta_id` | text | - | YES | **UNIQUE** - ID legible (ej: "SAT-20251206-1000") |
| `paciente_id` | uuid | - | YES | FK → pacientes |
| `sede` | text | - | YES | FK → sedes |
| `fecha_hora_inicio` | timestamptz | - | NO | Fecha/hora UTC de la cita |
| `fecha_hora_fin` | timestamptz | - | YES | Fin de la cita |
| `estado_cita` | text | 'Programada' | YES | Programada, Completada, Cancelada, Pendiente |
| `estado_confirmacion` | text | 'Pendiente' | YES | Pendiente, Confirmada, Cancelada |
| `motivo_consulta` | text | - | YES | Motivo de la consulta |
| `tipo_cita` | text | 'Primera Vez' | YES | Primera Vez, Seguimiento |
| `origen` | text | 'Sistema' | YES | Sistema, Doctoralia, Google Calendar |
| `calendar_event_id` | text | - | YES | ID del evento en Google Calendar |
| `calendar_link` | text | - | YES | Link al evento |
| `doctoralia_event_id` | text | - | YES | **UNIQUE** - ID de Doctoralia |
| `confirmado_paciente` | boolean | false | YES | Si el paciente confirmó |
| `recordatorio_48h_enviado` | boolean | false | YES | - |
| `recordatorio_24h_enviado` | boolean | false | YES | - |
| `recordatorio_2h_enviado` | boolean | false | YES | - |
| `cancelado_por` | text | - | YES | paciente, sistema, doctor |
| `created_at` | timestamptz | now() | YES | - |
| `updated_at` | timestamptz | now() | YES | - |

---

### 3. `leads` - Prospectos

> ⚠️ **Regla de negocio:** Un lead es EXCLUSIVAMENTE un contacto NUEVO que nunca ha sido paciente. Si el teléfono ya existe en `pacientes`, el insert es rechazado automáticamente.

| Columna | Tipo | Default | Nullable | Descripción |
|---------|------|---------|----------|-------------|
| `id` | uuid | gen_random_uuid() | NO | PK |
| `paciente_id` | uuid | - | YES | FK → pacientes (cuando se convierte) |
| `telefono_whatsapp` | text | - | NO | **UNIQUE** - Teléfono 10 dígitos |
| `nombre_completo` | text | - | YES | Nombre del prospecto |
| `estado` | text | 'Nuevo' | YES | Nuevo, Contactado, Interesado, Calificado, Convertido, No_Interesado, Perdido |
| `tipo_contacto` | text | 'prospecto' | YES | prospecto, paciente_existente, reenganche, referido |
| `motivo_contacto` | text | 'consulta_nueva' | YES | consulta_nueva, duda_medica, seguimiento_cita, etc. |
| `prioridad` | text | 'media' | YES | baja, media, alta, urgente |
| `score` | integer | 0 | YES | Score 0-100 basado en engagement |
| `etiquetas` | text[] | '{}' | YES | Etiquetas para segmentación |
| `fuente_lead` | text | 'Orgánico' | YES | Fuente de captación |
| `canal_marketing` | text | - | YES | Google Ads, Facebook, etc. |
| `notas_iniciales` | text | - | YES | Notas del primer contacto |
| `notas_seguimiento` | text | - | YES | Notas de seguimiento |
| `session_id` | text | - | YES | Session ID de Urobot |
| `total_interacciones` | integer | 1 | YES | Contador de mensajes |
| `fecha_primer_contacto` | timestamptz | now() | YES | - |
| `ultima_interaccion` | timestamptz | now() | YES | - |
| `ultimo_seguimiento` | timestamptz | - | YES | - |
| `proximo_seguimiento` | timestamptz | - | YES | - |
| `asignado_a` | text | - | YES | Persona responsable |
| `fecha_conversion` | timestamptz | - | YES | Cuando se convirtió a paciente |
| `created_at` | timestamptz | now() | YES | - |
| `updated_at` | timestamptz | now() | YES | - |

---

### 4. `consultas_notas` - Notas Clínicas

| Columna | Tipo | Default | Nullable | Descripción |
|---------|------|---------|----------|-------------|
| `id` | uuid | gen_random_uuid() | NO | PK |
| `consulta_id` | uuid | - | YES | FK → consultas |
| `paciente_id` | uuid | - | YES | FK → pacientes |
| `titulo` | text | - | YES | Título de la nota |
| `nota` | text | - | NO | Contenido de la nota clínica |
| `fecha` | date | - | YES | Fecha de la nota |
| `origen` | text | 'Sistema' | YES | Sistema, Doctoralia |
| `doctoralia_episode_id` | text | - | YES | **UNIQUE** - ID de episodio Doctoralia |
| `created_at` | timestamptz | now() | YES | - |
| `updated_at` | timestamptz | now() | YES | - |

---

### 5. `conversaciones` - Historial de WhatsApp

| Columna | Tipo | Default | Nullable | Descripción |
|---------|------|---------|----------|-------------|
| `id` | uuid | gen_random_uuid() | NO | PK |
| `telefono` | text | - | NO | Teléfono (normalizado a 10 dígitos) |
| `rol` | text | - | NO | 'usuario' o 'asistente' |
| `mensaje` | text | - | NO | Contenido del mensaje |
| `tipo_mensaje` | text | 'text' | YES | text, image, audio, video, document, sticker, location |
| `media_url` | text | - | YES | URL del archivo multimedia |
| `media_mime_type` | text | - | YES | MIME type del archivo |
| `media_filename` | text | - | YES | Nombre original del archivo |
| `media_caption` | text | - | YES | Caption del archivo |
| `media_duration_seconds` | integer | - | YES | Duración (audio/video) |
| `media_width` | integer | - | YES | Ancho (imágenes) |
| `media_height` | integer | - | YES | Alto (imágenes) |
| `created_at` | timestamptz | now() | YES | - |

---

### 6. `sedes` - Ubicaciones

| Columna | Tipo | Default | Nullable | Descripción |
|---------|------|---------|----------|-------------|
| `sede` | text | - | NO | **PK** - POLANCO, SATELITE |
| `display_name` | text | - | YES | Nombre para mostrar |
| `direccion` | text | - | YES | Dirección completa |
| `maps_url` | text | - | YES | Link a Google Maps |
| `calendar_id` | text | - | YES | ID del calendario de Google |
| `horario_json` | jsonb | - | YES | Horarios por día de la semana |
| `timezone` | text | 'America/Mexico_City' | YES | Zona horaria |
| `anchor_date` | date | - | YES | Fecha ancla para semanas alternas |
| `anchor_week_type` | text | - | YES | Tipo de semana (A/B) |
| `instrucciones_llegada` | text | - | YES | Instrucciones para llegar |
| `updated_at` | timestamptz | now() | YES | - |

---

### 7. `notification_queue` - Cola de Recordatorios

| Columna | Tipo | Default | Nullable | Descripción |
|---------|------|---------|----------|-------------|
| `id` | uuid | gen_random_uuid() | NO | PK |
| `consulta_id` | uuid | - | YES | FK → consultas |
| `phone_number` | text | - | NO | Teléfono destino |
| `message_body` | text | - | NO | Contenido del mensaje |
| `status` | notification_status | 'pending' | YES | pending, processing, sent, failed, cancelled |
| `reminder_type` | text | - | YES | 48h, 24h, 2h, confirmacion |
| `priority` | integer | 5 | YES | 1 (alta) - 10 (baja) |
| `attempt_count` | integer | 0 | YES | Intentos realizados |
| `next_attempt_at` | timestamptz | now() | YES | Próximo intento |
| `worker_id` | text | - | YES | ID del worker que lo procesa |
| `claimed_at` | timestamptz | - | YES | Cuando fue tomado por worker |
| `sent_at` | timestamptz | - | YES | Cuando fue enviado |
| `error_log` | text | - | YES | Log de errores |
| `metadata` | jsonb | '{}' | YES | Datos adicionales |
| `created_at` | timestamptz | now() | YES | - |
| `updated_at` | timestamptz | now() | YES | - |

---

### 8. `urobot_logs` - Logs del Bot

| Columna | Tipo | Default | Nullable | Descripción |
|---------|------|---------|----------|-------------|
| `id` | uuid | gen_random_uuid() | NO | PK |
| `telefono` | varchar | - | YES | Teléfono del usuario |
| `session_id` | varchar | - | YES | ID de sesión |
| `mensaje_usuario` | text | - | YES | Mensaje recibido |
| `mensaje_bot` | text | - | YES | Respuesta enviada |
| `mensaje_original_bot` | text | - | YES | Respuesta antes de modificación |
| `herramientas_llamadas` | jsonb | '[]' | YES | Tools utilizados |
| `tiene_cita_pendiente` | boolean | - | YES | Si el usuario tiene cita |
| `fue_validado` | boolean | false | YES | Si pasó por validación |
| `paso_validacion` | boolean | - | YES | Resultado de validación |
| `razones_fallo` | text[] | - | YES | Razones de fallo |
| `fue_modificado` | boolean | false | YES | Si la respuesta fue modificada |
| `tiene_error` | boolean | false | YES | Si hubo error |
| `tipo_error` | varchar | - | YES | Tipo de error |
| `detalle_error` | text | - | YES | Descripción del error |
| `stack_trace` | text | - | YES | Stack trace |
| `tiempo_respuesta_ms` | integer | - | YES | Tiempo de respuesta |
| `tokens_entrada` | integer | - | YES | Tokens de entrada |
| `tokens_salida` | integer | - | YES | Tokens de salida |
| `tipo_interaccion` | varchar | - | YES | agendar, consulta, etc. |
| `sentiment` | varchar | - | YES | Sentimiento detectado |
| `requirio_escalacion` | boolean | false | YES | Si requirió escalación |
| `created_at` | timestamptz | now() | YES | - |

---

### 9. `conocimiento_procedimientos_urologia_v2` - Base de Conocimiento RAG

| Columna | Tipo | Default | Nullable | Descripción |
|---------|------|---------|----------|-------------|
| `id` | uuid | gen_random_uuid() | NO | PK |
| `content` | text | - | YES | Contenido del documento |
| `metadata` | jsonb | - | YES | Metadatos (procedimiento, categoría, etc.) |
| `embedding` | vector(1536) | - | YES | Embedding para búsqueda semántica |
| `tsv` | tsvector | auto-generado | YES | Full-text search en español |

---

## 🔧 ENUMS (Tipos Personalizados)

### `notification_status`
```sql
'pending' | 'processing' | 'sent' | 'failed' | 'cancelled'
```

### `lead_prioridad_enum`
```sql
'baja' | 'media' | 'alta' | 'urgente'
```

### `tipo_contacto_enum`
```sql
'prospecto' | 'paciente_existente' | 'reenganche' | 'referido'
```

### `motivo_contacto_enum`
```sql
'consulta_nueva' | 'duda_medica' | 'seguimiento_cita' | 'reagendar' | 
'cancelar' | 'resultados' | 'cotizacion' | 'ubicacion' | 'otro'
```

---

## ⚡ TRIGGERS

### Tabla `leads`

| Trigger | Timing | Evento | Función | Descripción |
|---------|--------|--------|---------|-------------|
| `tr_classify_lead` | BEFORE | INSERT | `classify_lead_on_insert()` | **Rechaza insert si teléfono existe en pacientes** |
| `trg_auto_convert_lead` | BEFORE | UPDATE | `fn_auto_convert_lead_on_paciente()` | Auto-convierte cuando se asigna paciente_id |
| `trg_graduate_nuevo_lead` | BEFORE | UPDATE | `fn_graduate_nuevo_lead()` | Gradúa de 'Nuevo' a 'Contactado' |
| `update_leads_updated_at` | BEFORE | UPDATE | `update_updated_at_column()` | Actualiza updated_at |

### Tabla `consultas`

| Trigger | Timing | Evento | Función | Descripción |
|---------|--------|--------|---------|-------------|
| `trg_update_lead_on_appointment` | AFTER | INSERT | `update_lead_on_appointment()` | Actualiza lead cuando se crea cita |
| `update_consultas_updated_at` | BEFORE | UPDATE | `update_updated_at_column()` | Actualiza updated_at |

### Tabla `pacientes`

| Trigger | Timing | Evento | Función | Descripción |
|---------|--------|--------|---------|-------------|
| `trg_normalizar_telefono_pacientes` | BEFORE | INSERT/UPDATE | `normalizar_telefono_trigger()` | Normaliza teléfono a 10 dígitos |
| `update_pacientes_updated_at` | BEFORE | UPDATE | `update_updated_at_column()` | Actualiza updated_at |

### Tabla `conversaciones`

| Trigger | Timing | Evento | Función | Descripción |
|---------|--------|--------|---------|-------------|
| `trg_normalizar_telefono_conv` | BEFORE | INSERT/UPDATE | `trigger_normalizar_telefono_conv()` | Normaliza teléfono a 10 dígitos |

### Tabla `notification_queue`

| Trigger | Timing | Evento | Función | Descripción |
|---------|--------|--------|---------|-------------|
| `trg_normalizar_telefono_queue` | BEFORE | INSERT/UPDATE | `trigger_normalizar_telefono_queue()` | Normaliza teléfono |
| `trigger_update_notification_queue_timestamp` | BEFORE | UPDATE | `update_notification_queue_timestamp()` | Actualiza timestamps |

---

## 🔨 FUNCIONES PRINCIPALES

### Agendamiento

| Función | Descripción |
|---------|-------------|
| `upsert_appointment_atomic_from_calendar()` | Crea/actualiza cita atómicamente desde calendario |
| `buscar_citas_por_telefono()` | Busca citas de un paciente por teléfono |
| `buscar_consulta_para_reagendar()` | Busca cita para reagendar |
| `confirmar_cita_con_mensaje()` | Confirma cita y encola mensaje |

### Leads

| Función | Descripción |
|---------|-------------|
| `classify_lead_on_insert()` | **Rechaza lead si teléfono es de paciente existente** |
| `upsert_lead_interaction()` | Crea o actualiza interacción de lead |
| `calculate_lead_score()` | Calcula score del lead |

### Notificaciones

| Función | Descripción |
|---------|-------------|
| `claim_notification_jobs()` | Reclama trabajos de la cola |
| `cancelar_citas_sin_confirmar_v2()` | Cancela citas no confirmadas |
| `auto_cancelar_citas_no_confirmadas()` | Auto-cancela citas sin confirmar |

### Sincronización

| Función | Descripción |
|---------|-------------|
| `sync_paciente_doctoralia()` | Sincroniza paciente desde Doctoralia |
| `sync_consulta_doctoralia()` | Sincroniza consulta desde Doctoralia |
| `get_dashboard_stats()` | Obtiene KPIs para dashboard |

### Utilidades

| Función | Descripción |
|---------|-------------|
| `to_mx10()` | Normaliza teléfono a 10 dígitos mexicanos |
| `normalizar_telefono_trigger()` | Trigger de normalización |
| `update_updated_at_column()` | Actualiza columna updated_at |

---

## 👁️ VISTAS

### `paciente_stats`
Estadísticas de consultas por paciente.

```sql
SELECT paciente_id, total_consultas, ultima_consulta, 
       consultas_completadas, consultas_canceladas, consultas_programadas
FROM paciente_stats;
```

### `v_leads_clasificados`
Vista enriquecida de leads con estado de seguimiento.

```sql
SELECT id, telefono_whatsapp, nombre_completo, estado, tipo_contacto,
       prioridad, score, dias_sin_contacto, estado_seguimiento
FROM v_leads_clasificados;
```

### `v_urobot_stats_diarias`
Estadísticas diarias del bot (últimos 30 días).

```sql
SELECT fecha, total_mensajes, usuarios_unicos, total_errores,
       tiempo_promedio_ms, intentos_agendar, escalaciones
FROM v_urobot_stats_diarias;
```

### `v_urobot_errores_recientes`
Últimos 100 errores del bot.

```sql
SELECT id, telefono, tipo_error, detalle_error, severidad
FROM v_urobot_errores_recientes;
```

---

## 🔍 ÍNDICES PRINCIPALES

### `pacientes`
- `pacientes_telefono_key` (UNIQUE) - Búsqueda por teléfono
- `idx_pacientes_nombre_trgm` (GIN) - Búsqueda fuzzy por nombre
- `idx_pacientes_telefono_trgm` (GIN) - Búsqueda fuzzy por teléfono
- `idx_pacientes_estado` - Filtro por estado

### `consultas`
- `idx_consultas_fecha_hora` - Ordenamiento por fecha
- `idx_consultas_paciente_id` - Citas por paciente
- `idx_consultas_sede_fecha` - Citas por sede
- `idx_consultas_programadas` - Solo citas programadas
- `idx_consultas_unique_paciente_fecha` (UNIQUE) - Evita duplicados

### `leads`
- `leads_telefono_whatsapp_key` (UNIQUE) - Un lead por teléfono
- `idx_leads_estado` - Filtro por estado
- `idx_leads_prioridad` - Ordenamiento por prioridad
- `idx_leads_score` - Ordenamiento por score

### `conversaciones`
- `idx_conversaciones_telefono_fecha` - Historial por teléfono

### `conocimiento_procedimientos_urologia_v2`
- `idx_conocimiento_embedding_hnsw` (HNSW) - Búsqueda vectorial rápida
- `idx_conocimiento_tsv` (GIN) - Full-text search

---

## 🔐 REGLAS DE NEGOCIO IMPORTANTES

### 1. Leads vs Pacientes
> Un **LEAD** es exclusivamente un contacto NUEVO que **nunca ha sido paciente**.
> 
> El trigger `classify_lead_on_insert()` rechaza automáticamente cualquier intento de crear un lead con un teléfono que ya existe en `pacientes`.

### 2. Normalización de Teléfonos
> Todos los teléfonos se normalizan automáticamente a **10 dígitos mexicanos** (sin código de país).
> 
> Función: `to_mx10()` / Triggers en todas las tablas con teléfono.

### 3. Unicidad de Citas
> No puede haber dos citas para el mismo paciente en la misma fecha/hora.
> 
> Índice: `idx_consultas_unique_paciente_fecha`

### 4. Recordatorios Automáticos
> Los recordatorios se encolan en `notification_queue` y se procesan por un worker externo.
> 
> Tipos: 48h, 24h, 2h antes de la cita.

### 5. Sincronización Doctoralia
> Los pacientes y consultas de Doctoralia se sincronizan automáticamente.
> 
> Se identifican por `doctoralia_id` y `doctoralia_event_id`.

---

## 📈 Métricas del Dashboard

La función `get_dashboard_stats()` retorna:

```json
{
  "kpi": {
    "totalPacientes": 2380,
    "pacientesNuevosMes": 45,
    "consultasMes": 120,
    "consultasConfirmadasMes": 98,
    "tasaAsistencia": 85,
    "tasaConversion": 65,
    "totalLeads": 36,
    "leadsNuevosMes": 12
  },
  "consultasPorSede": [...],
  "estadoCitas": [...],
  "evolucionMensual": [...],
  "funnelLeads": [...]
}
```

---

*Documento generado automáticamente - Urobot CRM*
