# Análisis Detallado de Plataforma CRM-URobot

**Fecha:** 2026-03-09
**Analizado por:** Claude Code
**Alcance:** Tipos, estados, consistencia, performance, errores, seguridad

---

## Resumen Ejecutivo

Se encontraron **60 hallazgos** categorizados por severidad:

| Severidad | Cantidad | Descripción |
|-----------|----------|-------------|
| CRÍTICO | 5 | Bugs que causan fallos silenciosos o pérdida de datos |
| ALTO | 16 | Inconsistencias, race conditions, errores silenciados |
| MEDIO | 21 | Deuda técnica y patrones subóptimos |
| BAJO | 18 | Mejoras de calidad y mantenibilidad |

---

## 1. HALLAZGOS CRÍTICOS

### 1.1 Columna `sede` inexistente en consultas (appointments-service.ts)

**Archivo:** `app/agenda/services/appointments-service.ts:114,138,151`

```typescript
// Línea 114 — COLUMNA INCORRECTA
.eq('sede', data.sede)     // ❌ La tabla consultas NO tiene columna 'sede'

// Línea 138 — INSERT con columna incorrecta
sede: data.sede,           // ❌ Debería ser sede_id (UUID FK → sedes)

// Línea 151 — SELECT con columna incorrecta
.select('id, consulta_id, paciente_id, sede, ...')  // ❌ 'sede' no existe
```

**Columna correcta:** `sede_id` (UUID, FK a tabla `sedes`)

**Impacto:**
- La detección de conflictos de horario **siempre falla silenciosamente** (el error se silencia en línea 120)
- Se pueden crear citas duplicadas en el mismo horario
- El INSERT puede fallar o insertar NULL en sede_id

---

### 1.2 Definición duplicada y divergente de `LeadEstado`

**Archivos:** `types/leads.ts:33-37` vs `app/lib/crm-data.ts:14`

| Estado | types/leads.ts (12 estados) | crm-data.ts (9 estados) |
|--------|:---:|:---:|
| nuevo | ✅ | ✅ |
| interactuando | ✅ | ❌ |
| contactado | ✅ | ✅ |
| cita_propuesta | ✅ | ❌ |
| en_seguimiento | ✅ | ❌ |
| cita_agendada | ✅ | ✅ |
| show | ✅ | ❌ |
| convertido | ✅ | ✅ |
| no_show | ✅ | ❌ |
| perdido | ✅ | ❌ |
| no_interesado | ✅ | ✅ |
| descartado | ✅ | ✅ |
| interesado | ❌ | ✅ (fantasma) |
| calificado | ❌ | ✅ (fantasma) |
| escalado | ❌ | ✅ (fantasma) |

**Impacto:** `crm-data.ts` tiene 3 estados fantasma que no existen en BD y le faltan 6 estados reales. Cualquier código usando estos tipos tiene type safety rota.

---

### 1.3 Definición triple y divergente de `ConsultaEstado`

**3 definiciones diferentes del mismo concepto:**

| Estado | types/consultas.ts | app/agenda/lib/constants.ts | app/lib/crm-data.ts |
|--------|:---:|:---:|:---:|
| Programada | ✅ | ✅ | ✅ |
| Pendiente | ✅ | ❌ | ❌ |
| Confirmada | ✅ | ✅ | ✅ |
| Reagendada | ✅ | ✅ | ✅ |
| Cancelada | ✅ | ✅ | ✅ |
| Completada | ✅ | ✅ | ✅ |
| No Asistió | ✅ | ❌ | ❌ |
| En_Curso | ❌ | ✅ | ❌ |
| No_Acudio | ❌ | ✅ | ❌ |

**Impacto:** Si la BD devuelve `'En_Curso'` o `'No_Acudio'`, el mapper en `consultas.ts` los descartará y los convertirá a `'Programada'` (default). Si devuelve `'No Asistió'`, la agenda no lo reconocerá.

---

### 1.4 Error silenciado en validación de conflictos

**Archivo:** `app/agenda/services/appointments-service.ts:119-120`

```typescript
if (conflictError) { /* silenciado */ }
```

