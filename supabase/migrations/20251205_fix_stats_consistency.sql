-- ============================================================
-- 1. MEJORA DE get_dashboard_stats (Dashboard KPI)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSON;
  first_day_of_month TIMESTAMPTZ;
  hace_12_meses TIMESTAMPTZ;
  hace_6_meses TIMESTAMPTZ;
BEGIN
  first_day_of_month := date_trunc('month', NOW());
  hace_12_meses := first_day_of_month - INTERVAL '12 months';
  hace_6_meses := first_day_of_month - INTERVAL '6 months';

  SELECT json_build_object(
    'kpi', json_build_object(
      'totalPacientes', (SELECT COUNT(*) FROM pacientes),
      'pacientesNuevosMes', (SELECT COUNT(*) FROM pacientes WHERE created_at >= first_day_of_month),
      'consultasMes', (SELECT COUNT(*) FROM consultas WHERE fecha_hora_inicio >= first_day_of_month),
      -- CORREGIDO: Usar estado_confirmacion O confirmado_paciente
      'consultasConfirmadasMes', (
        SELECT COUNT(*) FROM consultas 
        WHERE fecha_hora_inicio >= first_day_of_month 
        AND (estado_confirmacion = 'Confirmada' OR confirmado_paciente = true)
      ),
      -- CORREGIDO: Tasa de asistencia basada en citas pasadas completadas vs total pasadas
      'tasaAsistencia', COALESCE(
        (SELECT ROUND(
          (COUNT(*) FILTER (WHERE estado_cita = 'Completada')::NUMERIC / 
           NULLIF(COUNT(*) FILTER (WHERE fecha_hora_fin < NOW() AND estado_cita NOT IN ('Cancelada')), 0)) * 100
        ) FROM consultas WHERE fecha_hora_inicio >= hace_12_meses), 0
      ),
      -- CORREGIDO: Tasa conversión solo considera 'Convertido'
      'tasaConversion', COALESCE(
        (SELECT ROUND(
          (COUNT(*) FILTER (WHERE estado = 'Convertido')::NUMERIC / 
           NULLIF(COUNT(*), 0)) * 100
        ) FROM leads), 0
      ),
      'totalLeads', (SELECT COUNT(*) FROM leads),
      'leadsNuevosMes', (SELECT COUNT(*) FROM leads WHERE created_at >= first_day_of_month)
    ),
    'consultasPorSede', (
      SELECT COALESCE(json_agg(json_build_object(
        'name', CASE sede WHEN 'POLANCO' THEN 'Polanco' WHEN 'SATELITE' THEN 'Satélite' ELSE sede END,
        'value', count,
        'fill', CASE sede WHEN 'POLANCO' THEN '#c084fc' WHEN 'SATELITE' THEN '#22d3ee' ELSE '#94a3b8' END
      )), '[]'::json)
      FROM (
        SELECT COALESCE(sede, 'SIN SEDE') as sede, COUNT(*) as count 
        FROM consultas 
        WHERE fecha_hora_inicio >= hace_12_meses
        GROUP BY sede
      ) s
    ),
    'estadoCitas', (
      SELECT COALESCE(json_agg(json_build_object(
        'name', estado_cita,
        'value', count,
        'fill', CASE estado_cita 
          WHEN 'Programada' THEN '#60a5fa'
          WHEN 'Confirmada' THEN '#4ade80'
          WHEN 'Cancelada' THEN '#f87171'
          WHEN 'No Asistió' THEN '#fbbf24'
          WHEN 'Completada' THEN '#22c55e'
          ELSE '#94a3b8'
        END
      )), '[]'::json)
      FROM (
        SELECT estado_cita, COUNT(*) as count 
        FROM consultas 
        WHERE fecha_hora_inicio >= hace_12_meses AND estado_cita IS NOT NULL
        GROUP BY estado_cita
        ORDER BY count DESC
      ) e
    ),
    'funnelLeads', (
      SELECT COALESCE(json_agg(json_build_object(
        'name', estado,
        'value', count,
        'fill', CASE estado 
          WHEN 'Nuevo' THEN '#3b82f6'      -- Blue 500
          WHEN 'Contactado' THEN '#f59e0b' -- Amber 500
          WHEN 'Interesado' THEN '#a855f7' -- Purple 500
          WHEN 'Calificado' THEN '#ec4899' -- Pink 500
          WHEN 'Convertido' THEN '#10b981' -- Emerald 500
          WHEN 'No_Interesado' THEN '#64748b' -- Slate 500
          WHEN 'Perdido' THEN '#ef4444'    -- Red 500
          ELSE '#94a3b8'
        END
      ) ORDER BY CASE estado
        WHEN 'Nuevo' THEN 1
        WHEN 'Contactado' THEN 2
        WHEN 'Interesado' THEN 3
        WHEN 'Calificado' THEN 4
        WHEN 'Convertido' THEN 5
        WHEN 'No_Interesado' THEN 6
        WHEN 'Perdido' THEN 7
        ELSE 8
      END), '[]'::json)
      FROM (
        SELECT estado, COUNT(*) as count 
        FROM leads 
        WHERE estado IS NOT NULL
        GROUP BY estado
      ) f
    ),
    'fuentesCaptacion', (
      SELECT COALESCE(json_agg(json_build_object(
        'name', fuente,
        'value', count,
        'fill', CASE (ROW_NUMBER() OVER (ORDER BY count DESC))::INT % 5
          WHEN 0 THEN '#f472b6'
          WHEN 1 THEN '#38bdf8'
          WHEN 2 THEN '#fbbf24'
          WHEN 3 THEN '#4ade80'
          ELSE '#94a3b8'
        END
      ) ORDER BY count DESC), '[]'::json)
      FROM (
        SELECT COALESCE(NULLIF(fuente_lead, ''), 'Desconocido') as fuente, 
               COUNT(*) as count 
        FROM leads 
        GROUP BY fuente
        ORDER BY count DESC
        LIMIT 10
      ) fc
    ),
    'evolucionMensual', (
      SELECT COALESCE(json_agg(json_build_object(
        'name', mes_label,
        'consultas', consultas_count,
        'pacientes', pacientes_count,
        'leads', leads_count
      ) ORDER BY mes), '[]'::json)
      FROM (
        SELECT 
          m.mes,
          TO_CHAR(m.mes, 'Mon') as mes_label,
          COALESCE(c.count, 0) as consultas_count,
          COALESCE(p.count, 0) as pacientes_count,
          COALESCE(l.count, 0) as leads_count
        FROM (
          SELECT generate_series(
            date_trunc('month', hace_6_meses),
            date_trunc('month', NOW()),
            '1 month'::interval
          ) as mes
        ) m
        LEFT JOIN (
          SELECT date_trunc('month', fecha_hora_inicio) as mes, COUNT(*) as count
          FROM consultas
          WHERE fecha_hora_inicio >= hace_6_meses
          GROUP BY 1
        ) c ON c.mes = m.mes
        LEFT JOIN (
          SELECT date_trunc('month', created_at) as mes, COUNT(*) as count
          FROM pacientes
          WHERE created_at >= hace_6_meses
          GROUP BY 1
        ) p ON p.mes = m.mes
        LEFT JOIN (
          SELECT date_trunc('month', created_at) as mes, COUNT(*) as count
          FROM leads
          WHERE created_at >= hace_6_meses
          GROUP BY 1
        ) l ON l.mes = m.mes
      ) ev
    ),
    'metricasMensajeria', (
      SELECT json_build_array(json_build_object(
        'name', 'Total Interacciones',
        'value', COALESCE(SUM(total_interacciones), 0),
        'fill', '#38bdf8'
      ))
      FROM leads
    )
  ) INTO result;

  RETURN result;
