# 🔍 Análisis de Inconsistencias - Base de Datos, n8n y CRM

**Fecha:** 17 de Noviembre 2025  
**Análisis:** Esquema Supabase vs Tipos Frontend vs Flujos n8n

---

## 📋 Resumen Ejecutivo

### Estado General: ⚠️ INCONSISTENCIAS ENCONTRADAS

**Total de inconsistencias:** 12 detectadas
- 🔴 **CRÍTICAS:** 3 (requieren corrección inmediata)
- 🟡 **MEDIAS:** 5 (deben corregirse pronto)
- 🟢 **MENORES:** 4 (mejoras sugeridas)

---

## 🔴 INCONSISTENCIAS CRÍTICAS

### 1. **Nombres de Campos Diferentes (Snake_case vs CamelCase)**

**Problema:** Base de datos usa `snake_case`, frontend usa `camelCase`

#### **En Base de Datos (Supabase):**
```sql
estado_cita
estado_confirmacion
confirmado_paciente
fecha_confirmacion
motivo_consulta
duracion_minutos
calendar_event_id
```

#### **En Frontend (TypeScript):**
```typescript
estadoCita          // ❌ NO EXISTE en BD
estadoConfirmacion  // ❌ NO EXISTE en BD
confirmadoPaciente  // ❌ NO EXISTE en BD
fechaConfirmacion   // ❌ NO EXISTE en BD
motivoConsulta      // ❌ NO EXISTE en BD
duracionMinutos     // ❌ NO EXISTE en BD
calendarEventId     // ❌ NO EXISTE en BD
```

**Impacto:** 🔴 **ALTO**
- Las queries fallan silenciosamente
- Los datos no se mapean correctamente
- Posibles bugs en confirmaciones

**Solución Requerida:**
```typescript
// OPCIÓN 1: Usar tipos generados de Supabase (RECOMENDADO)
import { Database } from '@/types/supabase';
type Consulta = Database['public']['Tables']['consultas']['Row'];

// OPCIÓN 2: Mapeo manual en hooks
const mapConsulta = (raw: any) => ({
  estadoCita: raw.estado_cita,
  confirmadoPaciente: raw.confirmado_paciente,
  // ... resto de campos
});
```

**Archivos Afectados:**
- `types/consultas.ts`
- `types/agenda.ts`
- `hooks/useConsultas.ts`
- `hooks/useRecordatorios.ts`
- `app/agenda/services/appointments-service.ts`

---

### 2. **Estados de Lead Inconsistentes**

**En Base de Datos:**
```sql
estado TEXT CHECK (
  'Nuevo',
  'Contactado',
  'Interesado',
  'Calificado',
  'Convertido',
  'No_Interesado',
  'Perdido'
)
```

**En Frontend:**
```typescript
LEAD_ESTADOS = ['Nuevo', 'En seguimiento', 'Convertido', 'Descartado']
```

**Diferencias Encontradas:**
| Base de Datos | Frontend | Estado |
|---------------|----------|--------|
| Contactado | - | ❌ FALTA en frontend |
| Interesado | - | ❌ FALTA en frontend |
| Calificado | - | ❌ FALTA en frontend |
| No_Interesado | - | ❌ FALTA en frontend |
| Perdido | - | ❌ FALTA en frontend |
| - | En seguimiento | ❌ NO EXISTE en BD |
| - | Descartado | ❌ NO EXISTE en BD |

**Impacto:** 🔴 **ALTO**
- Estados de leads no se pueden actualizar correctamente
- Filtros en dashboard pueden fallar
- Inconsistencia en flujos de n8n

**Solución:**
```typescript
// types/leads.ts - CORREGIR
export const LEAD_ESTADOS = [
  'Nuevo',
  'Contactado',      // ✅ AÑADIR
  'Interesado',      // ✅ AÑADIR
  'Calificado',      // ✅ AÑADIR
  'Convertido',
  'No_Interesado',   // ✅ AÑADIR
  'Perdido'          // ✅ AÑADIR
] as const;

// ELIMINAR estados que no existen en BD:
// - 'En seguimiento'
// - 'Descartado'
```

---

### 3. **Campo `tipo_cita` vs `tipo` - Ambigüedad**

**En Base de Datos:**
```sql
tipo_cita TEXT DEFAULT 'primera_vez'
```

**En Frontend:**
```typescript
tipo: string  // ❌ Nombre ambiguo
```

**En Agenda (types/agenda.ts):**
```typescript
tipo: string; // Compatible con tipo actual ← ❌ CONFUSO
```

**Problema:**
- No está claro si `tipo` se refiere a `tipo_cita`
- El mapeo es inconsistente
- Puede causar errores en creación de citas

