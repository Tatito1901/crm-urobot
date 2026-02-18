# Análisis Detallado: Cardiobot vs Urobot V2
## Mejores prácticas a aplicar en Urobot

**Fecha:** 2026-02-18
**Objetivo:** Identificar qué hace bien Cardiobot que Urobot no tiene, y aplicar esas mejoras.

---

## 1. RESUMEN EJECUTIVO

Ambos bots siguen la misma arquitectura base de n8n:
```
WhatsApp → Filtrar → Rate Limit → Media → Normalizar → Debounce → Contexto → AI Agent → Limpiar → Enviar → Guardar
```

**Cardiobot tiene 3 capas adicionales que Urobot NO tiene:**

| Capa | Cardiobot | Urobot V2 | Impacto |
|------|-----------|-----------|---------|
| Pre-análisis con IA | Gemini analiza intención, emociones, urgencia, perfil del paciente ANTES del agente | ❌ No existe | El agente recibe contexto pobre |
| Clasificación post-respuesta | Clasifica la fase de cada respuesta del bot | ❌ No existe | No se puede medir dónde se pierden pacientes |
| Lead enriquecido | 24 parámetros con datos de Meta Ads, síntomas estructurados, factores de riesgo | 11 parámetros básicos con regex | Scoring impreciso, sin atribución de ads |

---

## 2. PIPELINE COMPARATIVO DETALLADO

### Pasos compartidos (✅ ambos los tienen):
| Paso | Descripción | Estado |
|------|-------------|--------|
| 🚫 Filtrar Status | Anti-loop para status updates | ✅ Idéntico |
| ⚡ Rate Limit Check | Rechaza mensajes > 5 min | ✅ Idéntico |
| 📱 Tipo Media? | Switch imagen/audio/documento/texto | ✅ Idéntico |
| OpenAI Vision | Análisis de imágenes médicas | ✅ Idéntico |
| OpenAI Whisper | Transcripción de audio | ✅ Idéntico |
| 1️⃣ Validar y Normalizar | Extrae teléfono, nombre, tipo media, Meta Ads | ✅ Idéntico |
| 🔒 Check Rate Limit DB | `check_rate_limit()` en Postgres | ✅ Idéntico |
| 2️⃣ Upsert Conversación | `upsert_conversacion_inteligente()` | ✅ Idéntico |
| 3️⃣ Guardar Mensaje | `insertar_mensaje_idempotente()` | ⚠️ Diferente firma |
| 📝 Debounce | register_debounce → wait → check_debounce | ⚠️ Cardiobot 5s, Urobot 30s |
| 4️⃣ Cargar Contexto | Función de contexto en BD | ⚠️ Diferentes funciones |
| 5️⃣ Procesar Contexto | Parsea JSON del contexto | ⚠️ Cardiobot más rico |

### 🔴 PASOS QUE CARDIOBOT TIENE Y UROBOT NO:

#### 2.1 — 6️⃣ Analizar Gemini (PRE-ANÁLISIS CON IA)
**¿Qué hace?** Un LLM (Gemini 2.5 Flash Lite) analiza el mensaje del paciente ANTES de que llegue al agente principal. Extrae:

```
PARTE 1: INTENCIÓN Y COMPORTAMIENTO
├── intencion_principal (agendar_listo, agendar_dudando, solo_informacion, precio, sintomas, etc.)
├── perfil_paciente (decidido, interesado_dudoso, solo_curiosidad, precio_primero, urgente, etc.)
├── emociones_detectadas [miedo, ansiedad, frustración, esperanza, etc.]
├── nivel_compromiso (1-10)
├── prediccion_conversion (alta, media, baja, muy_baja)
├── incentivo_sugerido (urgencia_temporal, prueba_social, reciprocidad, etc.)
├── barrera_principal (precio, miedo, tiempo, desconfianza, distancia, etc.)
└── detalle_barrera (texto libre)

PARTE 2: SEÑALES DE PRECIO
├── pregunto_precio (boolean)
├── nivel_sensibilidad (alta, media, baja, ninguna)
└── objecion_precio (boolean)

PARTE 3: DATOS CLÍNICOS
├── sintomas_estructurados [{nombre, severidad, duracion, localizacion}]
├── banderas_rojas [array de flags urgentes]
├── urgencia_percibida (emergencia, alta, moderada, normal, baja)
├── tiempo_evolucion (texto)
├── antecedentes_mencionados [array]
├── medicamentos_mencionados [array]
├── edad_detectada (número o null)
├── ocupacion (texto o null)
└── para_quien (para_si_mismo, familiar, otro)
```

