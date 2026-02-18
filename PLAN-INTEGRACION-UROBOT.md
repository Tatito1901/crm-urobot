# Plan Maestro de Integración: UROBOT V2
## n8n → Supabase → Frontend

**Fecha inicio:** 2026-02-18
**Objetivo:** Unificar el flujo completo de datos desde n8n (quien recibe), Supabase (quien transforma y guarda), y Frontend (quien muestra).

---

## PRINCIPIO ARQUITECTÓNICO

```
n8n (FUENTE)          Supabase (ALMACÉN)         Frontend (VISTA)
┌──────────┐          ┌──────────────┐           ┌──────────────┐
│ WhatsApp  │──msg───▶│ mensajes     │──query───▶│ ChatArea     │
│ Gemini    │──anal──▶│ leads.signals│──query───▶│ LeadSidebar  │
│ Clasific. │──fase──▶│ mensajes.fase│──query───▶│ UrobotStats  │
│ Meta Ads  │──ref───▶│ leads.camp*  │──query───▶│ LeadsTable   │
└──────────┘          └──────────────┘           └──────────────┘
```

**Regla:** Ningún dato debe generarse en n8n sin guardarse en BD, y ningún dato guardado en BD debe quedarse sin mostrarse en Frontend.

---

## ESTADO ACTUAL (pre-integración)

| Dato | n8n genera | BD guarda | Frontend muestra | Status |
|------|-----------|-----------|-----------------|--------|
| Mensajes user/bot | ✅ | ✅ | ✅ | ✅ COMPLETO |
| Conversaciones | ✅ | ✅ | ✅ | ✅ COMPLETO |
| Lead básico | ✅ | ✅ | ✅ | ✅ COMPLETO |
| Lead clínico | ✅ | ✅ | ✅ | ✅ COMPLETO |
| Consultas/Citas | ✅ | ✅ | ✅ | ✅ COMPLETO |
| Dashboard KPIs | N/A | ✅ | ✅ | ✅ COMPLETO |
| `fase_conversacion` | ✅ genera | ❌ NO guarda (`''`) | ❌ | 🔴 ROTO |
| `accion_bot` | ✅ genera | ❌ NO guarda (`''`) | ❌ | 🔴 ROTO |
| `signals` behavioral | ✅ genera | ✅ `leads.signals` jsonb | ❌ NO lee | 🟡 PARCIAL |
| Meta Ads attribution | ✅ genera | ✅ `leads.campana_*` | ❌ NO muestra | 🟡 PARCIAL |
| Scores desglosados | ✅ genera | ✅ `leads.scores` jsonb | ⚠️ Solo `score_total` | 🟡 PARCIAL |

---

## FASE 1: BASE DE DATOS (Cimientos)

> **Por qué primero:** Frontend no puede mostrar datos que la BD no tiene. n8n no puede guardar datos en columnas que no existen.

### P1-1: Agregar columnas de clasificación a `mensajes`
- [ ] `ALTER TABLE mensajes ADD COLUMN fase_conversacion text;`
- [ ] `ALTER TABLE mensajes ADD COLUMN accion_bot text;`
- [ ] `ALTER TABLE mensajes ADD COLUMN espera_respuesta boolean DEFAULT true;`
- **Dependencias:** Ninguna
- **Valida:** Columnas existen con `\d mensajes`

### P1-2: Actualizar `guardar_mensaje_urobot()`
- [ ] Agregar 3 params: `p_fase_conversacion text`, `p_accion_bot text`, `p_espera_respuesta boolean`
- [ ] INSERT debe escribir estos 3 campos nuevos
- [ ] Mantener backwards compatibility (defaults `NULL`)
- **Dependencias:** P1-1
- **Valida:** `SELECT guardar_mensaje_urobot('test', 'Test', 'bot', 'Hola', 'text', '{}', NULL, NULL, 'test', NULL, NULL, NULL, 'bienvenida', 'presentarse', true)` → debe retornar jsonb con msg_id