Se silencia intencionalmente un error de Supabase. Combinado con el problema 1.1 (`sede` inexistente), esto significa que **la validación de conflictos nunca funciona** y el error se ignora. Se pueden crear citas duplicadas.

---

### 1.5 `cancelAppointment` sobreescribe `motivo_consulta`

**Archivo:** `app/agenda/services/appointments-service.ts:251`

```typescript
motivo_consulta: `[CANCELADA: ${cancelData.reason}]`
```

Al cancelar una cita, se **destruye** el motivo de consulta original reemplazándolo por el motivo de cancelación. La tabla tiene `cancelado_por` pero no se usa `motivo_cancelacion` porque "no existe columna en BD actual" (comentario línea 250). Sin embargo, la tabla sí tiene `cancelado_por`.

---

## 2. HALLAZGOS DE SEVERIDAD ALTA

### 2.1 Masivo uso de `as any` / `as never` — 45 instancias

Se encontraron **45 casteos inseguros** distribuidos en 19 archivos:

| Archivo | Instancias | Razón declarada |
|---------|-----------|-----------------|
| appointments-service.ts | 6 | "tipos desactualizados" |
| patients-service.ts | 3 | "tipos desactualizados" |
| useConversaciones.ts | 7 | RPC no tipadas |
| useConversacionesStats.ts | 2 | RPC no tipadas |
| useDashboardV2.ts | 1 | RPC no tipada |
| useStats.ts | 1 | RPC no tipada |
| Otros hooks | 25 | RPCs y queries |

**Impacto:** TypeScript no puede validar los datos devueltos por Supabase. Si una RPC cambia su retorno, no habrá errores de compilación.

**Solución:** Regenerar tipos con `supabase gen types typescript` y tipar las RPCs explícitamente.

---

### 2.2 Hardcoded string literals para estados — 30+ instancias

Se encontraron comparaciones directas con strings en lugar de usar las constantes definidas:

```
hooks/leads/useLeadActions.ts:194     → lead.estado === 'convertido'
app/leads/components/LeadActionsModal.tsx:203-217 → múltiples comparaciones
app/agenda/page.tsx:266              → apt.estado === 'Programada'
app/agenda/components/*/             → 'Cancelada', 'Completada' hardcoded
hooks/pacientes/usePacientes.ts:105  → estado === 'activo'
```

**Impacto:** Si se renombra un estado, estas comparaciones fallarán silenciosamente. No hay safety net del compilador.

---

### 2.3 updateAppointment puede borrar motivo_consulta

**Archivo:** `app/agenda/services/appointments-service.ts:207-217`

```typescript
if (updates.motivoConsulta || updates.tipo || updates.prioridad || updates.notasInternas) {
  updatePayload.motivo_consulta = buildMotivoConsulta({
    motivo: updates.motivoConsulta, // Si undefined → "Sin motivo especificado"
```

Si solo se actualiza `prioridad` sin pasar `motivoConsulta`, el motivo se reemplaza por "Sin motivo especificado". El comentario en línea 209 reconoce el bug: "Bug potencial si solo actualizo prioridad".

---

### 2.4 rescheduleAppointment — Race condition

**Archivo:** `app/agenda/services/appointments-service.ts:324-349`

```typescript
const cancelResult = await cancelAppointment(appointmentId, {...});
const createResult = await createAppointment(newData);
await supabase.update({ estado_cita: 'Reagendada' }).eq('consulta_id', appointmentId);
```

Si `createAppointment` falla después de `cancelAppointment`, la cita original queda cancelada sin nueva cita. No hay rollback. Además, el update final a 'Reagendada' puede fallar silenciosamente (no se verifica el resultado).

---

### 2.5 Supabase client instanciado a nivel de módulo

**Archivos:** `appointments-service.ts:15`, `useLeadActions.ts:17`

```typescript
const supabase = createClient(); // ← A nivel de módulo, fuera del componente
```

En Next.js, esto crea un cliente compartido entre requests en el servidor. Para código que solo corre en el browser es aceptable, pero es un anti-patrón que puede causar problemas si alguno de estos archivos se importa en un Server Component.

---

### 2.6 localStorage cache sin límite de tamaño efectivo

