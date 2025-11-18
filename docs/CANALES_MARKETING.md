# 📊 Canales de Marketing - Guía de Uso

## Descripción
El campo `canal_marketing` en la tabla `leads` permite clasificar el origen de cada lead según su canal de adquisición.

## Canales Disponibles

| Canal | Icono | Color | Descripción |
|-------|-------|-------|-------------|
| **Facebook Ads** | 📘 | Azul | Leads de campañas pagadas en Facebook |
| **Google Ads** | 🔍 | Rojo | Leads de campañas de búsqueda o display en Google |
| **Instagram Ads** | 📸 | Rosa | Leads de campañas pagadas en Instagram |
| **Orgánico** | 🌱 | Verde | Leads que llegaron de forma natural (SEO, boca a boca) |
| **Referido** | 👥 | Morado | Leads referidos por otros pacientes o contactos |
| **WhatsApp Directo** | 💬 | Verde esmeralda | Leads que contactaron directamente por WhatsApp |
| **Otro** | 📌 | Gris | Otros orígenes no clasificados |

## Actualizar Canal desde n8n

En tus workflows de n8n, puedes actualizar el canal de marketing cuando creas o actualizas un lead:

```javascript
// Ejemplo de actualización en n8n
const leadData = {
  nombre_completo: "Juan Pérez",
  telefono_whatsapp: "5512345678",
  fuente_lead: "WhatsApp",
  canal_marketing: "Facebook Ads", // ⚠️ Usar exactamente estos valores
  // ... otros campos
};
```

## Valores Válidos (Case-Sensitive)

⚠️ **Importante**: Los valores deben escribirse exactamente como se muestran:

```typescript
✅ CORRECTO:
- "Facebook Ads"
- "Google Ads"
- "Instagram Ads"
- "Orgánico"
- "Referido"
- "WhatsApp Directo"
- "Otro"

❌ INCORRECTO:
- "facebook ads" (minúsculas)
- "FACEBOOK ADS" (mayúsculas)
- "Facebook" (incompleto)
- "FB Ads" (abreviado)
```

## Actualizar Leads Existentes

Si necesitas actualizar leads existentes en Supabase:

```sql
-- Ver distribución actual
SELECT 
  canal_marketing,
  COUNT(*) as total
FROM leads
GROUP BY canal_marketing
ORDER BY total DESC;

-- Actualizar leads sin canal
UPDATE leads 
SET canal_marketing = 'Otro' 
WHERE canal_marketing IS NULL;

-- Actualizar leads específicos
UPDATE leads 
SET canal_marketing = 'Facebook Ads' 
WHERE fuente_lead LIKE '%facebook%' 
  AND canal_marketing IS NULL;
```

## Filtrar por Canal en el CRM

La interfaz muestra automáticamente badges de colores para cada canal:

- Los leads se pueden filtrar por estado
- El origen se visualiza con iconos y colores distintivos
- La vista mobile también muestra el canal de forma prominente

## Integración con n8n

En tu workflow `UROBOT` o `LEAD_TRACKER`, asegúrate de capturar y asignar el canal:

```javascript
// Detectar canal desde URL de origen
let canal = "Otro";

if (urlOrigen.includes("facebook.com") || fbclid) {
  canal = "Facebook Ads";
} else if (urlOrigen.includes("google.com") || gclid) {
  canal = "Google Ads";
} else if (urlOrigen.includes("instagram.com")) {
  canal = "Instagram Ads";
} else if (esReferido) {
  canal = "Referido";
} else if (esOrganico) {
  canal = "Orgánico";
}

// Insertar/actualizar en Supabase
await supabase
  .from('leads')
  .upsert({
    telefono_whatsapp: telefono,
    canal_marketing: canal,
    // ... otros campos
  });
```

## Análisis y Reportes

Con esta clasificación puedes generar reportes de:

- **ROI por canal**: ¿Qué canal genera más conversiones?
- **Costo por lead**: Comparar inversión vs. resultados
- **Tiempo de conversión**: ¿Qué canal convierte más rápido?
- **Calidad del lead**: Puntuación promedio por canal

```sql
-- Reporte de conversión por canal
SELECT 
  canal_marketing,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN estado = 'Convertido' THEN 1 END) as convertidos,
  ROUND(
    COUNT(CASE WHEN estado = 'Convertido' THEN 1 END)::numeric / 
    COUNT(*)::numeric * 100, 
    2
  ) as tasa_conversion_pct
FROM leads
WHERE canal_marketing IS NOT NULL
GROUP BY canal_marketing
ORDER BY tasa_conversion_pct DESC;
```

## Mejores Prácticas

1. ✅ **Consistencia**: Siempre usa los valores exactos definidos
2. ✅ **Asignación temprana**: Define el canal al crear el lead
3. ✅ **Tracking**: Usa UTM parameters para detectar el canal automáticamente
4. ✅ **Revisión periódica**: Audita que no haya leads sin canal asignado
5. ✅ **Documentación**: Mantén registro de campañas activas por canal

## Soporte

Para agregar nuevos canales o modificar los existentes:

1. Actualiza `/types/canales-marketing.ts`
2. Reinicia el servidor de desarrollo
3. Los cambios se reflejarán automáticamente en la UI