### P1-3: Enriquecer `obtener_contexto_urobot_v2()`
- [ ] Retornar `signals` completo del lead (perfil_paciente, prediccion_conversion, etc.)
- [ ] Retornar última `fase_conversacion` del último mensaje bot
- [ ] Retornar `barrera_principal` si existe en signals
- **Dependencias:** P1-1
- **Valida:** `SELECT obtener_contexto_urobot_v2('5216673184624')` → debe incluir `signals`, `ultima_fase_bot`

### P1-4: Crear función `get_conversation_funnel_stats()`
- [ ] Agrupa mensajes outbound por `fase_conversacion` para un rango de fechas
- [ ] Retorna: conteo por fase, transiciones más comunes, fase donde más se abandonan
- **Dependencias:** P1-1, P1-2 (necesita datos reales)
- **Valida:** Retorna JSON con distribución de fases

---

## FASE 2: n8n WORKFLOW (Fuente de datos)

> **Por qué segundo:** Una vez que BD puede recibir los datos, n8n debe enviarlos correctamente.

### P2-1: Corregir nodo `💾 Guardar Respuesta Bot`
- [ ] Cambiar `queryReplacement` para referenciar outputs del clasificador
- **Cambio específico en n8n:**
  ```
  // ANTES (params 7-8 vacíos):
  queryReplacement: [tel, nombre, 'bot', texto, 'text', '{}', '', '', 'AI Agent', '']
  
  // DESPUÉS (params con datos del clasificador):
  queryReplacement: [tel, nombre, 'bot', texto, 'text', '{}', null, null, 'AI Agent', null, null, null,
    $('🏷️ Procesar Clasificación').first().json.fase_conversacion || null,
    $('🏷️ Procesar Clasificación').first().json.accion_bot || null,
    $('🏷️ Procesar Clasificación').first().json.espera_respuesta ?? true
  ]
  ```
- [ ] Actualizar la query SQL para usar la nueva firma de `guardar_mensaje_urobot`
- **Dependencias:** P1-2 (función actualizada)
- **Valida:** Ejecutar workflow con mensaje de prueba → verificar en BD que mensajes.fase_conversacion tiene valor

### P2-2: Reducir debounce 30s → 5s
- [ ] Nodo `⏳ Debounce 30s`: cambiar `amount` de 30 a 5
- [ ] Renombrar nodo a `⏳ Debounce 5s`
- **Dependencias:** Ninguna (independiente)
- **Valida:** Tiempo de respuesta del bot baja de ~35s a ~10s

### P2-3: Agregar LLM fallback
- [ ] En nodo `🤖 AI Agent`, conectar segundo model (Gemini 2.5 Flash) como fallback
- **Dependencias:** Ninguna
- **Valida:** Si Gemini Pro falla (simular con timeout), Flash responde

---

## FASE 3: FRONTEND — TIPOS Y DATOS (Capa de acceso)

> **Por qué tercero:** Antes de construir UI, los tipos TypeScript y hooks deben saber qué datos existen.

### P3-1: Agregar `signals` a interface Lead
**Archivo:** `types/leads.ts`
- [ ] Crear interface `LeadSignals` con: `perfil_paciente`, `emociones`, `nivel_compromiso`, `prediccion_conversion`, `incentivo_sugerido`
- [ ] Agregar campo `signals: LeadSignals | null` a interface `Lead`
- [ ] Actualizar `mapLeadFromDB()` para parsear `row.signals`
- **Dependencias:** Ninguna (BD ya tiene el dato)
- **Valida:** `console.log(lead.signals)` muestra datos behavioral

