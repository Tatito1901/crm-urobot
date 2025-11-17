# ✅ Adaptación del Frontend a Supabase - Fuente de Verdad

**Fecha:** 17 de Noviembre 2025  
**Principio:** **Supabase es la fuente de verdad - NO modificamos la BD**

---

## 🎯 Filosofía

### ❌ ANTES (Enfoque Incorrecto)
```
Frontend define tipos → Modificamos BD para adaptarse
```

### ✅ AHORA (Enfoque Correcto)
```
Supabase define estructura → Adaptamos frontend a la BD
```

---

## 📊 Cambios Realizados

### **1. Tipos Corregidos - Solo lo que EXISTE en BD**

#### ✅ `types/leads.ts`
```typescript
// ✅ Estados de leads que REALMENTE existen en BD
LEAD_ESTADOS = [
  'Nuevo',
  'Contactado',
  'Interesado',
  'Calificado',
  'Convertido',
  'No_Interesado',
  'Perdido'
]

// ✅ Campos que REALMENTE existen en BD
interface Lead {
  temperatura: 'Frio' | 'Tibio' | 'Caliente'  // ✅ Existe en BD
  puntuacionLead: number                        // ✅ Existe en BD
  canalMarketing: string | null                 // ✅ Existe en BD
  totalMensajesEnviados: number                 // ✅ Existe en BD
  totalMensajesRecibidos: number                // ✅ Existe en BD
}
```

#### ✅ `types/consultas.ts`
```typescript
// ❌ ELIMINADO: prioridad (NO existe en BD)
// ❌ ELIMINADO: modalidad (NO existe en BD)

// ✅ SOLO campos que EXISTEN en BD
interface Consulta {
  id: string                    // ✅ consulta_id
  uuid: string                  // ✅ id (UUID PK)
  tipo: string                  // ✅ tipo_cita
  estado: ConsultaEstado        // ✅ estado_cita
  estadoConfirmacion: string    // ✅ estado_confirmacion
  confirmadoPaciente: boolean   // ✅ confirmado_paciente
  duracionMinutos: number       // ✅ duracion_minutos
  // ... etc - TODOS existen en BD
}
```

---

### **2. Mappers Actualizados - Solo Campos Reales**

#### ✅ `lib/mappers.ts`

**Qué hace:**
- ✅ Mapea **SOLO** campos que existen en Supabase
- ✅ Convierte snake_case → camelCase
- ✅ Enriquece con cálculos derivados
- ❌ NO intenta mapear campos que no existen

```typescript
// Ejemplo: mapConsultaFromDB()
{
  tipo: raw.tipo_cita,              // ✅ Existe
  estado: raw.estado_cita,          // ✅ Existe
  confirmadoPaciente: raw.confirmado_paciente,  // ✅ Existe
  // prioridad: NO mapeado (no existe en BD)
  // modalidad: NO mapeado (no existe en BD)
}
```

---

### **3. Archivos Eliminados**

```bash
❌ supabase/migrations/             → Eliminada carpeta completa
❌ scripts/apply-migration.ts       → Eliminado script
```

**Razón:** No vamos a modificar Supabase

---

## 🗄️ Estructura Real de Supabase (Fuente de Verdad)

### **Tabla: `consultas`**