**¿Por qué importa?** El agente principal recibe un "briefing" completo del paciente. Sabe si está decidido o dudando, si le preocupa el precio, si tiene urgencia real. Puede adaptar su tono y estrategia.

**En Urobot:** El nodo `📈 Analizar Scoring` usa regex simple que detecta quizás 30% de las intenciones. No detecta emociones, no predice conversión, no identifica barreras.

#### 2.2 — 7️⃣ Procesar Análisis
Parsea el JSON del análisis de Gemini, hace merge de síntomas con historial previo, calcula urgencia combinada (nueva + previa), y prepara todo para el upsert del lead.

#### 2.3 — 8️⃣ Guardar Lead (`upsert_lead_cardiobot`)
**24 parámetros** incluyendo:
- Síntomas estructurados (JSON con severidad, duración, localización)
- Factores de riesgo (perfil paciente, predicción conversión, incentivo sugerido, barrera, sensibilidad precio, emociones, ocupación, edad, antecedentes, medicamentos)
- Atribución Meta Ads completa (ctwa_clid, ad_id, adset_id, campaign_id, ad_name, campaign_name, headline, referral_source)

**En Urobot:** `upsert_lead_v11` tiene 11 parámetros: teléfono, nombre, fuente, canal, vacío, intención, urgencia, síntomas[], banderas[], preguntó_precio, sentimiento. Sin datos de Meta Ads, sin factores de riesgo.

#### 2.4 — 9️⃣ Formatear Contexto (versión rica)
Cardiobot formatea el contexto con:
- Señales de urgencia médica (🚨)
- Perfil behavioral del paciente
- Nivel de compromiso y predicción de conversión
- Sensibilidad al precio
- Historial de BD como fallback cuando Simple Memory está vacío
- Indicación de si es primera interacción

**En Urobot:** El contexto incluye temperatura, score, funnel, cita pendiente, síntomas, banderas — pero NO incluye perfil behavioral, ni predicción de conversión, ni sensibilidad al precio.

#### 2.5 — 🏷️ Procesar Clasificación (POST-RESPUESTA)
Después de que el bot genera su respuesta, un clasificador híbrido analiza QUÉ HIZO el bot:
```
fase_conversacion: confirmacion | horarios_dados | oferta_cita | descubrimiento | seguimiento | educacion | objecion | despedida
accion_bot: confirmar_cita | dar_horarios | preguntar | informar | cerrar
espera_respuesta: boolean
```

**¿Por qué importa?** Permite medir en el CRM:
- ¿En qué fase se pierden los pacientes?
- ¿Cuántas veces el bot ofrece horarios vs cuántas veces confirma?
- ¿El bot está preguntando demasiado sin ofrecer horarios?

**En Urobot:** ❌ NO EXISTE. No hay forma de saber en qué fase de la conversación el paciente abandona.

#### 2.6 — 💾 Guardar Respuesta (`guardar_mensaje_cardiobot`)
Guarda la respuesta del bot CON la clasificación:
- `fase_conversacion`
- `accion_bot`
- `espera_respuesta`

**En Urobot:** `guardar_mensaje_urobot` guarda el mensaje pero sin clasificación.

#### 2.7 — LLM Fallback
Cardiobot tiene **2 LLMs** conectados al agente:
1. **Gemini 3 Pro** (principal)
2. **Gemini 3 Flash** (fallback si Pro falla)