**Archivo:** `lib/swr-config.ts:76`

```typescript
const limitedEntries = entries.slice(-50); // Últimos 50 entries
```

Se guardan los **últimos** 50 entries, pero cada entry puede contener arrays de 3000+ leads. Un solo entry de leads paginado podría ser ~500KB+ de JSON serializado, acercándose al límite de 5MB de localStorage.

---

### 2.7 `total_mensajes` incremento no atómico

**Archivo:** `hooks/leads/useLeadActions.ts:488`

```typescript
total_mensajes: (lead.totalMensajes || 0) + 1,
```

Se lee el valor desde el estado local del frontend y se incrementa. Si dos usuarios envían mensajes simultáneamente, uno se pierde. Debería usar una operación atómica de BD (`total_mensajes + 1`).

---

### 2.8 No hay Row Level Security (RLS)

No se encontraron políticas RLS en el codebase ni en migraciones. Cualquier usuario autenticado puede leer/modificar **cualquier** registro de **cualquier** tabla.

**Impacto en datos médicos:** PHI (Protected Health Information) de pacientes accesible sin restricción.

---

## 3. HALLAZGOS DE SEVERIDAD MEDIA

### 3.1 Case normalization frágil en agenda-utils

```typescript
c.estadoCita.toLowerCase() === 'confirmada'  // Depende de case exacto
```

Los estados en BD son PascalCase ('Confirmada'), pero se comparan con toLowerCase(). Si alguien cambia el case en la BD, la comparación falla.

---

### 3.2 Tipos de consulta divergentes: CONSULTA_TIPOS vs TIPOS_CONSULTA

| types/consultas.ts (CONSULTA_TIPOS) | app/agenda/lib/constants.ts (TIPOS_CONSULTA) |
|------|------|
| 'Primera Vez' | 'primera_vez' |
| 'Seguimiento' | 'subsecuente' |
| 'Urgencia' | 'urgencia' |
| 'Procedimiento' | 'procedimiento_menor' |
| 'Valoración' | 'valoracion_prequirurgica' |
| — | 'control_post_op' |
| — | 'teleconsulta' |

Dos convenciones de naming (spaces+PascalCase vs snake_case) y diferentes valores.

---

### 3.3 Type guards inconsistentemente exportados

| Archivo | Guards | Exportados |
|---------|--------|-----------|
| leads.ts | isLeadEstado, isLeadTemperatura, isLeadSubestado | ❌ Privados |
| consultas.ts | isConsultaEstado, isConsultaSede, isConsultaTipo | ❌ Privados |
| pacientes.ts | isPacienteEstado | ✅ Exportado |
| canales-marketing.ts | isCanalMarketing | ❌ Privado |

---

### 3.4 `mapConsultaFromDB` no popula `sede`

**Archivo:** `types/consultas.ts:97`

```typescript
sede: null, // Populated via JOIN if available
```

El mapper siempre retorna `sede: null`. Los consumidores deben hacer JOIN y asignar manualmente, pero no todos lo hacen correctamente.

---

### 3.5 `invalidateDomains()` definida pero no exportada

**Archivo:** `lib/swr-config.ts:293`

La función `invalidateDomains` está definida pero no se exporta, haciéndola inaccesible.

---

### 3.6 `clearCacheKey()` y `clearAllCache()` no exportadas

**Archivo:** `lib/swr-config.ts:304,319`

Funciones útiles definidas pero no exportadas. No se pueden usar desde otros módulos.

---

### 3.7 `LEAD_ESTADOS_CERRADOS` no exportado

**Archivo:** `types/leads.ts:126`

```typescript
const LEAD_ESTADOS_CERRADOS: LeadEstado[] = [...]  // sin export
```

---

### 3.8 Falta state transition matrix para conversaciones

`types/chat.ts` define `FASES_CONVERSACION` pero no tiene una matriz de transiciones válidas como `leads.ts`. Esto permite transiciones inválidas en el flujo de conversación del bot.

---

### 3.9 Acceso a campos de LeadRow via `as Record<string, unknown>`

**Archivo:** `types/leads.ts:301-315`

