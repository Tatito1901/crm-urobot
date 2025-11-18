-- ============================================================
-- Script: Estandarizar Canales de Marketing
-- ============================================================
-- Este script actualiza los valores del campo canal_marketing
-- para que sean consistentes con la definición del frontend
--
-- ANTES DE EJECUTAR: Revisa primero la distribución actual
-- ============================================================

-- PASO 1: Ver distribución actual de canales
SELECT 
  canal_marketing,
  COUNT(*) as total,
  ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 2) as porcentaje
FROM leads
GROUP BY canal_marketing
ORDER BY total DESC;

-- PASO 2: Ver leads sin canal asignado
SELECT 
  COUNT(*) as sin_canal,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM leads) * 100, 2) as porcentaje_sin_canal
FROM leads
WHERE canal_marketing IS NULL;

-- ============================================================
-- ACTUALIZACIONES SUGERIDAS
-- ============================================================

-- Asignar "Otro" a leads sin canal
-- DESCOMENTAR para ejecutar:
-- UPDATE leads 
-- SET canal_marketing = 'Otro' 
-- WHERE canal_marketing IS NULL;

-- Normalizar variaciones comunes de Facebook
-- DESCOMENTAR para ejecutar:
-- UPDATE leads 
-- SET canal_marketing = 'Facebook Ads' 
-- WHERE canal_marketing ILIKE '%facebook%' 
--   OR canal_marketing ILIKE '%fb%'
--   OR fuente_lead ILIKE '%facebook%';

-- Normalizar variaciones comunes de Google
-- DESCOMENTAR para ejecutar:
-- UPDATE leads 
-- SET canal_marketing = 'Google Ads' 
-- WHERE canal_marketing ILIKE '%google%'
--   OR canal_marketing ILIKE '%adwords%'
--   OR fuente_lead ILIKE '%google%';

-- Normalizar variaciones comunes de Instagram
-- DESCOMENTAR para ejecutar:
-- UPDATE leads 
-- SET canal_marketing = 'Instagram Ads' 
-- WHERE canal_marketing ILIKE '%instagram%'
--   OR canal_marketing ILIKE '%ig%'
--   OR fuente_lead ILIKE '%instagram%';

-- Normalizar variaciones comunes de Orgánico
-- DESCOMENTAR para ejecutar:
-- UPDATE leads 
-- SET canal_marketing = 'Orgánico' 
-- WHERE canal_marketing ILIKE '%organic%'
--   OR canal_marketing ILIKE '%orgánico%'
--   OR canal_marketing ILIKE '%organico%'
--   OR canal_marketing ILIKE '%natural%'
--   OR canal_marketing ILIKE '%seo%';

-- Normalizar variaciones comunes de Referido
-- DESCOMENTAR para ejecutar:
-- UPDATE leads 
-- SET canal_marketing = 'Referido' 
-- WHERE canal_marketing ILIKE '%referid%'
--   OR canal_marketing ILIKE '%referral%'
--   OR canal_marketing ILIKE '%recomenda%'
--   OR fuente_lead ILIKE '%referid%';

-- Normalizar variaciones comunes de WhatsApp Directo
-- DESCOMENTAR para ejecutar:
-- UPDATE leads 
-- SET canal_marketing = 'WhatsApp Directo' 
-- WHERE canal_marketing ILIKE '%whatsapp%'
--   OR canal_marketing ILIKE '%wapp%'
--   OR canal_marketing ILIKE '%wa%'
--   OR fuente_lead = 'WhatsApp';

-- ============================================================
-- VERIFICACIÓN POST-ACTUALIZACIÓN
-- ============================================================

-- Ver distribución después de actualizar
-- DESCOMENTAR para ejecutar después de las actualizaciones:
-- SELECT 
--   canal_marketing,
--   COUNT(*) as total,
--   ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 2) as porcentaje
-- FROM leads
-- GROUP BY canal_marketing
-- ORDER BY total DESC;

-- ============================================================
-- CONSTRAINT PARA VALIDAR VALORES (OPCIONAL)
-- ============================================================

-- Si quieres asegurar que solo se usen valores válidos,
-- puedes agregar un CHECK constraint:
-- DESCOMENTAR solo si estás seguro:
-- ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_canal_marketing_check;
-- ALTER TABLE leads ADD CONSTRAINT leads_canal_marketing_check 
--   CHECK (canal_marketing IN (
--     'Facebook Ads',
--     'Google Ads',
--     'Instagram Ads',
--     'Orgánico',
--     'Referido',
--     'WhatsApp Directo',
--     'Otro'
--   ) OR canal_marketing IS NULL);

-- ============================================================
-- REPORTE DE CONVERSIÓN POR CANAL
-- ============================================================

-- Ver efectividad de cada canal
SELECT 
  COALESCE(canal_marketing, 'Sin Canal') as canal,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN estado = 'Convertido' THEN 1 END) as convertidos,
  ROUND(
    COUNT(CASE WHEN estado = 'Convertido' THEN 1 END)::numeric / 
    NULLIF(COUNT(*), 0)::numeric * 100, 
    2
  ) as tasa_conversion_pct,
  ROUND(AVG(puntuacion_lead), 2) as puntuacion_promedio
FROM leads
GROUP BY canal_marketing
ORDER BY tasa_conversion_pct DESC NULLS LAST;
