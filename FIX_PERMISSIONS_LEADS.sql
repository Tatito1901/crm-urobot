-- ============================================
-- FIX: Permission denied for table leads
-- ============================================
-- Este script soluciona el error "permission denied"
-- otorgando permisos completos a las tablas
-- ============================================

-- ============================================
-- PASO 1: DESHABILITAR RLS EN TODAS LAS TABLAS
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
-- PASO 2: OTORGAR PERMISOS COMPLETOS (ESTO FALTABA)
-- ============================================
-- Sin estos GRANT, aunque RLS esté deshabilitado,
-- los roles anon/authenticated no pueden acceder
-- ============================================

-- Tabla: leads
GRANT ALL ON public.leads TO anon;
GRANT ALL ON public.leads TO authenticated;

-- Tabla: consultas
GRANT ALL ON public.consultas TO anon;
GRANT ALL ON public.consultas TO authenticated;

-- Tabla: pacientes
GRANT ALL ON public.pacientes TO anon;
GRANT ALL ON public.pacientes TO authenticated;

-- Tabla: recordatorios
GRANT ALL ON public.recordatorios TO anon;
GRANT ALL ON public.recordatorios TO authenticated;

-- Tabla: escalamientos (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'escalamientos') THEN
        EXECUTE 'GRANT ALL ON public.escalamientos TO anon';
        EXECUTE 'GRANT ALL ON public.escalamientos TO authenticated';
        IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'escalamientos_id_seq') THEN
            EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.escalamientos_id_seq TO anon';
            EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.escalamientos_id_seq TO authenticated';
        END IF;
    END IF;
END $$;

-- Tabla: conversaciones (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversaciones') THEN
        EXECUTE 'GRANT ALL ON public.conversaciones TO anon';
        EXECUTE 'GRANT ALL ON public.conversaciones TO authenticated';
        IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'conversaciones_id_seq') THEN
            EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.conversaciones_id_seq TO anon';
            EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.conversaciones_id_seq TO authenticated';
        END IF;
    END IF;
END $$;

-- Tabla: sedes (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sedes') THEN
        EXECUTE 'GRANT ALL ON public.sedes TO anon';
        EXECUTE 'GRANT ALL ON public.sedes TO authenticated';
        IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'sedes_id_seq') THEN
            EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.sedes_id_seq TO anon';
            EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.sedes_id_seq TO authenticated';
        END IF;
    END IF;
END $$;

-- Tabla: conocimiento_procedimientos_urologia (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conocimiento_procedimientos_urologia') THEN
        EXECUTE 'GRANT ALL ON public.conocimiento_procedimientos_urologia TO anon';
        EXECUTE 'GRANT ALL ON public.conocimiento_procedimientos_urologia TO authenticated';
        IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'conocimiento_procedimientos_urologia_id_seq') THEN
            EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.conocimiento_procedimientos_urologia_id_seq TO anon';
            EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.conocimiento_procedimientos_urologia_id_seq TO authenticated';
        END IF;
    END IF;
END $$;

-- ============================================
-- PASO 3: VERIFICAR PERMISOS
-- ============================================

-- Verificar RLS deshabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Habilitado"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'leads', 'consultas', 'pacientes', 'recordatorios',
    'escalamientos', 'conversaciones', 'sedes', 
    'conocimiento_procedimientos_urologia'
  )
ORDER BY tablename;

-- Verificar permisos otorgados
SELECT 
  grantee,
  table_schema,
  table_name,
  string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated')
  AND table_name IN (
    'leads', 'consultas', 'pacientes', 'recordatorios',
    'escalamientos', 'conversaciones', 'sedes',
    'conocimiento_procedimientos_urologia'
  )
GROUP BY grantee, table_schema, table_name
ORDER BY table_name, grantee;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Primera query: Todas las tablas deben tener "RLS Habilitado" = false
-- Segunda query: Cada tabla debe mostrar permisos para anon y authenticated
--                 con privilegios: SELECT, INSERT, UPDATE, DELETE, etc.
-- ============================================

-- ============================================
-- PROBAR ACCESO
-- ============================================
-- Si ejecutas esto como usuario anon/authenticated, NO debe fallar:
SELECT COUNT(*) as total_leads FROM public.leads;
SELECT COUNT(*) as total_consultas FROM public.consultas;
SELECT COUNT(*) as total_pacientes FROM public.pacientes;