```typescript
citaOfrecidaAt: (row as Record<string, unknown>).cita_ofrecida_at as string | null ?? null,
campanaId: (row as Record<string, unknown>).campana_id as string | null ?? null,
```

6 campos accedidos con cast inseguro porque no existen en el tipo generado `LeadRow`. Indica que `database.ts` está desactualizado.

---

### 3.10 `PacienteEstado` con case inconsistente

| Archivo | Valores |
|---------|---------|
| types/pacientes.ts | 'activo', 'inactivo', 'alta' (minúsculas) |
| app/lib/crm-data.ts | 'Activo', 'Inactivo' (PascalCase) |
| STATE_COLORS en crm-data.ts | 'Activo', 'Inactivo', 'Alta' (PascalCase) |
| hooks/pacientes/usePacientes.ts:105 | `estado === 'activo'` (minúscula) |

---

### 3.11 `SedeType` inconsistente

| Archivo | Definición |
|---------|-----------|
| crm-data.ts | `'POLANCO' \| 'SATELITE'` (2 sedes) |
| constants.ts | `'POLANCO' \| 'SATELITE' \| 'TRINIDAD' \| 'ALL'` (4 valores) |
| consultas.ts | `'POLANCO' \| 'SATELITE' \| 'TRINIDAD'` (3 sedes) |
| appointments-service.ts | `'POLANCO' \| 'SATELITE' \| 'TRINIDAD'` (3 sedes) |

---

### 3.12 `markPatientArrived` usa 'Completada' como proxy de llegada

**Archivo:** `appointments-service.ts:308`

```typescript
estado_cita: 'Completada', // Usamos Completada como "Llegó/En consulta" por ahora
```

Confunde "paciente llegó" con "consulta completada". La agenda tiene `'En_Curso'` pero no se usa aquí.

---

### 3.13 SWR keys inconsistentes con CACHE_KEYS

`CACHE_KEYS.LEADS` = `'leads-list'` pero `useLeadActions.ts` usa `'lead-historial-${telefono}'`. Las keys no siguen un patrón uniforme.

---

### 3.14 `Recordatorio.status` no alineado con `RecordatorioEstado`

| Recordatorio.status (crm-data.ts:80) | RecordatorioEstado (crm-data.ts:18) |
|------|------|
| pending | pendiente |
| processing | procesando |
| sent | enviado |
| failed | ❌ (no existe) |
| cancelled | ❌ (no existe) |
| — | error |

---

## 4. HALLAZGOS DE SEVERIDAD BAJA

### 4.1 console.log en producción — 14 instancias en 10 archivos

`next.config.ts` tiene `compiler.removeConsole` para production, pero solo para `console.log`. Los `console.warn` y `console.error` pasan (esto es intencional y correcto, pero hay `console.warn` que son realmente debug messages).

### 4.2 Ninguna página usa `"use client"` en page.tsx

Todas las pages son Server Components que importan Client Components. Esto es correcto para Next.js 16, pero algunos pages hacen `await` de Supabase directamente sin manejar errores de autenticación.

### 4.3 83 useEffect en 34 archivos

Muchos pueden ser optimizados. Los 4 useEffects en `useLeadsPaginated.ts` podrían consolidarse.

### 4.4 `formatDate` duplicada

Existe en `app/lib/crm-data.ts:147` y en `lib/date-utils.ts`. Ambas formatean fechas con timezone Mexico City pero con APIs diferentes.

### 4.5 `nanoid` dependency para generar IDs

`appointments-service.ts` importa `nanoid` solo para `generateConsultaId()`. Podría usar `crypto.randomUUID()` nativo.

### 4.6 Sidebar sin validación de ruta activa

El componente Sidebar en `app/components/common/Sidebar.tsx` usa 4 useEffects que podrían simplificarse.

### 4.7 ErrorBoundary puede no capturar errores async

Los Error Boundaries de React no capturan errores en event handlers o código async. Las llamadas a Supabase en hooks no serían capturadas.

### 4.8 `beforeunload` event listener para cache persistence

`swr-config.ts:66` registra listener en `beforeunload`. En mobile browsers, este evento es unreliable. Se puede perder cache.

