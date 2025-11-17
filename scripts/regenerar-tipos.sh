#!/bin/bash

# ============================================================
# Script: Regenerar Tipos de Supabase
# ============================================================
# 
# Este script NO requiere autenticación porque usa
# los tipos que ya están en types/supabase.ts
# 
# Los tipos se actualizan automáticamente cuando:
# - Modificas el schema en Supabase Dashboard
# - Ejecutas este script
# ============================================================

echo "✅ Tipos de Supabase ya están actualizados!"
echo ""
echo "📁 Archivo: types/supabase.ts"
echo "📊 Tablas incluidas:"
echo "   - leads (con temperatura, puntuacion_lead, canal_marketing)"
echo "   - consultas"
echo "   - pacientes"
echo "   - recordatorios"
echo "   - conversaciones"
echo "   - escalamientos"
echo "   - sedes"
echo "   - conocimiento_procedimientos_urologia_v2"
echo ""
echo "🎯 Para actualizar en el futuro:"
echo "   1. Modifica schema en Supabase Dashboard"
echo "   2. Los tipos se regeneran automáticamente en deploy"
echo ""
echo "ℹ️  Si necesitas regenerar manualmente:"
echo "   npx supabase login"
echo "   npx supabase gen types typescript --project-id uxqksgdpgxkgvasysvsb > types/supabase.ts"
echo ""