**En Urobot:** Solo Gemini 3 Pro. Si falla, el paciente recibe un mensaje de error.

---

## 3. COMPARACIÓN DE SYSTEM PROMPTS

### Cardiobot (ALPHA-MED v17) — Fortalezas únicas:

1. **Contexto de tráfico Facebook** — Explica al modelo que los pacientes llegan por anuncio, NO buscan cardiólogo activamente. Esto cambia completamente la estrategia conversacional.

2. **Psicología de persuasión avanzada:**
   - Calibrated Questions de Chris Voss
   - Principios de Cialdini (escasez, autoridad, reciprocidad, prueba social)
   - Funnel awareness → consideration → decision → scheduling

3. **Regla de NO usar nombre del paciente** — "Un doctor real por WhatsApp no escribe el nombre del paciente en cada mensaje — se siente robótico."

4. **Funnel stage mapping** — El prompt describe exactamente qué hacer en cada etapa del funnel con señales específicas.

### Urobot (Prompt V3) — Ya tiene bien:
- ✅ Estructura XML clara y organizada
- ✅ "Vacío de conocimiento" como principio core (metáforas que abren el gap)
- ✅ Técnicas de persuasión (Chris Voss, etiquetado emocional, prueba social)
- ✅ Shortcuts para intenciones directas (precio, síntoma, ubicación)
- ✅ Red flags con manejo de urgencias
- ✅ Ejemplos completos de conversaciones
- ✅ Self-check al final

### Lo que Urobot debería agregar del prompt de Cardiobot:
1. **Contexto de tráfico Facebook** — El prompt de Urobot NO menciona que los pacientes vienen de anuncios
2. **Regla de NO usar nombre** — Urobot no tiene esta regla, y los bots tienden a sonar robóticos
3. **Funnel stage awareness** — El prompt de Urobot no describe qué hacer según la etapa del funnel
4. **Reglas de formato más estrictas** — Cardiobot tiene "máximo 3 párrafos, último párrafo es la pregunta/oferta"

---

## 4. COMPARACIÓN DE BASE DE DATOS

### Tablas que Urobot YA tiene (bien):
| Tabla | Registros | Descripción |
|-------|-----------|-------------|
| `leads` | 1 | Con scoring, temperatura, funnel, síntomas, banderas |
| `conversaciones` | 1+ | Metadata de conversaciones |
| `mensajes` | 5+ | Mensajes individuales |
| `consultas` | 0 | Citas agendadas |
| `pacientes` | 0 | Pacientes convertidos |
| `urobot_metricas_crm` | 0 | Métricas agregadas |
| `urobot_errores` | 0 | Log de errores |
| `urobot_alertas` | 0 | Alertas del sistema |
| `bot_rate_limits` | 1 | Rate limiting |
| `debounce_whatsapp` | 1 | Debounce |
| `meta_ads_campaigns` | 0 | Campañas de Meta Ads |
| `meta_ads_daily_insights` | 0 | Insights diarios de Meta Ads |
| `prompt_versions` | 0 | Versionado de prompts |
| `prompt_metrics` | 0 | Métricas por versión de prompt |

### Lo que FALTA en la BD de Urobot:

#### 4.1 — Columnas faltantes en `leads`:
```sql
-- Factores de riesgo behavioral (Cardiobot los tiene en upsert_lead_cardiobot)
factores_riesgo jsonb DEFAULT '{}'
-- Incluiría: perfil_paciente, prediccion_conversion, incentivo_sugerido,
--            barrera_principal, nivel_sensibilidad_precio, emociones_detectadas,
--            ocupacion, edad_detectada, antecedentes_mencionados, medicamentos_mencionados

-- Atribución Meta Ads detallada
fb_ctwa_clid text
fb_ad_id text
fb_adset_id text
fb_campaign_id text
fb_ad_name text
fb_campaign_name text
fb_headline text
fb_referral_source text
```

