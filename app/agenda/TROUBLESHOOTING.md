# 🔧 Guía de Troubleshooting - Agenda de Urobot

## ❌ Problema: No se ven las citas en la interfaz

### 📊 Diagnóstico Paso a Paso

#### **Paso 1: Verificar que el servidor esté corriendo**

```bash
npm run dev
```

Debería mostrar:
```
✓ Ready in X.Xs
Local: http://localhost:3000
```

---

#### **Paso 2: Abrir la Consola del Navegador**

1. Abre http://localhost:3000/agenda en tu navegador
2. Presiona `F12` o `Ctrl+Shift+I` para abrir DevTools
3. Ve a la pestaña **Console**

---

#### **Paso 3: Revisar los logs de diagnóstico**

Deberías ver logs como estos en la consola:

```
[useConsultas] Consultas obtenidas: 25 Total count: 25
[useConsultas] Primera consulta: { id: '...', paciente: '...', ... }
[Agenda Page] Consultas cargadas: 25
[Agenda Page] Loading: false
[Agenda] Filtrado: { total: 25, filtradas: 25, filtros: {...} }
[Agenda] Total consultas filtradas: 25
[Agenda] Actualizando calendario con 25 eventos
```

---

### 🔍 Interpretación de Logs

#### ✅ **Escenario 1: Datos se cargan correctamente**

```
[useConsultas] Consultas obtenidas: 25
[Agenda] Filtrado: { filtradas: 25 }
[Agenda] Actualizando calendario con 25 eventos
```

**Diagnóstico**: Los datos llegan correctamente. Si aún no ves las citas:
- Cambia a **Vista Lista** (botón en el header)
- Verifica que la fecha del calendario esté en un rango con citas
- Revisa que Schedule-X no tenga errores (busca errores en consola)

---

#### ⚠️ **Escenario 2: Datos llegan pero se filtran todos**

```
[useConsultas] Consultas obtenidas: 25
[Agenda] Filtrado: { total: 25, filtradas: 0, filtros: {...} }
```

**Diagnóstico**: Los filtros están ocultando todas las citas.

**Solución**:
1. Verifica los filtros activos en el log
2. Click en botón "Filtros" → "Limpiar todo"
3. Asegúrate de que:
   - `selectedSede: 'ALL'` ✓
   - `estados: []` (vacío) ✓
   - `onlyToday: false` ✓
   - `onlyPendingConfirmation: false` ✓

---

#### ❌ **Escenario 3: No se obtienen datos de Supabase**

```
[useConsultas] Consultas obtenidas: 0
```

**Diagnóstico**: La base de datos está vacía o hay un error de conexión.

**Verificar**:

1. **Credenciales de Supabase**
   ```bash
   # Verifica que existan las variables de entorno
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

   Si están vacías, crea `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```

   **Reinicia el servidor** después de crear/modificar `.env.local`

2. **Datos en Supabase**
   - Abre tu proyecto en https://supabase.com
   - Ve a **Table Editor** → Tabla `consultas`
   - Verifica que haya registros

3. **Permisos de la tabla**
   - Ve a **Authentication** → **Policies**
   - Asegúrate de que la tabla `consultas` tenga políticas de lectura
   - O temporalmente habilita **Row Level Security OFF** para testing

---

#### 🚫 **Escenario 4: Error en consola**

```
Error fetching consultas: [Error details]
```

**Diagnóstico**: Hay un error en la conexión o query.

**Verificar**:
- Revisa el mensaje de error específico
- Verifica que la tabla `consultas` exista
- Verifica que la tabla `pacientes` exista (se hace JOIN)
- Revisa los tipos de datos de las columnas

---

### 🛠️ Herramientas de Diagnóstico

#### **1. Script de Verificación Manual**

Ejecuta en la consola del navegador (DevTools):

```javascript
// Obtener cliente de Supabase
const { createClient } = await import('@/lib/supabase/client');
const supabase = createClient();

// Intentar obtener consultas
const { data, error, count } = await supabase
  .from('consultas')
  .select('*, paciente:pacientes ( id, nombre_completo )', { count: 'exact' })
  .limit(5);