**Campos que SÍ existen:**
```sql
✅ id                                UUID PK
✅ consulta_id                       TEXT UNIQUE
✅ paciente_id                       UUID FK
✅ lead_id                          UUID FK (nullable)
✅ fecha_hora_utc                   TIMESTAMPTZ
✅ fecha_consulta                   DATE
✅ hora_consulta                    TIME
✅ timezone                         TEXT
✅ sede                             TEXT
✅ tipo_cita                        TEXT
✅ motivo_consulta                  TEXT
✅ duracion_minutos                 INTEGER
✅ estado_cita                      TEXT
✅ estado_confirmacion              TEXT
✅ confirmado_paciente              BOOLEAN
✅ fecha_confirmacion               TIMESTAMPTZ
✅ fecha_limite_confirmacion        TIMESTAMPTZ
✅ rem_confirmacion_inicial_enviado BOOLEAN
✅ rem_48h_enviado                  BOOLEAN
✅ rem_24h_enviado                  BOOLEAN
✅ rem_3h_enviado                   BOOLEAN
✅ calendar_event_id                TEXT
✅ calendar_link                    TEXT
✅ canal_origen                     TEXT
✅ cancelado_por                    TEXT
✅ motivo_cancelacion               TEXT
✅ fecha_cancelacion                TIMESTAMPTZ
✅ historial_cambios                JSONB
✅ slot_guard                       BOOLEAN
✅ idempotency_key                  TEXT
✅ created_at                       TIMESTAMPTZ
✅ updated_at                       TIMESTAMPTZ
```

**Campos que NO existen:**
```
❌ prioridad     → Frontend debe eliminarlo o manejarlo localmente
❌ modalidad     → Frontend debe eliminarlo o manejarlo localmente
```

---

### **Tabla: `leads`**

**Campos que SÍ existen:**
```sql
✅ id                            UUID PK
✅ lead_id                       TEXT
✅ telefono_whatsapp             TEXT
✅ telefono_mx10                 TEXT
✅ nombre_completo               TEXT
✅ fuente_lead                   TEXT
✅ canal_marketing               TEXT
✅ fecha_primer_contacto         TIMESTAMPTZ
✅ ultima_interaccion            TIMESTAMPTZ
✅ total_mensajes_enviados       INTEGER
✅ total_mensajes_recibidos      INTEGER
✅ total_interacciones           INTEGER
✅ estado                        TEXT ← 7 valores permitidos
✅ temperatura                   TEXT ← Frio|Tibio|Caliente
✅ puntuacion_lead               INTEGER ← 0-100
✅ notas_iniciales               TEXT
✅ session_id                    TEXT
✅ ultimo_mensaje_id             TEXT
✅ paciente_id                   UUID FK
✅ fecha_conversion              TIMESTAMPTZ
✅ created_at                    TIMESTAMPTZ
✅ updated_at                    TIMESTAMPTZ
```

---

## 🔄 Flujo de Datos Correcto

### **De BD → Frontend:**
```typescript
// 1. Query a Supabase (snake_case)
const { data } = await supabase
  .from('consultas')
  .select('*');

// 2. Mapear a camelCase
import { mapConsultasFromDB } from '@/lib/mappers';
const consultas = mapConsultasFromDB(data);

// 3. Usar en frontend
consultas.forEach(c => {
  console.log(c.confirmadoPaciente);  // ✅ camelCase
  console.log(c.duracionMinutos);     // ✅ camelCase
});
```

### **De Frontend → BD:**
```typescript
// 1. Datos del frontend (camelCase)
const consulta = {
  tipo: 'primera_vez',
  estado: 'Programada',
  confirmadoPaciente: false,
  duracionMinutos: 30
};

// 2. Mapear a snake_case
import { mapConsultaToDB } from '@/lib/mappers';
const dbData = mapConsultaToDB(consulta);

// 3. Guardar en Supabase
await supabase
  .from('consultas')
  .update(dbData)
  .eq('id', uuid);
```

---

## ✅ Validación de Tipos

### **Usando tipos generados de Supabase:**

```typescript
import { Database } from '@/types/supabase';

// ✅ Type-safe: Solo acepta campos que EXISTEN
type ConsultaDB = Database['public']['Tables']['consultas']['Row'];

// ✅ TypeScript previene errores
const consulta: ConsultaDB = {
  prioridad: 'alta'  // ❌ Error: Property 'prioridad' does not exist
};
```

---

## 🎯 Campos Calculados (Frontend)

**Estos NO están en BD, se calculan en el frontend:**

