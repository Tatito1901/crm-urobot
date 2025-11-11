# 📥 Patrones de Fetching de Datos

## 🔍 Leads

```typescript
// Todos los leads activos
const { data } = await supabase
  .from('leads')
  .select('*')
  .neq('estado', 'Convertido')
  .order('fecha_primer_contacto', { ascending: false })

// Leads con conversaciones
const { data } = await supabase
  .from('leads')
  .select('*, conversaciones(*)')
  .eq('estado', 'Interesado')

// Buscar por teléfono
const { data: tel } = await supabase.rpc('to_mx10', { t: telefono })
const { data } = await supabase
  .from('leads')
  .select('*')
  .eq('telefono_mx10', tel)
  .single()

// Paginación
const { data, count } = await supabase
  .from('leads')
  .select('*', { count: 'exact' })
  .range(0, 9) // Página 1 (10 items)
```

## 👥 Pacientes

```typescript
// Pacientes con última consulta
const { data } = await supabase
  .from('pacientes')
  .select('*, consultas(*)')
  .eq('estado', 'Activo')
  .order('ultima_consulta', { ascending: false })

// Paciente específico completo
const { data } = await supabase
  .from('pacientes')
  .select(`
    *,
    consultas(*),
    conversaciones(*),
    escalamientos(*)
  `)
  .eq('paciente_id', 'PAC-123')
  .single()
```

## 📅 Consultas

```typescript
// Consultas del día
const hoy = new Date().toISOString().split('T')[0]
const { data } = await supabase
  .from('consultas')
  .select('*, pacientes(*), sedes(*)')
  .eq('fecha_consulta', hoy)
  .order('hora_consulta', { ascending: true })

// Pendientes de confirmación
const { data } = await supabase
  .from('consultas')
  .select('*, pacientes(*), recordatorios(*)')
  .eq('confirmado_paciente', false)
  .in('estado_cita', ['Programada'])
  .gte('fecha_consulta', hoy)

// Por rango de fechas
const { data } = await supabase
  .from('consultas')
  .select('*')
  .gte('fecha_consulta', '2025-01-01')
  .lte('fecha_consulta', '2025-01-31')
  .eq('sede', 'HERMOSILLO')
```

## 🔔 Recordatorios

```typescript
// Pendientes de hoy
const { data } = await supabase
  .from('recordatorios')
  .select('*, consultas(*, pacientes(*))')
  .eq('estado', 'pendiente')
  .lte('programado_para', new Date().toISOString())

// Claim para procesar
const { data } = await supabase.rpc('claim_due_recordatorios', { p_limit: 50 })

// Historial por consulta
const { data } = await supabase
  .from('recordatorios')
  .select('*')
  .eq('consulta_id', consultaUuid)
  .order('programado_para')
```

## 💬 Conversaciones

```typescript
// Conversación de un lead
const { data } = await supabase
  .from('conversaciones')
  .select('*')
  .eq('lead_id', leadUuid)
  .order('timestamp_mensaje', { ascending: true })

// Últimos mensajes
const { data } = await supabase
  .from('conversaciones')
  .select('*, leads(*)')
  .order('timestamp_mensaje', { ascending: false })
  .limit(50)

// Con sentimiento negativo
const { data } = await supabase
  .from('conversaciones')
  .select('*, leads(*)')
  .eq('sentimiento', 'negativo')
```

## 🚨 Escalamientos

```typescript
// Pendientes prioritarios
const { data } = await supabase
  .from('escalamientos')
  .select('*, leads(*), pacientes(*), consultas(*)')
  .eq('estado', 'pendiente')
  .order('prioridad', { ascending: false })
  .order('created_at', { ascending: true })

// Alta prioridad
const { data } = await supabase
  .from('escalamientos')
  .select('*')
  .eq('prioridad', 'alta')
  .in('estado', ['pendiente', 'en_proceso'])
```

## 🏥 Sedes

```typescript
// Todas las sedes
const { data } = await supabase
  .from('sedes')
  .select('*')
  .order('sede')

// Sede específica
const { data } = await supabase
  .from('sedes')
  .select('*')
  .eq('sede', 'HERMOSILLO')
  .single()
```

## 📊 Realtime Subscriptions

```typescript
// Escuchar nuevos leads
const channel = supabase
  .channel('leads-changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'leads'
  }, (payload) => {
    console.log('Nuevo lead:', payload.new)
  })
  .subscribe()

// Escuchar cambios en consultas
supabase
  .channel('consultas-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'consultas'
  }, (payload) => {
    console.log('Consulta actualizada:', payload.new)
  })
  .subscribe()
```

## 🎯 Queries Avanzadas

### Count y Agregaciones
```typescript
// Total por estado
const { count } = await supabase
  .from('leads')
  .select('*', { count: 'exact', head: true })
  .eq('estado', 'Nuevo')

// Consultas por sede (en cliente)
const { data } = await supabase
  .from('consultas')
  .select('sede')
  
const porSede = data.reduce((acc, c) => {
  acc[c.sede] = (acc[c.sede] || 0) + 1
  return acc
}, {})
```

### Búsqueda de Texto
```typescript
// Buscar pacientes por nombre
const { data } = await supabase
  .from('pacientes')
  .select('*')
  .ilike('nombre_completo', '%juan%')

// Buscar en múltiples campos
const { data } = await supabase
  .from('leads')
  .select('*')
  .or(`nombre_completo.ilike.%${term}%,telefono_whatsapp.ilike.%${term}%`)
```

### Joins Complejos
```typescript
// Leads convertidos con su primera consulta
const { data } = await supabase
  .from('leads')
  .select(`
    *,
    pacientes!inner(
      *,
      consultas(*)
    )
  `)
  .eq('estado', 'Convertido')
  .order('fecha_conversion', { ascending: false })
```