### P3-2: Agregar campos Meta Ads a Lead
**Archivo:** `types/leads.ts`
- [ ] Agregar: `campanaId`, `campanaHeadline`, `campanaUrl`, `ctwaClid` a interface `Lead`
- [ ] Actualizar `mapLeadFromDB()` para mapear `row.campana_id` → `campanaId`, etc.
- [ ] Agregar campo derivado `esMetaAds: boolean`
- **Dependencias:** Ninguna (BD ya tiene el dato)
- **Valida:** Lead con Meta Ads muestra `lead.esMetaAds === true`

### P3-3: Agregar tipo de mensaje con fase
**Archivo:** `types/chat.ts`
- [ ] Agregar `fase_conversacion?: string` y `accion_bot?: string` al tipo de mensaje
- [ ] Verificar que el hook `useConversaciones` / `get_mensajes_por_telefono` retorne estas columnas
- **Dependencias:** P1-1 (columnas deben existir)
- **Valida:** Mensajes del bot incluyen `fase_conversacion` en el payload

---

## FASE 4: FRONTEND — COMPONENTES UI (Capa visual)

> **Por qué cuarto:** Con tipos listos, construimos los componentes que muestran los datos.

### P4-1: Behavioral Signals en LeadClinicSidebar
**Archivo:** `app/leads/components/LeadClinicSidebar.tsx`
- [ ] Nueva sección "Perfil Behavioral" debajo de datos clínicos
- [ ] Mostrar: perfil_paciente (badge), prediccion_conversion (badge color), nivel_compromiso (progress bar 1-10)
- [ ] Mostrar: emociones_detectadas (tags), barrera_principal (badge)
- [ ] Mostrar: incentivo_sugerido (texto)
- **Dependencias:** P3-1
- **Valida:** Sidebar muestra datos behavioral al seleccionar un lead

### P4-2: Meta Ads Attribution en UI de Leads
**Archivos:** `app/leads/components/LeadClinicSidebar.tsx` o `LeadsTable.tsx`
- [ ] Badge "Meta Ads" en leads que llegaron por campaña
- [ ] Tooltip/sección con: headline de campaña, URL, ctwa_clid
- [ ] En tabla: columna o icono indicando fuente (Meta Ads vs Orgánico)
- **Dependencias:** P3-2
- **Valida:** Lead con Meta Ads muestra badge y datos de campaña

### P4-3: Badge de fase en MessageBubble
**Archivo:** `app/conversaciones/components/` (MessageBubble o similar)
- [ ] Badge discreto debajo de mensajes del bot: "🏷 descubrimiento", "📅 horarios_dados", etc.
- [ ] Solo visible para mensajes outbound que tengan `fase_conversacion`
- [ ] Colores por tipo: verde=confirmación, azul=horarios, gris=conversación
- **Dependencias:** P3-3
- **Valida:** Mensajes del bot en el chat muestran badge de fase

### P4-4: Datos clínicos en ConversationActionsPanel
**Archivo:** `app/conversaciones/components/ConversationActionsPanel.tsx`
- [ ] Mini-resumen: síntomas principales (chips), banderas rojas (alert), predicción conversión (badge)
- [ ] Usar `useLeadClinico` + `signals` del lead
- **Dependencias:** P3-1
- **Valida:** Panel de acciones muestra contexto clínico del paciente activo

---

## FASE 5: FRONTEND — ANALYTICS (Capa de insights)

> **Por qué quinto:** Una vez que los datos fluyen, creamos las visualizaciones de alto nivel.

### P5-1: Funnel de Fases de Conversación
**Archivo:** Nuevo chart en `app/urobot/components/`
- [ ] Hook que llama `get_conversation_funnel_stats()`
- [ ] Chart tipo Sankey o funnel: bienvenida → descubrimiento → horarios → confirmación
- [ ] Mostrar dónde se "pierden" pacientes (drop-off por fase)
- [ ] Ubicar en `/urobot` tab "CRM"
- **Dependencias:** P1-4, P4-3 (datos reales necesarios)
- **Valida:** Funnel muestra distribución real de fases