### 4.9 Tipos no exportados en agenda/constants.ts

`TipoConsulta`, `Sede`, `Prioridad` son tipos locales en `constants.ts` pero no se exportan, forzando a otros archivos a redefinirlos.

### 4.10 `horaConsulta` calculada con `toTimeString()`

**Archivo:** `types/consultas.ts:120`

```typescript
horaConsulta: inicio.toTimeString().slice(0, 5),
```

`toTimeString()` usa el timezone local del servidor/browser, no Mexico City. Debería usar `Intl.DateTimeFormat` con timezone explícito.

### 4.11 `diasDesdeContacto` calculado en mapper, no reactivo

**Archivo:** `types/leads.ts:273`

Se calcula `diasDesdeContacto` en el mapper. Si un lead se muestra por horas sin refetch, el valor queda obsoleto. No es un problema grave por el cache agresivo (15 min).

### 4.12 `getEstadoConfig` fallback silencioso

**Archivo:** `app/agenda/lib/constants.ts:98`

```typescript
return ESTADOS.find(e => e.value === estado) || ESTADOS[0]; // Silently falls back to 'Programada'
```

Si se pasa un estado inválido, devuelve 'Programada' sin warning.

### 4.13 Falta type export para `CacheDomain`

`lib/swr-config.ts:185` — `CacheDomain` es un tipo local no exportado. Los consumidores de `invalidateDomain()` no pueden tipar sus parámetros.

### 4.14 `@js-temporal/polyfill` es un polyfill pesado

Solo se usa en `appointments-service.ts`. Agrega ~40KB al bundle. Podría reemplazarse con `date-fns` que ya está instalada.

### 4.15 Inconsistencia en manejo de telefono

`useLeadByTelefono.ts` normaliza teléfonos (quita 521, 52, etc.) pero `useLeadActions.ts` no normaliza al buscar conversaciones.

---

## 5. HALLAZGOS DE PERFORMANCE Y STATE MANAGEMENT

### 5.1 Dos loops de polling concurrentes (60s cada uno)

**Archivos:** `hooks/urobot/useUrobotStats.ts`, `hooks/urobot/useUrobotMetricasCRM.ts`

En la página de Urobot, `useUrobotStats` usa `SWR_CONFIG_REALTIME` (polling 30s) y `useUrobotMetricasCRM` usa `refreshInterval: 2 * 60 * 1000` (2 min). Para datos estadísticos que no cambian en tiempo real, esto desperdicia batería y hammers la API.

### 5.2 Memory leak — Realtime channels sin cleanup

**Archivo:** `hooks/conversaciones/useConversaciones.ts:159-178`

Las suscripciones Realtime de Supabase no hacen `unsubscribe` en la función de cleanup del useEffect:

```typescript
// Falta: return () => { supabase.removeChannel(channel) }
```

Cada vez que el componente se desmonta y remonta, se crea un nuevo channel sin cerrar el anterior.

### 5.3 N+1 queries en useLeadActions

**Archivo:** `hooks/leads/useLeadActions.ts:90-182`

`analizarHistorialConversacion()` ejecuta 2 queries secuenciales:
1. `SELECT id FROM conversaciones WHERE telefono = X`
2. `SELECT * FROM mensajes WHERE conversacion_id = id`

Debería ser un solo RPC que retorne el historial analizado desde PostgreSQL.

### 5.4 Componentes monolíticos causan re-renders cascada

| Componente | Líneas | Problema |
|------------|--------|----------|
| HeatmapView.tsx | 729 | Calendario heatmap monolítico |
| DashboardClient.tsx | 658 | Header + KPIs + Charts en un solo componente |
| LeadClinicSidebar.tsx | 624 | Sidebar, Stats, Clinical, Chat juntos |
| agenda/page.tsx | 607 | Demasiada lógica en page |

Cualquier cambio de estado en un hook re-renderiza **todo** el componente. Deberían dividirse en sub-componentes memoizados.

### 5.5 Múltiples hooks no exponen errores a componentes

