# ANÁLISIS EXPERTO DEL SISTEMA DE PROMPT — UROBOT V5

## Fecha: 3 de marzo 2026
## Basado en: 185 leads reales, 91 que preguntaron precio, conversaciones completas analizadas

---

## 1. RESUMEN EJECUTIVO

### Números clave del funnel:
| Métrica | Valor | Problema |
|---------|-------|----------|
| Total leads | 185 | — |
| Preguntaron precio | 91 (49%) | Casi la mitad pregunta precio |
| Barrera = precio | 37 (20%) | 1 de cada 5 leads se frena por precio |
| Preguntaron precio → cita agendada | 5/91 (5.5%) | **94.5% de drop después de precio** |
| Conversión total | 8/185 (4.3%) | — |

### Diagnóstico principal:
**El bot pierde el 94.5% de los pacientes después de mencionar el precio.** El manejo de objeciones actual es superficial, usa un solo ángulo de persuasión y se rinde después del primer intento.

---

## 2. PROBLEMAS CRÍTICOS ENCONTRADOS (con evidencia)

### PROBLEMA 1: Bot sigue condicionando el precio (gatekeeping)
**Severidad: CRÍTICA**

A pesar de la regla "NUNCA condiciones dar precio", el bot sigue haciéndolo:

> **Ángel Beltrán** preguntó "Costo?" → Bot respondió: *"Con gusto le paso los costos. Pero antes, para darle la información correcta, ¿me platica un poco qué le gustaría revisar?"*

**Causa raíz:** La instrucción es negativa ("NUNCA condiciones") pero no hay instrucción POSITIVA de qué hacer. El modelo necesita un ejemplo explícito de la respuesta correcta.

**Fix:** Agregar ejemplo positivo: "Si preguntan precio, responde INMEDIATAMENTE con el precio y lo que incluye."

---

### PROBLEMA 2: Se rinde en el primer intento de objeción
**Severidad: CRÍTICA**

Regla actual: *"haz 1 intento suave y luego cierra con dignidad"*

**Caso Vianey Orihuela:**
- Paciente: "Ustedes cobran 16,000 y por acá me están cobrando 9,000"
- Bot: "La diferencia se debe al Láser CO2... **Quedamos a sus órdenes por si en algún momento prefiere esta opción. ¡Que tenga un excelente día!**"
- → Lead muerto. Un solo intento. Cero reframe de valor.

**Caso "My Family" (26 mensajes, 7 horas de conversación):**
- Paciente dijo "Encontré uno más económico, cirugía con láser"
- Bot: "La diferencia es la tecnología Láser CO2... aquí seguiremos a sus órdenes"
- Paciente: "Pero sube mucho"
- Bot: ofreció consulta de $1,200
- Paciente: "¿Le interesa hacer la cirugía por $8,000?"
- Bot: "El costo es fijo"
- → 4 oportunidades de persuadir, TODAS desperdiciadas con el mismo ángulo repetido

**Fix:** Framework de 3-4 niveles de respuesta con ángulos DIFERENTES.

---

### PROBLEMA 3: Un solo diferenciador mencionado (no hay value stacking)
**Severidad: ALTA**

Cuando el paciente dice "es caro", el bot SIEMPRE responde con UNO de estos:
- "Láser CO2"
- "Recuperación rápida"
- "Se hace en consultorio"

NUNCA los combina. NUNCA menciona:
- ❌ Que NO hay costos extra de hospital
- ❌ Que NO necesita anestesiólogo (ahorro de $3-5K)
- ❌ Que NO requiere quirófano (ahorro de $5-15K)
- ❌ Que se va a su casa EL MISMO DÍA
- ❌ Que al TERCER DÍA regresa a oficina
- ❌ Que el precio incluye TODO (láser + anestesia + materiales + post-op)
- ❌ Comparación: en quirófano cuesta $40-80K

**Fix:** Sección dedicada de "Ventaja Consultorio" con instrucciones de cuándo usarla.

---

### PROBLEMA 4: "Recuperación rápida" es vago e inefectivo
**Severidad: MEDIA-ALTA**

Cada mención de recuperación dice "rápida" o "bastante rápida" sin especificar:

> "Se realiza en consultorio con anestesia local y la recuperación suele ser rápida"
> "Se realiza en consultorio con anestesia local y la recuperación suele ser bastante rápida"

Los datos ESPECÍFICOS persuaden más que los adjetivos vagos:
- ✅ "48 horas de reposo relativo"
- ✅ "Al tercer día puede regresar a oficina"
- ✅ "15 días para ejercicio moderado"
- ✅ "30-60 minutos el procedimiento"
- ✅ "Se va a su casa el mismo día"

