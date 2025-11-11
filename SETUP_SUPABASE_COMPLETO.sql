-- ============================================
-- SETUP COMPLETO SUPABASE - CRM UROBOT
-- ============================================
-- Este script configura todo lo necesario para que tu CRM funcione:
-- 1. Deshabilita RLS (para desarrollo)
-- 2. Crea función RPC para métricas
-- 3. Crea vista materializada para dashboard
-- ============================================

-- ============================================
-- PASO 1: DESHABILITAR RLS (DESARROLLO SOLAMENTE)
-- ============================================
-- ⚠️ IMPORTANTE: Esto es SOLO para desarrollo.
-- Para producción necesitarás políticas RLS adecuadas.
-- ============================================

ALTER TABLE IF EXISTS public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.consultas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pacientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recordatorios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.escalamientos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sedes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conocimiento_procedimientos_urologia DISABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 2: CREAR FUNCIÓN RPC PARA MÉTRICAS DEL DASHBOARD
-- ============================================
-- Esta función calcula todas las métricas en UNA SOLA llamada
-- en lugar de hacer 11 queries separadas
-- ============================================

CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  today DATE := CURRENT_DATE;
  primer_dia_mes DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;
BEGIN
  SELECT json_build_object(
    'leads_totales', (SELECT COUNT(*) FROM leads),
    'leads_mes', (SELECT COUNT(*) FROM leads WHERE created_at >= primer_dia_mes),
    'leads_convertidos', (SELECT COUNT(*) FROM leads WHERE estado = 'Convertido'),
    'tasa_conversion_pct', (
      CASE 
        WHEN (SELECT COUNT(*) FROM leads) > 0 THEN
          ROUND((SELECT COUNT(*)::NUMERIC FROM leads WHERE estado = 'Convertido') * 100.0 / (SELECT COUNT(*) FROM leads), 2)
        ELSE 0
      END
    ),
    'pacientes_activos', (SELECT COUNT(*) FROM pacientes WHERE estado = 'Activo'),
    'total_pacientes', (SELECT COUNT(*) FROM pacientes),
    'consultas_futuras', (SELECT COUNT(*) FROM consultas WHERE fecha_consulta >= today),
    'consultas_hoy', (SELECT COUNT(*) FROM consultas WHERE fecha_consulta = today),
    'pendientes_confirmacion', (
      SELECT COUNT(*) FROM consultas 
      WHERE confirmado_paciente = false 
        AND fecha_consulta >= today
    ),
    'polanco_futuras', (
      SELECT COUNT(*) FROM consultas 
      WHERE sede = 'POLANCO' 
        AND fecha_consulta >= today
    ),
    'satelite_futuras', (
      SELECT COUNT(*) FROM consultas 
      WHERE sede = 'SATELITE' 
        AND fecha_consulta >= today
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Dar permisos públicos a la función
GRANT EXECUTE ON FUNCTION get_dashboard_metrics() TO anon;
GRANT EXECUTE ON FUNCTION get_dashboard_metrics() TO authenticated;

-- ============================================
-- PASO 3: CREAR VISTA MATERIALIZADA (OPCIONAL - MÁS RÁPIDO)
-- ============================================
-- Esta vista pre-calcula las métricas y se refresca periódicamente
-- Mucho más rápido que calcular en tiempo real
-- ============================================

DROP MATERIALIZED VIEW IF EXISTS dashboard_metricas CASCADE;

CREATE MATERIALIZED VIEW dashboard_metricas AS
SELECT
  -- Leads
  (SELECT COUNT(*) FROM leads) AS leads_totales,
  (SELECT COUNT(*) FROM leads WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS leads_mes,
  (SELECT COUNT(*) FROM leads WHERE estado = 'Convertido') AS leads_convertidos,
  CASE 
    WHEN (SELECT COUNT(*) FROM leads) > 0 THEN
      ROUND((SELECT COUNT(*)::NUMERIC FROM leads WHERE estado = 'Convertido') * 100.0 / (SELECT COUNT(*) FROM leads), 2)
    ELSE 0
  END AS tasa_conversion_pct,
  
  -- Pacientes
  (SELECT COUNT(*) FROM pacientes WHERE estado = 'Activo') AS pacientes_activos,
  (SELECT COUNT(*) FROM pacientes) AS total_pacientes,
  
  -- Consultas
  (SELECT COUNT(*) FROM consultas WHERE fecha_consulta >= CURRENT_DATE) AS consultas_futuras,
  (SELECT COUNT(*) FROM consultas WHERE fecha_consulta = CURRENT_DATE) AS consultas_hoy,
  (SELECT COUNT(*) FROM consultas WHERE confirmado_paciente = false AND fecha_consulta >= CURRENT_DATE) AS pendientes_confirmacion,
  (SELECT COUNT(*) FROM consultas WHERE sede = 'POLANCO' AND fecha_consulta >= CURRENT_DATE) AS polanco_futuras,
  (SELECT COUNT(*) FROM consultas WHERE sede = 'SATELITE' AND fecha_consulta >= CURRENT_DATE) AS satelite_futuras,
  
  -- Metadata
  CURRENT_TIMESTAMP AS calculated_at;

-- Crear índice único (requerido para CONCURRENTLY)
CREATE UNIQUE INDEX ON dashboard_metricas (calculated_at);

-- Dar permisos de lectura
GRANT SELECT ON dashboard_metricas TO anon;
GRANT SELECT ON dashboard_metricas TO authenticated;

-- ============================================
-- PASO 4: FUNCIÓN PARA REFRESCAR LA VISTA (AUTOMÁTICO)
-- ============================================
-- Esta función refresca la vista cada 5 minutos
-- ============================================

CREATE OR REPLACE FUNCTION refresh_dashboard_metricas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_metricas;
END;
$$;

-- ============================================
-- PASO 5: VERIFICAR QUE TODO FUNCIONA
-- ============================================

-- Verificar RLS deshabilitado
SELECT 
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('leads', 'consultas', 'pacientes', 'recordatorios')
ORDER BY tablename;
-- Debe mostrar rowsecurity = false

-- Probar función RPC
SELECT get_dashboard_metrics();
-- Debe retornar un JSON con todas las métricas

-- Probar vista
SELECT * FROM dashboard_metricas;
-- Debe retornar una fila con todas las métricas

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. La vista se refresca manualmente con:
--    SELECT refresh_dashboard_metricas();
--
-- 2. Para refrescar automáticamente, puedes usar pg_cron:
--    SELECT cron.schedule('refresh-dashboard', '*/5 * * * *', $$SELECT refresh_dashboard_metricas()$$);
--
-- 3. Para PRODUCCIÓN, deberás crear políticas RLS apropiadas
--    y habilitar RLS nuevamente
--
-- ============================================