**Solución:**
```typescript
// Renombrar en todos los tipos
interface Appointment {
  tipoCita: string;  // ✅ Claro que viene de tipo_cita
  // NO usar solo "tipo"
}
```

---

## 🟡 INCONSISTENCIAS MEDIAS

### 4. **Campos Calculados en Frontend que Deberían ser Views**

**Campos Calculados en Frontend:**
```typescript
// En types/consultas.ts
horasHastaConsulta: number | null;
diasHastaConsulta: number | null;
requiereConfirmacion: boolean;
confirmacionVencida: boolean;

// En types/leads.ts
diasDesdeContacto: number;
diasDesdeUltimaInteraccion: number | null;
esCaliente: boolean;
esInactivo: boolean;

// En types/pacientes.ts
diasDesdeUltimaConsulta: number | null;
esReciente: boolean;
requiereAtencion: boolean;
```

**Problema:**
- Se calculan en cada petición (ineficiente)
- Lógica duplicada en hooks y componentes
- Posibles inconsistencias en cálculos

**Solución:**
```sql
-- Crear vista materializada o función RPC
CREATE OR REPLACE FUNCTION get_consultas_enriched()
RETURNS TABLE (
  ...,
  horas_hasta_consulta INTEGER,
  dias_hasta_consulta INTEGER,
  requiere_confirmacion BOOLEAN,
  confirmacion_vencida BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    *,
    EXTRACT(EPOCH FROM (fecha_hora_utc - NOW()))/3600 AS horas_hasta_consulta,
    EXTRACT(DAYS FROM (fecha_consulta - CURRENT_DATE)) AS dias_hasta_consulta,
    (NOT confirmado_paciente AND fecha_hora_utc > NOW()) AS requiere_confirmacion,
    (fecha_limite_confirmacion < NOW() AND NOT confirmado_paciente) AS confirmacion_vencida
  FROM consultas;
END;
$$ LANGUAGE plpgsql;
```

---

### 5. **Campo `paciente_id` - UUID vs STRING**

**En Base de Datos:**
```sql
consultas.paciente_id  UUID FK → pacientes.id
leads.paciente_id      UUID FK → pacientes.id
pacientes.id           UUID PRIMARY KEY
pacientes.paciente_id  TEXT UNIQUE  (ID legible "PAC-123")
```

**En Frontend:**
```typescript
interface Consulta {
  pacienteId: string | null;  // ❌ Debería ser UUID o tener dos campos
}

interface Paciente {
  id: string;                 // ❌ ¿Es UUID o paciente_id?
  pacienteId: string;         // ❌ Confuso
}
```

**Problema:**
- No está claro cuál es el UUID y cuál es el ID legible
- Posibles errores al hacer FK queries
- Confusión al relacionar entidades

**Solución:**
```typescript
interface Consulta {
  uuid: string;                    // consultas.id (UUID PK)
  consultaId: string;              // consultas.consulta_id (legible)
  pacienteUuid: string;            // consultas.paciente_id (UUID FK)
  paciente: {                      // Datos joined
    uuid: string;                  // pacientes.id
    pacienteId: string;            // pacientes.paciente_id (PAC-123)
    nombre: string;
  }
}
```

---

### 6. **Modalidad y Prioridad - No Existen en BD**

**En Frontend (types/agenda.ts):**
```typescript
prioridad: AppointmentPriority;    // ❌ NO EXISTE en BD
modalidad: AppointmentModality;    // ❌ NO EXISTE en BD

export const APPOINTMENT_PRIORITIES = ['normal', 'alta', 'urgente'];
export const APPOINTMENT_MODALITIES = ['presencial', 'teleconsulta', 'hibrida'];
```

**En Base de Datos:**
```sql
consultas:
  - NO tiene campo "prioridad"
  - NO tiene campo "modalidad"
```

**Impacto:**
- Estos campos no se guardan en BD
- Se pierden al refrescar
- Filtros no funcionan

**Solución:**
```sql
-- Añadir columnas a la tabla consultas
ALTER TABLE consultas 
ADD COLUMN prioridad TEXT DEFAULT 'normal' 
  CHECK (prioridad IN ('normal', 'alta', 'urgente')),
ADD COLUMN modalidad TEXT DEFAULT 'presencial'
  CHECK (modalidad IN ('presencial', 'teleconsulta', 'hibrida'));
```

---

### 7. **Temperatura de Lead - No Existe en BD**

**En Frontend:**
```typescript
// En types de leads calculados
esCaliente: boolean;
esInactivo: boolean;
```

**En Base de Datos:**
```sql
leads.temperatura TEXT CHECK ('Frio', 'Tibio', 'Caliente')
```

