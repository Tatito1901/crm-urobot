# 🚀 INSTRUCCIONES DE SETUP - CRM UROBOT

## ❌ Problema Actual

Tu aplicación está mostrando estos errores:
```
403 Forbidden - No tienes permisos para acceder a las tablas
404 Not Found - La función RPC y la vista no existen
```

## ✅ Solución en 3 Pasos

### PASO 1: Abrir Supabase SQL Editor

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto **uxqksgdpgxkgvasysvsb**
3. En el menú lateral, haz clic en **SQL Editor**

### PASO 2: Ejecutar el Script SQL

1. Haz clic en **New Query** (botón verde)
2. Abre el archivo `SETUP_SUPABASE_COMPLETO.sql` en tu editor
3. **Copia TODO el contenido** del archivo
4. **Pégalo** en el SQL Editor de Supabase
5. Haz clic en **Run** (o presiona Ctrl+Enter / Cmd+Enter)

### PASO 3: Verificar que Funcionó

Deberías ver 3 secciones de resultados:

#### 1. Verificación de RLS
```
tablename    | rowsecurity
-------------|------------
consultas    | false
leads        | false
pacientes    | false
recordatorios| false
```
✅ Si `rowsecurity = false`, está correcto

#### 2. Función RPC
```json
{
  "leads_totales": 123,
  "leads_mes": 45,
  "leads_convertidos": 67,
  "tasa_conversion_pct": 54.47,
  ...
}
```
✅ Si ves un JSON con números, está correcto

#### 3. Vista Materializada
```
leads_totales | leads_mes | consultas_hoy | ...
--------------|-----------|---------------|----
123           | 45        | 8             | ...
```
✅ Si ves una fila con números, está correcto

---

## 🔄 Después de Ejecutar el SQL

1. **Recarga tu aplicación** (F5 o Cmd+R)
2. Los errores 403 y 404 deberían desaparecer
3. Los datos deberían cargarse correctamente

---

## 🎯 ¿Qué Hace Este Script?

### 1. Deshabilita RLS (Row Level Security)
- Permite que tu frontend acceda a las tablas sin autenticación
- ⚠️ **SOLO para desarrollo** - En producción necesitarás políticas RLS

### 2. Crea la Función RPC `get_dashboard_metrics()`
- Calcula todas las métricas del dashboard en UNA SOLA query
- Reduce de 11 queries a 1 query
- Mucho más rápido y eficiente

### 3. Crea la Vista `dashboard_metricas`
- Pre-calcula las métricas y las guarda
- Aún más rápido que la función RPC
- Se puede refrescar manualmente cuando sea necesario

---

## 🔍 Troubleshooting

### Si sigues viendo 403 después de ejecutar el script:

1. Verifica que el script se ejecutó SIN errores
2. Asegúrate de estar usando el proyecto correcto en Supabase
3. Verifica que la URL en tu `.env.local` coincide con tu proyecto

### Si ves otros errores:

1. Revisa la consola del navegador (F12)
2. Busca mensajes de error específicos
3. Verifica que las variables de entorno estén configuradas:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://uxqksgdpgxkgvasysvsb.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=tu-anon-key
   ```

---

## 📝 Próximos Pasos (Después de que Funcione)

1. **Monitorear uso de API** en el dashboard de Supabase
2. **Implementar autenticación** cuando estés listo para producción
3. **Crear políticas RLS** para seguridad en producción
4. **Refrescar la vista** periódicamente para mantener datos actualizados

---

## 🆘 Si Necesitas Ayuda

1. Revisa los errores en la consola del navegador
2. Verifica que ejecutaste TODO el script SQL
3. Asegúrate de estar en el proyecto correcto de Supabase
4. Verifica tus variables de entorno

---

**¡Listo!** Una vez ejecutes el script, tu CRM debería funcionar perfectamente. 🎉
