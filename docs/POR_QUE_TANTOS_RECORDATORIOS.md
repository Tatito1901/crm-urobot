# 🔍 Por Qué un Paciente Tiene Tantos Recordatorios

## 📊 Causas Comunes

### 1. **Múltiples Consultas Programadas** ⭐
Cada consulta genera automáticamente **4 recordatorios**:
```
Consulta 1 → 4 recordatorios (inicial, 48h, 24h, 3h)
Consulta 2 → 4 recordatorios (inicial, 48h, 24h, 3h)
Consulta 3 → 4 recordatorios (inicial, 48h, 24h, 3h)
─────────────────────────────────────────────────
Total: 12 recordatorios para 3 consultas
```

### 2. **Reagendamientos**
Cuando se reagenda una cita:
- Se crea una **nueva consulta** con nuevo ID
- Se generan **4 nuevos recordatorios**
- Los recordatorios de la consulta anterior **NO se borran automáticamente**

**Ejemplo:**
```
Consulta Original (ABC123):
- Confirmación inicial → enviado ✅
- 48h → enviado ✅
- 24h → enviado ✅
- Paciente llama para reagendar ❌

Nueva Consulta (XYZ456):
- Confirmación inicial → pendiente 🆕
- 48h → pendiente 🆕
- 24h → pendiente 🆕
- 3h → pendiente 🆕

RESULTADO: 8 recordatorios del mismo paciente
```

### 3. **Consultas Recurrentes**
Pacientes con seguimiento continuo:
```
Paciente: "Pepe Mario"
- Enero: Consulta 1 → 4 recordatorios
- Marzo: Consulta 2 → 4 recordatorios
- Mayo: Consulta 3 → 4 recordatorios
- Julio: Consulta 4 → 4 recordatorios
─────────────────────────────────────────
Total histórico: 16 recordatorios
```

### 4. **Recordatorios No Enviados (Estado: pendiente)**
Si hay problemas técnicos:
- WhatsApp no disponible
- Teléfono incorrecto
- Error en n8n

Los recordatorios se quedan en estado `pendiente` y se acumulan.

### 5. **Sin Límite de Tiempo en la Query**
Si tu hook trae **todos** los recordatorios sin filtrar por fecha:
```sql
-- SIN FILTRO (trae todo el historial)
SELECT * FROM recordatorios;

-- CON FILTRO (solo últimos 60 días) ✅
SELECT * FROM recordatorios 
WHERE programado_para >= NOW() - INTERVAL '60 days';
```

---

## ✅ Soluciones Implementadas

### 1. **Filtro "Solo Último por Consulta"** ⭐
Ya implementado en `/app/confirmaciones/page.tsx`:

```typescript
// Checkbox activado por default
const [soloUltimo, setSoloUltimo] = useState(true);

// Si está activado, solo muestra 1 recordatorio por consulta
if (soloUltimo) {
  const consultaMap = new Map();
  result.forEach((r) => {
    const consultaId = r.consulta?.consulta_id;
    if (consultaId) {
      const existing = consultaMap.get(consultaId);
      if (!existing || new Date(r.programado_para) > new Date(existing.programado_para)) {
        consultaMap.set(consultaId, r);
      }
    }
  });
  result = Array.from(consultaMap.values());
}
```

**Resultado:**
- **Antes:** 12 recordatorios de 3 consultas
- **Ahora:** 3 recordatorios (el más reciente de cada consulta)

### 2. **Límite de 60 Días**
Ya implementado en `/hooks/useRecordatorios.ts`:

```typescript
// Solo trae últimos 60 días
const hace60Dias = new Date();
hace60Dias.setDate(hace60Dias.getDate() - 60);

const { data, error } = await supabase
  .from('recordatorios')
  .select('...')
  .gte('programado_para', hace60Dias.toISOString())
  .limit(200);
```

### 3. **Filtros Adicionales en UI**
Ya disponibles:
- **Rango:** Últimos 7 días / 30 días / Todos
- **Tipo:** 48h / 24h / 3h / confirmación inicial
- **Estado:** (pendientes, enviados, errores en KPIs)

---

## 🔍 Cómo Investigar "Pepe Mario"

### Opción 1: En el Frontend (Confirmaciones)
```
1. Ve a http://localhost:3000/confirmaciones
2. En el campo "Buscar", escribe: "pepe mario"
3. Desactiva checkbox "Solo último" para ver todos
4. Observa:
   - ¿Cuántas consultas diferentes tiene?
   - ¿Están todas las consultas activas o hay canceladas?
   - ¿Cuál es el estado de cada recordatorio?
```

### Opción 2: En Supabase (SQL)
```sql
-- Ver recordatorios de Pepe Mario
SELECT 
  r.id,
  r.tipo,
  r.estado,
  r.programado_para,
  r.enviado_en,
  c.consulta_id,
  c.estado_cita,
  c.fecha_consulta,
  c.cancelado_por
FROM recordatorios r
JOIN consultas c ON c.id = r.consulta_id
JOIN pacientes p ON p.id = c.paciente_id
WHERE p.nombre_completo ILIKE '%pepe%mario%'
ORDER BY r.programado_para DESC;
```