#### 4.2 — Columnas faltantes en `mensajes`:
```sql
-- Clasificación de respuesta del bot (Cardiobot las guarda en guardar_mensaje_cardiobot)
fase_conversacion text  -- confirmacion, horarios_dados, oferta_cita, descubrimiento, etc.
accion_bot text         -- confirmar_cita, dar_horarios, preguntar, informar, cerrar
espera_respuesta boolean DEFAULT true
```

#### 4.3 — Función `obtener_contexto_urobot_v2` necesita enriquecer:
Debería devolver también:
- `perfil_paciente` (del lead)
- `prediccion_conversion` (del lead)
- `barrera_principal` (del lead)
- `nivel_sensibilidad_precio` (del lead)
- Última `fase_conversacion` del bot (del último mensaje outbound)

---

## 5. PLAN DE MEJORAS — PRIORIZADO

### 🔴 PRIORIDAD 1: Agregar pre-análisis con IA (Alto impacto)
**Qué:** Agregar un nodo Gemini Analizador entre "5️⃣ Procesar Contexto" y "9️⃣ Formatear Contexto"
**Cómo:** 
1. Copiar el prompt del nodo "6️⃣ Analizar Gemini" de Cardiobot
2. Adaptar para urología (cambiar referencias cardíacas por urológicas)
3. Agregar nodo "7️⃣ Procesar Análisis" que parsea el JSON
4. Conectar la salida al Formatear Contexto

**Impacto esperado:** +30-50% en calidad de respuestas del bot porque recibe contexto behavioral completo.

### 🔴 PRIORIDAD 2: Enriquecer leads con datos behavioral (Alto impacto)
**Qué:** Migrar `upsert_lead_v11` a una versión más rica
**Cómo:**
1. Agregar columnas `factores_riesgo jsonb`, atribución Meta Ads a tabla `leads`
2. Crear nueva función `upsert_lead_v12` que acepte los datos del análisis
3. Actualizar el nodo n8n para pasar los datos enriquecidos

### 🟡 PRIORIDAD 3: Agregar clasificación post-respuesta (Medio impacto)
**Qué:** Clasificar cada respuesta del bot con fase y acción
**Cómo:**
1. Agregar columnas `fase_conversacion`, `accion_bot`, `espera_respuesta` a `mensajes`
2. Agregar nodo clasificador después de "🧹 Limpiar Respuesta"
3. Actualizar `guardar_mensaje_urobot` para guardar la clasificación

### 🟡 PRIORIDAD 4: Agregar LLM fallback (Medio impacto)
**Qué:** Conectar Gemini Flash como fallback del agente
**Cómo:** En n8n, agregar segundo LLM al AI Agent node

### 🟢 PRIORIDAD 5: Mejorar prompt con reglas de Cardiobot (Bajo esfuerzo)
**Qué:** Agregar al system prompt de Urobot:
1. Contexto de tráfico Facebook
2. Regla de no usar nombre del paciente
3. Funnel stage awareness
4. Límite de formato más estricto

### 🟢 PRIORIDAD 6: Ajustar debounce (Bajo esfuerzo)
**Qué:** Cambiar debounce de 30s a 5s como Cardiobot
**Por qué:** 30s es demasiado tiempo — el paciente puede pensar que el bot no funciona

---

## 6. MÉTRICAS QUE EL CRM YA PUEDE MOSTRAR

El CRM ya tiene hooks robustos:
- `useUrobotMetricasCRM` — KPIs, diario, por hora, intenciones, funnel
- `useUrobotStats` — Errores, alertas, herramientas usadas, sentiment
- `useConversacionesStats` — Mensajes enviados/recibidos, tipos interacción
- `useStats` — Dashboard general con leads, consultas, pacientes
- `useLeads` — Lista y detalle de leads

### Métricas NUEVAS que se podrán mostrar después de las mejoras:
1. **Funnel de conversación** — En qué fase abandona cada paciente
2. **Heatmap de barreras** — Qué barrera es la más común (precio, miedo, tiempo)
3. **Perfil de pacientes** — Distribución decidido/dudoso/curiosidad/urgente
4. **Predicción de conversión** — Score de probabilidad por lead
5. **Atribución de Meta Ads** — Qué campaña/anuncio genera más citas