END;
$function$;

-- ============================================================
-- 2. NUEVA get_consultas_stats (Para /consultas)
-- ============================================================
DROP FUNCTION IF EXISTS public.get_consultas_stats();

CREATE OR REPLACE FUNCTION public.get_consultas_stats()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSON;
  now_timestamp TIMESTAMPTZ := NOW();
  start_of_week TIMESTAMPTZ := date_trunc('week', now_timestamp);
  start_of_day TIMESTAMPTZ := date_trunc('day', now_timestamp);
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'programadas', COUNT(*) FILTER (WHERE estado_cita = 'Programada'),
    'confirmadas', COUNT(*) FILTER (WHERE estado_cita = 'Confirmada' OR estado_confirmacion = 'Confirmada'),
    'completadas', COUNT(*) FILTER (WHERE estado_cita = 'Completada'),
    'canceladas', COUNT(*) FILTER (WHERE estado_cita = 'Cancelada'),
    'reagendadas', COUNT(*) FILTER (WHERE estado_cita = 'Reagendada'),
    'noAsistio', COUNT(*) FILTER (WHERE estado_cita = 'No Asistió'),
    'hoy', COUNT(*) FILTER (WHERE fecha_hora_inicio >= start_of_day AND fecha_hora_inicio < start_of_day + INTERVAL '1 day'),
    'semana', COUNT(*) FILTER (WHERE fecha_hora_inicio >= start_of_week AND fecha_hora_inicio < start_of_week + INTERVAL '1 week'),
    
    -- Métricas agregadas para UI
    'metricas', json_build_object(
      'tasaConfirmacion', CASE WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE estado_confirmacion = 'Confirmada')::NUMERIC / COUNT(*)) * 100) 
        ELSE 0 END,
        
      'tasaCancelacion', CASE WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE estado_cita = 'Cancelada')::NUMERIC / COUNT(*)) * 100) 
        ELSE 0 END,
        
      'tasaAsistencia', CASE WHEN COUNT(*) FILTER (WHERE estado_cita IN ('Completada', 'No Asistió')) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE estado_cita = 'Completada')::NUMERIC / 
        COUNT(*) FILTER (WHERE estado_cita IN ('Completada', 'No Asistió'))) * 100) 
        ELSE 0 END,
        
      'confirmaciones', json_build_object(
        'pendientes', COUNT(*) FILTER (WHERE estado_confirmacion = 'Pendiente' AND fecha_hora_inicio > now_timestamp),
        'confirmadas', COUNT(*) FILTER (WHERE estado_confirmacion = 'Confirmada' AND fecha_hora_inicio > now_timestamp),
        'vencidas', COUNT(*) FILTER (WHERE estado_confirmacion = 'Pendiente' AND fecha_hora_inicio BETWEEN now_timestamp AND now_timestamp + INTERVAL '3 hours')
      ),
      
      'porSede', json_build_object(
        'polanco', COUNT(*) FILTER (WHERE sede = 'POLANCO'),
        'satelite', COUNT(*) FILTER (WHERE sede = 'SATELITE')
      ),
      
      'primeraVez', COUNT(*) FILTER (WHERE tipo_cita = 'Primera Vez'),
      'seguimiento', COUNT(*) FILTER (WHERE tipo_cita = 'Seguimiento')
    )
  )
  INTO result
  FROM consultas;

  RETURN result;
END;
$function$;