### Opción 3: Ver Consultas del Paciente
```sql
-- Ver todas las consultas de Pepe Mario
SELECT 
  c.consulta_id,
  c.fecha_consulta,
  c.estado_cita,
  c.cancelado_por,
  c.motivo_cancelacion,
  COUNT(r.id) as total_recordatorios
FROM consultas c
JOIN pacientes p ON p.id = c.paciente_id
LEFT JOIN recordatorios r ON r.consulta_id = c.id
WHERE p.nombre_completo ILIKE '%pepe%mario%'
GROUP BY c.id, c.consulta_id, c.fecha_consulta, c.estado_cita, c.cancelado_por, c.motivo_cancelacion
ORDER BY c.fecha_consulta DESC;
```

---

## 🧹 Limpieza Recomendada (Si es necesario)

### 1. **Eliminar Recordatorios de Consultas Canceladas**
```sql
-- Ver cuántos hay
SELECT COUNT(*) 
FROM recordatorios r
JOIN consultas c ON c.id = r.consulta_id
WHERE c.estado_cita = 'Cancelada';

-- Eliminar (solo si confirmas que debe hacerse)
DELETE FROM recordatorios 
WHERE consulta_id IN (
  SELECT id FROM consultas 
  WHERE estado_cita = 'Cancelada'
);
```

### 2. **Marcar como Cancelados (Sin Eliminar)**
Mejor enfoque - mantener histórico:
```sql
-- Agregar estado 'cancelado' si no existe
-- Luego actualizar
UPDATE recordatorios 
SET estado = 'cancelado'
WHERE consulta_id IN (
  SELECT id FROM consultas 
  WHERE estado_cita = 'Cancelada'
)
AND estado = 'pendiente';
```

### 3. **Filtrar en Frontend (Ya Implementado)**
No necesitas limpiar la BD, solo filtrar en UI:
```typescript
// Ya filtras por estado válido en el código
const VALID_STATES = ['Programada', 'Confirmada', 'Reagendada'];

// Puedes agregar filtro adicional
result = result.filter(r => 
  r.consulta?.estado_cita && 
  VALID_STATES.includes(r.consulta.estado_cita)
);
```

---

## 📊 Análisis Típico: Caso Real

### Escenario: "Pepe Mario" tiene 20 recordatorios

**Investigación:**
```sql
SELECT 
  c.consulta_id,
  c.fecha_consulta,
  c.estado_cita,
  COUNT(r.id) as recordatorios
FROM consultas c
JOIN pacientes p ON p.id = c.paciente_id
LEFT JOIN recordatorios r ON r.consulta_id = c.id
WHERE p.nombre_completo ILIKE '%pepe%mario%'
GROUP BY c.id
ORDER BY c.fecha_consulta;
```

**Resultado posible:**
```
Consulta_ID | Fecha      | Estado    | Recordatorios
------------|------------|-----------|---------------
ABC001      | 2024-09-15 | Completada| 4
ABC002      | 2024-10-20 | Cancelada | 4
ABC003      | 2024-10-25 | Cancelada | 2
ABC004      | 2024-11-05 | Programada| 4
ABC005      | 2024-11-20 | Programada| 4
ABC006      | 2025-01-10 | Programada| 2
                                Total: 20
```

**Explicación:**
- Paciente recurrente (6 consultas en 4 meses)
- 2 consultas canceladas (reagendamientos)
- 3 consultas futuras programadas
- Total: 20 recordatorios es **normal** para este historial

**Solución:**
- ✅ Activar filtro "Solo último por consulta" → reduce a 6
- ✅ Filtro "Últimos 30 días" → reduce a ~8-10
- ✅ Ambos filtros combinados → muestra 2-3 recordatorios

---

## 🎯 Recomendaciones

### Para el Día a Día
```
✅ Mantener filtros por default:
- Rango: "Últimos 30 días"
- Solo último: ACTIVADO
- Resultado: Vista limpia y útil
```

### Para Auditoría
```
✅ Desactivar todos los filtros:
- Rango: "Todos"
- Solo último: DESACTIVADO
- Resultado: Historial completo
```

### Para Limpieza de BD (Opcional)
```sql
-- Solo si realmente necesitas limpiar
-- Consultar primero con el equipo

-- 1. Marcar recordatorios viejos como archivados
UPDATE recordatorios 
SET estado = 'archivado'
WHERE programado_para < NOW() - INTERVAL '90 days'
AND estado IN ('enviado', 'error');

-- 2. Cancelar recordatorios de citas canceladas
UPDATE recordatorios 
SET estado = 'cancelado'
WHERE consulta_id IN (
  SELECT id FROM consultas WHERE estado_cita = 'Cancelada'
)
AND estado = 'pendiente';
```

---

## 📝 Resumen

### ¿Por qué tantos recordatorios?
1. **Múltiples consultas** (normal para pacientes recurrentes)
2. **Reagendamientos** (cada uno crea nuevos recordatorios)
3. **Historial acumulado** (sin límite de tiempo)

### ¿Es un problema?
**No necesariamente.** Depende del caso:
- Paciente recurrente: Normal tener 10-20 recordatorios
- Paciente con muchos reagendamientos: Normal tener duplicados
- Vista histórica: Útil para auditoría

### ¿Cómo solucionarlo en UI?
**Ya está solucionado** con los filtros implementados:
- ✅ "Solo último por consulta"
- ✅ "Últimos 30 días"
- ✅ Búsqueda por paciente

---

**Fecha:** 2025-11-01  
**Versión:** 1.0  
**Estado:** ✅ Filtros implementados