**Problema:**
- Frontend no usa el campo `temperatura` de BD
- Calcula `esCaliente` manualmente
- Inconsistencia con la data real

**Solución:**
```typescript
interface Lead {
  temperatura: 'Frio' | 'Tibio' | 'Caliente';  // ✅ Usar campo real
  // Calcular esCaliente a partir de temperatura
  esCaliente: boolean;  // computed: temperatura === 'Caliente'
}
```

---

### 8. **Recordatorios - Mapeo Incorrecto**

**En Base de Datos:**
```sql
rem_confirmacion_inicial_enviado  BOOLEAN
rem_48h_enviado                  BOOLEAN
rem_24h_enviado                  BOOLEAN
rem_3h_enviado                   BOOLEAN
```

**En Frontend:**
```typescript
remConfirmacionInicialEnviado: boolean;  // ❌ Nombre camelCase
rem48hEnviado: boolean;
rem24hEnviado: boolean;
rem3hEnviado: boolean;
```

**Problema:**
- Mapeo inconsistente
- No se actualiza correctamente

---

## 🟢 INCONSISTENCIAS MENORES

### 9. **Timezone Hardcodeado**

**En Base de Datos:**
```sql
timezone TEXT DEFAULT 'America/Mexico_City'
```

**En Frontend:**
```typescript
// Hardcodeado en múltiples lugares
const timezone = 'America/Mexico_City';
```

**Recomendación:**
```typescript
// Leer de configuración o de la sede
const TIMEZONE = process.env.NEXT_PUBLIC_TIMEZONE || 'America/Mexico_City';
```

---

### 10. **Estado de Consulta - "No Asistió" vs "No_Asistio"**

**En Base de Datos:**
```sql
estado_cita CHECK ('Programada', 'Confirmada', 'Reagendada', 'Cancelada', 'No Asistió')
```

**En Frontend:**
```typescript
'No Asistió'  // ✅ Correcto con tilde
```

**Estado:** ✅ CORRECTO (solo validar que sea consistente)

---

### 11. **Campos JSONB - No Tipados**

**En Base de Datos:**
```sql
historial_cambios  JSONB DEFAULT '[]'
horario_json       JSONB
keywords           JSONB
metadata           JSONB
```

**En Frontend:**
```typescript
// No hay tipos definidos para estos JSONB
historial_cambios: Json  // ❌ Tipo genérico
```

**Recomendación:**
```typescript
interface HistorialCambio {
  fecha: string;
  campo: string;
  valorAnterior: any;
  valorNuevo: any;
  realizadoPor: string;
}

interface Consulta {
  historialCambios: HistorialCambio[];  // ✅ Tipado
}
```

---

### 12. **Función `to_mx10` No Usada en Frontend**

**En Base de Datos:**
```sql
CREATE FUNCTION to_mx10(t TEXT) RETURNS TEXT;
```

**En Frontend:**
```typescript
// Normalización manual de teléfonos
const normalizar = (tel: string) => tel.replace(/\D/g, '').slice(-10);
```

**Problema:**
- Lógica duplicada
- Posibles inconsistencias

**Solución:**
```typescript
// Usar la función RPC de Supabase
const { data } = await supabase.rpc('to_mx10', { t: telefono });
```

---

## 📊 Tabla Comparativa Completa

### Tabla: `consultas`

| Campo BD | Tipo BD | Campo Frontend | Tipo Frontend | Estado |
|----------|---------|----------------|---------------|--------|
| `id` | UUID | `uuid` | string | ✅ OK |
| `consulta_id` | TEXT | `id` | string | ⚠️ Confuso |
| `paciente_id` | UUID | `pacienteId` | string | ⚠️ Tipo |
| `fecha_hora_utc` | TIMESTAMPTZ | `fecha` | string | ✅ OK |
| `sede` | TEXT | `sede` | ConsultaSede | ✅ OK |
| `tipo_cita` | TEXT | `tipo` | string | ⚠️ Nombre |
| `estado_cita` | TEXT | `estado` | ConsultaEstado | 🔴 Mapeo |
| `estado_confirmacion` | TEXT | `estadoConfirmacion` | string | 🔴 Mapeo |
| `confirmado_paciente` | BOOLEAN | `confirmadoPaciente` | boolean | 🔴 Mapeo |
| `duracion_minutos` | INTEGER | `duracionMinutos` | number | 🔴 Mapeo |
| `motivo_consulta` | TEXT | `motivoConsulta` | string | 🔴 Mapeo |
| `prioridad` | - | `prioridad` | - | ❌ NO existe en BD |
| `modalidad` | - | `modalidad` | - | ❌ NO existe en BD |

---

### Tabla: `leads`