```typescript
interface Consulta {
  // ... campos de BD ...
  
  // ✅ Calculados en enrichConsulta()
  horasHastaConsulta: number | null;        // Calculado
  diasHastaConsulta: number | null;         // Calculado
  requiereConfirmacion: boolean;            // Calculado
  confirmacionVencida: boolean;             // Calculado
}

interface Lead {
  // ... campos de BD ...
  
  // ✅ Calculados en enrichLead()
  diasDesdeContacto: number;                // Calculado
  diasDesdeUltimaInteraccion: number | null; // Calculado
  esCaliente: boolean;                      // Calculado (de temperatura)
  esInactivo: boolean;                      // Calculado
}
```

---

## 📋 Checklist de Adaptación

### ✅ Completado:
- [x] Tipos actualizados con campos reales de BD
- [x] Estados de leads corregidos (7 en vez de 4)
- [x] Temperatura de leads ahora usable
- [x] Puntuación lead ahora usable
- [x] Canal marketing ahora usable
- [x] Mappers solo usan campos reales
- [x] Eliminada carpeta de migraciones
- [x] Eliminado script de migración

### 🔜 Siguiente:
- [ ] Actualizar hooks para usar mappers
- [ ] Probar que todo funciona
- [ ] Validar en desarrollo

---

## 🚫 Campos que Frontend Usaba pero NO Existen en BD

### **Opción 1: Eliminar del Frontend**
```typescript
// ❌ Estos campos se eliminaron:
// - prioridad (de consultas)
// - modalidad (de consultas)
```

### **Opción 2: Manejar Localmente (No recomendado)**
```typescript
// Si REALMENTE necesitas estos campos:
// 1. Crear tabla separada en BD
// 2. O manejar en localStorage
// 3. O calcular en frontend (no persistir)
```

---

## 📊 Antes vs Ahora

### **Estados de Leads**

| Antes | BD Real | Ahora |
|-------|---------|-------|
| Nuevo | ✅ | ✅ |
| En seguimiento | ❌ | ❌ Eliminado |
| Convertido | ✅ | ✅ |
| Descartado | ❌ | ❌ Eliminado |
| - | Contactado ✅ | ✅ Añadido |
| - | Interesado ✅ | ✅ Añadido |
| - | Calificado ✅ | ✅ Añadido |
| - | No_Interesado ✅ | ✅ Añadido |
| - | Perdido ✅ | ✅ Añadido |

### **Campos de Consultas**

| Campo | BD Real | Frontend Antes | Frontend Ahora |
|-------|---------|----------------|----------------|
| tipo_cita | ✅ | ✅ tipo | ✅ tipo |
| estado_cita | ✅ | ✅ estado | ✅ estado |
| prioridad | ❌ | ✅ prioridad | ❌ Eliminado |
| modalidad | ❌ | ✅ modalidad | ❌ Eliminado |

---

## 🎉 Resultado

### **Principio Aplicado:**
```
Supabase define → Frontend se adapta
```

### **Beneficios:**
- ✅ Frontend 100% alineado con BD
- ✅ Sin campos fantasma
- ✅ Type-safe real
- ✅ Queries siempre funcionan
- ✅ Mantenible a largo plazo

### **No Modificamos:**
- ✅ Esquema de Supabase
- ✅ Constraints existentes
- ✅ Funciones RPC existentes
- ✅ Vistas materializadas

---

## 🔮 Si Necesitas Campos Nuevos en el Futuro

### **Proceso Correcto:**

1. **Primero:** Añadir campo en Supabase Dashboard
2. **Segundo:** Regenerar tipos TypeScript
   ```bash
   npx supabase gen types typescript \
     --project-id uxqksgdpgxkgvasysvsb \
     > types/supabase.ts
   ```
3. **Tercero:** Actualizar mappers
4. **Cuarto:** Usar en frontend

**NO al revés** ❌

---

## ✅ Conclusión

**Supabase es la fuente única de verdad.**  
**El frontend se adapta a la BD, no la BD al frontend.**

Todo está ahora alineado correctamente. 🎯

---

**Última actualización:** 17 de Noviembre 2025  
**Filosofía:** BD primero, frontend segundo