### P5-2: Leads por Campaña Meta Ads
**Archivo:** Nuevo chart en `app/estadisticas/components/`
- [ ] Query: `SELECT campana_headline, count(*), avg(score_total) FROM leads WHERE campana_id IS NOT NULL GROUP BY 1`
- [ ] Bar chart o table: leads por campaña, score promedio, conversiones
- [ ] Ubicar en `/estadisticas`
- **Dependencias:** P3-2
- **Valida:** Chart muestra distribución de leads por campaña

### P5-3: Distribución Behavioral
**Archivo:** Nuevo chart en `app/urobot/components/`
- [ ] Donut: distribución de `perfil_paciente` (decidido/dudoso/curiosidad/urgente)
- [ ] Donut: distribución de `prediccion_conversion` (alta/media/baja)
- [ ] Bar: barreras más frecuentes
- [ ] Ubicar en `/urobot` tab "CRM"
- **Dependencias:** P3-1
- **Valida:** Charts muestran distribución real de perfiles

---

## FASE 6: VERIFICACIÓN

### P6-1: Test end-to-end
- [ ] Enviar mensaje WhatsApp de prueba
- [ ] Verificar en BD: mensaje guardado con `fase_conversacion`
- [ ] Verificar en BD: lead con `signals` jsonb poblado
- [ ] Verificar en Frontend: ChatArea muestra badge de fase
- [ ] Verificar en Frontend: LeadClinicSidebar muestra behavioral
- [ ] Verificar en Frontend: /urobot muestra funnel de fases
- **Dependencias:** Todas las fases anteriores

### P6-2: Actualizar documentación
- [ ] Actualizar `ANALISIS-CARDIOBOT-VS-UROBOT.md` con estado real
- [ ] Marcar capacidades que ya están implementadas
- **Dependencias:** P6-1

---

## ORDEN DE EJECUCIÓN

```
SEMANA 1: CIMIENTOS
├── P1-1 → P1-2 → P2-1  (pipeline clasificación: BD schema → BD función → n8n fix)
├── P1-3                   (contexto enriquecido, independiente)
└── P2-2, P2-3            (n8n quick wins, independientes)

SEMANA 2: TIPOS Y UI CORE  
├── P3-1, P3-2, P3-3      (tipos TypeScript, pueden hacerse en paralelo)
├── P4-1, P4-2             (UI de leads con behavioral + Meta Ads)
└── P4-3, P4-4             (UI de conversaciones con fases + clínico)

SEMANA 3: ANALYTICS Y VERIFICACIÓN
├── P1-4                   (función stats de fases)
├── P5-1, P5-2, P5-3      (charts de analytics)
└── P6-1, P6-2             (verificación e2e + docs)
```

---

## GRAFO DE DEPENDENCIAS

```
P1-1 (cols mensajes) ──▶ P1-2 (fn guardar) ──▶ P2-1 (n8n fix) ──▶ P6-1 (test)
         │                                                              ▲
         └──▶ P1-3 (fn contexto) ──▶ P3-3 (types chat) ──▶ P4-3 (badge fase) ──┘
                                                                        ▲
              P3-1 (types signals) ──▶ P4-1 (sidebar behavioral) ───────┘
              P3-2 (types meta ads) ──▶ P4-2 (meta ads UI) ────────────┘
              P1-4 (fn stats) ──▶ P5-1 (funnel chart)
              P3-1 ──▶ P5-3 (behavioral charts)
              P3-2 ──▶ P5-2 (meta ads chart)
              P2-2, P2-3 (independientes, ejecutar cuando sea)
```

---

## CHECKLIST RÁPIDO POR SESIÓN

Antes de cada sesión, revisar:
1. ¿En qué paso estamos? (ver status en todo_list)
2. ¿El paso anterior se completó? (verificar)
3. ¿Las dependencias del siguiente paso están listas?
4. Ejecutar el siguiente paso
5. Actualizar este doc y el todo_list