---

## 7. RESUMEN DE CAMBIOS NECESARIOS — ESTADO POST-INTEGRACIÓN

| Cambio | Dónde | Esfuerzo | Impacto | Estado |
|--------|-------|----------|---------|--------|
| Pre-análisis Gemini | n8n workflow | Alto | 🔴 Crítico | ✅ Ya existía en Urobot V2 (nodo 6️⃣ Analizar Gemini) |
| Enriquecer leads | DB + n8n | Medio | 🔴 Crítico | ✅ `signals` jsonb + `scores` jsonb + Meta Ads campos en `leads` |
| Clasificación post-respuesta | DB + n8n + Frontend | Medio | 🟡 Alto | ✅ Columnas en `mensajes`, nodo n8n corregido, badges en chat UI |
| LLM fallback | n8n workflow | Bajo | 🟡 Alto | ⏳ Pendiente (P2-3) |
| Mejorar prompt | n8n workflow | Bajo | 🟢 Medio | ⏳ Pendiente — se puede aplicar directamente en n8n |
| Ajustar debounce 30s→5s | n8n workflow | Bajo | 🟢 Medio | ✅ Reducido a 5s en UROBOT V2.json |
| Nuevos hooks CRM | Código React | Medio | 🟢 Medio | ✅ 4 hooks nuevos + 3 charts + 2 secciones UI |

---

## 8. DETALLE DE INTEGRACIÓN COMPLETADA (2026-02-19)

### FASE 1 — Base de Datos ✅
- Columnas `fase_conversacion`, `accion_bot`, `espera_respuesta` en `mensajes`
- `guardar_mensaje_urobot()` actualizada con 3 params nuevos
- `obtener_contexto_urobot_v2()` enriquecida: signals, Meta Ads, última fase bot
- `get_conversation_funnel_stats()` nueva RPC para analytics de fases
- `get_leads_by_campaign_stats()` nueva RPC para atribución Meta Ads
- `get_behavioral_distribution_stats()` nueva RPC para perfiles behavioral
- `get_mensajes_por_telefono()` retorna clasificación de mensajes

### FASE 2 — n8n Workflow ✅ (parcial)
- Nodo `💾 Guardar Respuesta Bot` corregido: pasa `fase_conversacion`, `accion_bot`, `espera_respuesta`
- Debounce reducido de 30s a 5s
- ⏳ LLM fallback pendiente (requiere configuración manual en n8n)

### FASE 3 — Frontend Types ✅
- `Lead` interface: `signals: LeadSignals`, `scores: LeadScores`, Meta Ads fields
- `Mensaje` interface: `faseConversacion`, `accionBot`, `esperaRespuesta`
- `FASE_DISPLAY` constant con labels y colores para badges
- `parseSignals()`, `parseScores()` parsers en 3 hooks

### FASE 4 — Frontend UI ✅
- `LeadClinicSidebar`: sección behavioral (perfil, predicción, compromiso, emociones, barreras, scores)
- `LeadClinicSidebar`: sección Meta Ads attribution (campaña, headline, URL, CTWA)
- `MessageBubble`: badge de `fase_conversacion` en mensajes del bot
- `ConversationActionsPanel`: perfil behavioral compacto + badge Meta Ads

### FASE 5 — Frontend Analytics ✅
- `ConversationFunnelChart` en /urobot → CRM tab (horizontal bar chart con KPIs)
- `CampaignLeadsChart` en /estadisticas (leads por campaña Meta Ads)
- `BehavioralDistributionChart` en /urobot → CRM tab (3 mini donuts: perfiles, predicción, barreras)
- Hooks: `useConversationFunnel`, `useLeadsByCampaign`, `useBehavioralDistribution`

### FASE 6 — Verificación ✅
- Build limpio (exit 0) en todas las páginas
- TypeScript sin errores
- Todas las rutas compiladas correctamente