| Campo BD | Tipo BD | Campo Frontend | Tipo Frontend | Estado |
|----------|---------|----------------|---------------|--------|
| `id` | UUID | `id` | string | ✅ OK |
| `telefono_whatsapp` | TEXT | `telefono` | string | ✅ OK |
| `estado` | TEXT | `estado` | LeadEstado | 🔴 Valores diferentes |
| `temperatura` | TEXT | - | - | ❌ NO usado en frontend |
| `puntuacion_lead` | INTEGER | - | - | ❌ NO usado en frontend |

---

## 🔧 Plan de Corrección Prioritario

### Fase 1: CRÍTICAS (Esta semana)

#### **1.1 Corregir Mapeo Snake_case → CamelCase**
```bash
Archivos a modificar:
✅ hooks/useConsultas.ts
✅ hooks/useLeads.ts  
✅ hooks/usePacientes.ts
✅ app/agenda/services/appointments-service.ts
```

**Acción:**
```typescript
// Crear función helper de mapeo
export const mapConsultaFromDB = (raw: any): Consulta => ({
  id: raw.consulta_id,
  uuid: raw.id,
  pacienteId: raw.paciente_id,
  estadoCita: raw.estado_cita,
  confirmadoPaciente: raw.confirmado_paciente,
  // ... resto de campos
});
```

#### **1.2 Actualizar Estados de Leads**
```typescript
// types/leads.ts
export const LEAD_ESTADOS = [
  'Nuevo',
  'Contactado',
  'Interesado',
  'Calificado',
  'Convertido',
  'No_Interesado',
  'Perdido'
] as const;
```

#### **1.3 Añadir Campos Faltantes en BD**
```sql
-- Migration: agregar_prioridad_modalidad_consultas
ALTER TABLE consultas
ADD COLUMN prioridad TEXT DEFAULT 'normal'
  CHECK (prioridad IN ('normal', 'alta', 'urgente')),
ADD COLUMN modalidad TEXT DEFAULT 'presencial'
  CHECK (modalidad IN ('presencial', 'teleconsulta', 'hibrida'));
```

---

### Fase 2: MEDIAS (Próxima semana)

1. Crear funciones RPC para campos calculados
2. Tipado de campos JSONB
3. Usar `temperatura` de BD en vez de calcular
4. Consolidar normalización de teléfonos con `to_mx10()`

---

### Fase 3: MENORES (Cuando haya tiempo)

1. Unificar nomenclatura de IDs
2. Añadir validaciones de tipos
3. Documentar mappings

---

## ✅ Validaciones Recomendadas

### Runtime Validation con Zod:
```typescript
import { z } from 'zod';

const ConsultaSchema = z.object({
  id: z.string().uuid(),
  estadoCita: z.enum(['Programada', 'Confirmada', 'Reagendada', 'Cancelada', 'Completada', 'No Asistió']),
  confirmadoPaciente: z.boolean(),
  // ... resto de validaciones
});

// Validar al recibir de BD
const consulta = ConsultaSchema.parse(rawData);
```

---

## 📝 Checklist de Corrección

### Inmediato:
- [ ] Crear helpers de mapeo snake_case ↔ camelCase
- [ ] Actualizar LEAD_ESTADOS para coincidir con BD
- [ ] Migración para añadir prioridad y modalidad
- [ ] Actualizar todos los hooks con mapeo correcto

### Corto Plazo:
- [ ] Crear tipos TypeScript desde BD con generador
- [ ] Añadir runtime validation con Zod
- [ ] Mover cálculos a RPC functions
- [ ] Tipado de campos JSONB

### Mediano Plazo:
- [ ] Refactor de nomenclatura de IDs
- [ ] Consolidar timezone management
- [ ] Documentar todos los mappings
- [ ] Tests de integración BD ↔ Frontend

---

## 🎯 Conclusiones

**Estado Actual:** ⚠️ REQUIERE ATENCIÓN

**Principales Problemas:**
1. 🔴 Mapeo inconsistente snake_case vs camelCase
2. 🔴 Estados de leads no coinciden
3. 🔴 Campos frontend que no existen en BD

**Impacto en Producción:**
- Bugs silenciosos en confirmaciones
- Estados de leads incorrectos
- Pérdida de datos (prioridad/modalidad)

**Esfuerzo de Corrección:**
- 🔴 Críticas: ~8 horas
- 🟡 Medias: ~12 horas
- 🟢 Menores: ~6 horas
- **Total:** ~26 horas (3-4 días)

**Recomendación:**
✅ **Comenzar corrección inmediata de críticas**
✅ **Usar tipos generados de Supabase como fuente de verdad**
✅ **Implementar runtime validation**

---

**Análisis generado:** 17 de Noviembre 2025  
**Próxima revisión:** Después de corregir críticas