console.log('Total:', count);
console.log('Datos:', data);
console.log('Error:', error);
```

#### **2. Verificar estructura de datos**

```javascript
// En la consola del navegador después de cargar /agenda
// Accede al estado de React (solo para debug)
console.log('Consultas en memoria:', window.__debug_consultas);
```

---

### 📋 Checklist de Verificación

- [ ] Servidor de desarrollo corriendo (`npm run dev`)
- [ ] Variables de entorno configuradas (`.env.local`)
- [ ] Tabla `consultas` existe en Supabase
- [ ] Tabla `pacientes` existe en Supabase
- [ ] Hay datos en la tabla `consultas`
- [ ] RLS (Row Level Security) permite lectura
- [ ] No hay errores en consola del navegador
- [ ] Logs muestran: `[useConsultas] Consultas obtenidas: X` (X > 0)
- [ ] Filtros no están ocultando todas las citas
- [ ] Vista de calendario está en rango con citas

---

### 🎯 Soluciones Rápidas

#### **Problema: Variables de entorno no se cargan**

```bash
# 1. Verifica que el archivo exista
ls -la .env.local

# 2. Verifica el contenido
cat .env.local

# 3. REINICIA el servidor (importante!)
# Mata el proceso actual (Ctrl+C)
npm run dev
```

#### **Problema: Tabla vacía en Supabase**

Inserta datos de prueba en Supabase SQL Editor:

```sql
-- Insertar paciente de prueba
INSERT INTO pacientes (nombre_completo)
VALUES ('Juan Pérez García')
RETURNING id;

-- Usar el ID devuelto en la siguiente query
INSERT INTO consultas (
  paciente_id,
  sede,
  estado_cita,
  fecha_consulta,
  hora_consulta,
  duracion_minutos,
  tipo_cita
) VALUES (
  'UUID-DEL-PACIENTE-ANTERIOR',
  'POLANCO',
  'Programada',
  CURRENT_DATE,
  '10:00:00',
  45,
  'primera_vez'
);
```

#### **Problema: Permisos de Supabase**

```sql
-- Habilitar lectura pública (solo para testing)
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON consultas
FOR SELECT USING (true);

-- Similar para tabla pacientes
CREATE POLICY "Enable read access for all users" ON pacientes
FOR SELECT USING (true);
```

---

### 📞 Siguientes Pasos si Aún No Funciona

1. **Exporta los logs completos**:
   ```javascript
   // En consola del navegador
   copy(console.logs);
   // Pega en un archivo y comparte
   ```

2. **Captura de pantalla**:
   - DevTools → Console (con todos los logs visibles)
   - Interfaz de la agenda (mostrando el problema)

3. **Información adicional**:
   - Versión de Node: `node --version`
   - Versión de Next: En `package.json`
   - Browser: Chrome/Firefox/Safari + versión

---

### ✅ Estado Esperado (Todo Funciona)

```
Console logs:
[useConsultas] Consultas obtenidas: 25 Total count: 25
[useConsultas] Primera consulta: {
  id: "ABC123",
  paciente: "Juan Pérez",
  sede: "POLANCO",
  fechaConsulta: "2025-01-15",
  horaConsulta: "10:00:00",
  ...
}
[Agenda Page] Consultas cargadas: 25
[Agenda Page] Loading: false
[Agenda] Filtrado: {
  total: 25,
  filtradas: 25,
  filtros: {
    searchQuery: "",
    selectedSede: "ALL",
    estados: 0,
    onlyToday: false,
    onlyPendingConfirmation: false
  }
}
[Agenda] Total consultas filtradas: 25
[Agenda] Actualizando calendario con 25 eventos

✓ En pantalla: Ver 25 citas en el calendario o lista
✓ Estadísticas muestran números correctos
✓ Próximas citas en sidebar
```

---

### 🚀 Optimización Post-Fix

Una vez que funcione, puedes:

1. **Remover logs de debug**:
   - Comentar `console.log` en `app/agenda/page.tsx`
   - Comentar `console.log` en `hooks/useConsultas.ts`

2. **Verificar performance**:
   - React DevTools → Profiler
   - Verificar que no haya re-renders innecesarios

3. **Testing final**:
   - Probar en mobile
   - Probar búsqueda
   - Probar filtros
   - Probar modal de detalles

---

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Schedule-X Docs](https://schedule-x.dev)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
