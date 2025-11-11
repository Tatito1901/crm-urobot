-- ============================================
-- FIX URGENTE: DESHABILITAR RLS TEMPORALMENTE
-- ============================================
-- Este script soluciona los errores 403 (Forbidden)
-- deshabilitando Row Level Security en desarrollo.
--
-- ⚠️ IMPORTANTE: Esto es SOLO para desarrollo.
-- Para producción necesitarás políticas RLS adecuadas.
-- ============================================

-- 1. DESHABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordatorios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalamientos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sedes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conocimiento_procedimientos_urologia DISABLE ROW LEVEL SECURITY;

-- 2. VERIFICAR QUE RLS ESTÁ DESHABILITADO
-- Ejecuta esto después para confirmar
SELECT 
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'leads', 
    'consultas', 
    'pacientes', 
    'recordatorios', 
    'escalamientos', 
    'conversaciones', 
    'sedes', 
    'conocimiento_procedimientos_urologia'
  );

-- Si rowsecurity = false, está correcto
-- Si rowsecurity = true, ejecuta los ALTER TABLE nuevamente