**Fix:** Regla: "Siempre usa tiempos específicos en lugar de 'rápida'."

---

### PROBLEMA 5: "¿Polanco o Satélite?" usado en momento incorrecto
**Severidad: MEDIA**

El bot cierra con la pregunta de sede incluso cuando el paciente está expresando una objeción de precio:

> Paciente: "¿Y es caro o cuánto cuesta?"
> Bot: "...$16,000... También puede empezar con consulta... **¿Le queda mejor Polanco o Satélite?**"

Cerrar ANTES de resolver la objeción se siente como presión de venta.

**Fix:** "Solo cierra con pregunta de sede DESPUÉS de que la objeción principal esté resuelta o el paciente muestre interés."

---

### PROBLEMA 6: Nunca pregunta contra qué comparan
**Severidad: MEDIA**

Cuando el paciente dice "encontré más barato", el bot NUNCA pregunta:
- "¿Con qué técnica?" (bisturí vs láser)
- "¿En consultorio o quirófano?"
- "¿Incluye los mismos materiales?"

Esto es una oportunidad ENORME de diferenciación desperdiciada.

---

### PROBLEMA 7: Consulta de $1,200 usada como "premio de consolación"
**Severidad: MEDIA**

Cuando el paciente objeta el precio de $16K, el bot siempre dice "puede empezar con consulta de $1,200" como si fuera descender de categoría. Debería enmarcarse como:
- "Muchos pacientes prefieren conocer al Doctor primero, ver la tecnología y planear con calma"
- "En consulta el Doctor le explica todo el proceso y puede programar la fecha con anticipación"

---

## 3. TÉCNICAS DE PERSUASIÓN FALTANTES

### A. Value Stacking (Apilar beneficios)
En lugar de mencionar UN diferenciador, apilar todos en una sola respuesta cuando hay objeción de precio. Cada beneficio adicional reduce la percepción de "caro".

### B. Reframe de Costo
- Costo por día: $16K ÷ años de beneficio = pesos por día
- Comparación con hospital: $40-80K en quirófano vs $16K en consultorio
- "All-inclusive" vs costos separados

### C. Future Pacing
"Imagine que en 3 semanas ya está recuperado y se olvida del problema." Proyectar al paciente en un futuro donde YA se resolvió.

### D. Social Proof Sutil
"El Doctor realiza este procedimiento varias veces por semana" = experiencia y normalización.

### E. Aislamiento de Objeción
"Aparte del precio, ¿es algo que le gustaría resolver?" — Si dice sí, la objeción es SOLO precio (más fácil de resolver).

### F. Micro-compromiso
"¿Le aparto un espacio tentativo?" en lugar de "aquí seguimos cuando guste."

### G. Loss Aversion (solo si mencionó síntomas)
"Las molestias que me comenta tienden a empeorar con el tiempo" — SOLO usando sus propias palabras.

---

## 4. LO QUE SÍ FUNCIONA (mantener)

1. **Tono humano y profesional** — Las conversaciones suenan naturales
2. **Cierres binarios** — "¿Polanco o Satélite?" es buena técnica (pero mal timing)
3. **Uso de USTED** — Correcto y respetuoso
4. **No inventar horarios** — Usa herramienta de calendario correctamente
5. **Manejo de urgencias** — Correcto
6. **Personalización con nombre** — Cuando lo tiene, lo usa bien
7. **Empatía con síntomas** — "Eso lo ve el Doctor con mucha frecuencia" normaliza bien

---

## 5. PLAN DE ACCIÓN → PROMPT V5

### Cambios principales:
1. **NUEVO: Sección MANEJO DE OBJECIONES** con framework de 3 niveles por tipo de objeción
2. **NUEVO: Sección VENTAJA CONSULTORIO** — conocimiento que el bot puede usar para value-stacking
3. **MEJORADO: Regla de cierre** — "Usa hasta 3 ángulos DIFERENTES antes de cerrar con dignidad"
4. **MEJORADO: Presentación de precio** — Siempre con lo que incluye
5. **MEJORADO: Recuperación** — Tiempos específicos obligatorios
6. **MEJORADO: Timing del cierre** — Solo después de resolver objeción
7. **ELIMINADO: "1 intento suave y cerrar"** — Reemplazado por framework de niveles
8. **REFORZADO: No gatekeeping** — Con ejemplo positivo explícito

### Impacto esperado:
- Si mejoramos la conversión post-precio de 5.5% a 15%, eso = ~14 citas agendadas vs 5 actuales = **+180% en conversiones**
- Meta conservadora: 10% = ~9 citas = +80%