| Hook | Comportamiento en error |
|------|------------------------|
| useLeadByTelefono | Retorna `null` silenciosamente |
| useLeadConversation | Retorna `[]` en error |
| useLeadActions | Swallows error en historial |
| useBloqueo | `console.error` pero no retorna |
| useConsultasStats | Error no expuesto |
| useDashboardV2 | Error del parser ignorado |

Los componentes no pueden distinguir "cargando" vs "falló" vs "vacío".

### 5.6 Doble fetch en conversaciones con Realtime

**Archivo:** `hooks/conversaciones/useConversaciones.ts:159-178`

Cuando cambia el teléfono activo:
1. SWR crea nueva key → fetch mensajes
2. Realtime subscription → trigger `mutateConversaciones` → otro fetch

Resultado: doble solicitud HTTP por cada cambio de conversación.

### 5.7 `marcarComoLeido` es un no-op

**Archivo:** `hooks/conversaciones/useConversaciones.ts:181-184`

La función existe en la interfaz del hook pero no hace nada. Feature incompleto que puede confundir a consumidores.

### 5.8 Memoización faltante en hooks de urobot

**Archivo:** `hooks/urobot/useUrobotMetricasCRM.ts:264-293`

Arrays `porHora` e `intents` se reconstruyen en cada fetch sin memoización. Deberían usar `useMemo` con la data como dependencia.

---

## 6. HALLAZGOS DE API, ERRORES Y RACE CONDITIONS

### 6.1 Race condition en `getOrCreatePatient()` (check-then-create)

**Archivo:** `app/agenda/services/patients-service.ts:195-211`

Dos queries secuenciales sin transacción:
1. Buscar paciente por teléfono
2. Buscar por email si no se encontró
3. Crear si no existe

Entre el check y el create, otro usuario podría crear el mismo paciente → duplicado. Debería usar UPSERT con constraint único.

### 6.2 Error de conversión de lead silenciado

**Archivo:** `app/agenda/services/patients-service.ts:127-129`

```typescript
try { /* Update lead if exists */ }
catch { /* No bloqueamos la creación del paciente si falla */ }
```

Si falla marcar el lead como convertido, el usuario no sabe que el lead sigue en su estado anterior. Se pierde la trazabilidad lead→paciente.

### 6.3 Inconsistencia en patrones de error de RPCs

| RPC | Archivo | Patrón |
|-----|---------|--------|
| `transition_lead_estado` | useLeadActions.ts | Retorna `{ success, error }` |
| `get_mensajes_por_telefono` | useConversaciones.ts | Hace `throw error` |
| `guardar_mensaje_urobot` | useConversaciones.ts | Hace `throw error` |
| `bloquear_numero` | useBloqueo.ts | Retorna `{ success, error }` |

Unos RPCs hacen throw, otros retornan objetos. Los consumidores no saben qué esperar.

### 6.4 Falta optimistic update en envío de mensajes

**Archivo:** `hooks/conversaciones/useConversaciones.ts:187-205`

Cuando se envía un mensaje:
1. Se llama RPC `guardar_mensaje_urobot`
2. Se espera respuesta
3. Se invalida cache

El mensaje "desaparece" momentáneamente y reaparece cuando el cache se refresca. Debería agregarse optimistic update para UX fluida.

### 6.5 Sin sistema de notificaciones/toasts para errores

Ninguno de los 5 archivos de servicios/hooks principales muestra notificaciones al usuario en caso de error. Los errores solo van a `console.error()`. El usuario no recibe feedback cuando:
- Falla crear una cita
- Falla enviar un mensaje
- Falla cambiar el estado de un lead
- Falla la conversión lead→paciente

### 6.6 Conflict check incompleto en citas

**Archivo:** `app/agenda/services/appointments-service.ts:107-117`

La detección de conflictos solo verifica `fecha_hora_inicio` con `gte/lt`, pero **no verifica `fecha_hora_fin`**. Esto permite crear citas que se solapan parcialmente:

```
Cita existente: 10:00 - 11:00
Nueva cita:     10:30 - 11:30  ← NO detectada como conflicto
```

### 6.7 Validación de teléfono después de normalización

**Archivo:** `app/agenda/services/patients-service.ts:74`

La normalización del teléfono ocurre después de la validación de formato. Si el teléfono normalizado cambia de longitud, la validación previa pierde sentido.

### 6.8 `enviarMensajeWhatsApp` no valida formato de teléfono

**Archivo:** `hooks/leads/useLeadActions.ts:408-421`

`generarWhatsAppURL()` asume que si el teléfono tiene 10 dígitos, es mexicano y agrega `52`. No valida el formato ni el resultado final, generando URLs potencialmente inválidas.

---

## 7. RESUMEN DE ACCIONES RECOMENDADAS

### Prioridad 1 — Fix inmediato (Críticos)

1. **Cambiar `sede` → `sede_id`** en appointments-service.ts (líneas 114, 138, 151, 204)
2. **Eliminar `crm-data.ts` LeadEstado** y usar `types/leads.ts` como única fuente
3. **Unificar ConsultaEstado** — decidir los estados canónicos y eliminar las otras 2 definiciones
4. **Dejar de silenciar** errores de conflicto (línea 120)
5. **No sobreescribir motivo_consulta** en cancelación

### Prioridad 2 — Esta semana (Altos)

6. **Regenerar `types/database.ts`** con `supabase gen types typescript`
7. **Reemplazar `as any`** con tipos correctos (45 instancias)
8. **Reemplazar hardcoded strings** con constantes importadas
9. **Implementar RLS** al menos para tabla `pacientes`
10. **Hacer `total_mensajes` atómico** usando SQL `total_mensajes + 1`
11. **Agregar rollback** a rescheduleAppointment (usar transacción o RPC atómica)
12. **Usar timezone en `horaConsulta`**
13. **Agregar cleanup de Realtime channels** en useConversaciones
14. **Reducir polling** en useUrobotStats y useUrobotMetricasCRM
15. **Usar UPSERT** en `getOrCreatePatient()` para evitar race condition
16. **Fix conflict check** — verificar `fecha_hora_fin` además de inicio
17. **Estandarizar error handling** en RPCs (throw vs return object)
18. **Agregar sistema de toasts/notificaciones** para feedback de errores al usuario

### Prioridad 3 — Sprint siguiente (Medios)

19. **Exportar type guards** consistentemente
20. **Unificar CONSULTA_TIPOS** naming convention
21. **Unificar PacienteEstado** case convention
22. **Agregar transition matrix** para chat/conversaciones
23. **Exportar funciones útiles** de swr-config.ts
24. **Usar `En_Curso`** para markPatientArrived
25. **Limpiar `Recordatorio.status`** alinearlo con `RecordatorioEstado`
26. **Exponer errores en hooks** (useLeadByTelefono, useLeadConversation, etc.)
27. **Dividir componentes monolíticos** (DashboardClient, LeadClinicSidebar, HeatmapView)
28. **Consolidar N+1 queries** en useLeadActions (crear RPC única)
29. **Implementar `marcarComoLeido`** o eliminar la función no-op
30. **Agregar optimistic updates** para envío de mensajes en useConversaciones
31. **No silenciar error** de conversión lead→paciente en patients-service.ts

---

## Arquitectura General — Evaluación

| Aspecto | Evaluación | Notas |
|---------|-----------|-------|
| Stack tecnológico | ⭐⭐⭐⭐⭐ | Next.js 16, React 19, Supabase, SWR, Zustand — excelente |
| Estructura de carpetas | ⭐⭐⭐⭐ | Bien organizado por dominio |
| Caching strategy | ⭐⭐⭐⭐ | SWR + localStorage, domain invalidation — sofisticado |
| Type safety | ⭐⭐ | Buena intención pero rota por tipos desactualizados y `as any` |
| Estado/Consistencia | ⭐⭐ | Múltiples fuentes de verdad para los mismos conceptos |
| Error handling | ⭐⭐⭐ | Presente pero inconsistente (algunos errores silenciados) |
| Seguridad | ⭐⭐ | Sin RLS, sin validación de inputs en algunos endpoints |
| Performance | ⭐⭐⭐⭐ | Buenas optimizaciones (Turbopack, tree-shaking, cache agresivo) |
| Mantenibilidad | ⭐⭐⭐ | Código bien documentado pero con deuda técnica acumulada |
