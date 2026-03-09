# Análisis V6 — Datos de 324 Leads Reales (Supabase)
## Fecha: 2026-03-08

---

## 1. Métricas Generales

| Métrica | Valor |
|---------|-------|
| Total leads | 324 |
| Citas agendadas | 14 (4.3%) |
| Cita propuesta | 165 (50.9%) |
| Interactuando | 143 (44.1%) |
| Preguntaron precio | 126 (38.9%) |
| De esos, agendaron | 9 (7.1%) |

---

## 2. Rendimiento por Campaña

| Campaña | Leads | Agendadas | Tasa | Avg Msgs | Preguntaron Precio |
|---------|-------|-----------|------|----------|--------------------|
| GENERAL | 238 | 10 | 4.2% | 5.6 | 95 (40%) |
| PRÓSTATA | 48 | **0** | **0.0%** | 4.7 | 17 (35%) |
| CIRCUNCISIÓN | 38 | 4 | 10.5% | 6.6 | 14 (37%) |

### Detalle Próstata (0% conversión):
| Headline del anuncio | Leads | Respondieron | Conv. real (4+ msgs) | Agendadas |
|---------------------|-------|--------------|-----------------------|-----------|
| "¿Cansado de interrumpir tu sueño?" | 27 | 27 | 13 (48%) | 0 |
| "¿Te despiertas más de una vez...?" | 21 | 21 | 17 (81%) | 0 |

### Detalle Circuncisión:
| Headline del anuncio | Leads | Agendadas | Tasa |
|---------------------|-------|-----------|------|
| "3 señales médicas para circuncisión" | 38 | 4 | 10.5% |

---

## 3. Punto de Abandono (último mensaje del bot antes del silencio)

| Tipo de último mensaje | Leads perdidos |
|------------------------|---------------|
| Dio precio | **50** |
| Ofreció horario | 40 |
| Cierre activo (Polanco/Satélite) | 39 |
| Otro | 32 |
| Cierre pasivo | 18 |

**Hallazgo**: 50 leads se fueron justo después de recibir precio. La estrategia de objeciones no está funcionando.

---

## 4. Perfiles de Paciente

| Perfil | Leads | Agendadas | Tasa |
|--------|-------|-----------|------|
| decidido | 11 | 2 | **18.2%** |
| indiferente | 17 | 2 | 11.8% |
| interesado_cauteloso | 175 | 6 | 3.4% |
| precio_sensible | 58 | 1 | 1.7% |
| solo_curiosidad | 58 | 1 | 1.7% |

### Barreras principales:
| Barrera | Leads | Agendadas | Tasa |
|---------|-------|-----------|------|
| ninguna | 252 | 12 | 4.8% |
| precio | 58 | 1 | **1.7%** |
| tiempo | 7 | 1 | 14.3% |
| distancia | 6 | 0 | 0% |

---

## 5. Temperaturas por Campaña

| Campaña | Temp | Leads | Preg. Precio | Agendadas |
|---------|------|-------|-------------|-----------|
| CIRCUNCISIÓN | frío | 27 | 9 | 1 |
| CIRCUNCISIÓN | tibio | 7 | 2 | 0 |
| CIRCUNCISIÓN | caliente | 4 | 3 | **3** |
| GENERAL | frío | 224 | 73 | 1 |
| GENERAL | tibio | 49 | 29 | 4 |
| GENERAL | caliente | 11 | 10 | **4** |
| GENERAL | muy_caliente | 2 | 0 | 1 |

**Hallazgo**: Los leads calientes que preguntan precio tienen la mayor tasa de conversión. El precio NO mata la venta — la falta de manejo post-precio sí.

---

## 6. VPH — Demanda Orgánica Existente

Solo 8 mensajes mencionan VPH/papiloma/verrugas en toda la base:
- **José Gil** (VPH + diabetes + circuncisión) → **AGENDÓ** ✅
- **matin68688402** (VPH + verrugas) → bot le cotizó $16,000 de circuncisión (incorrecto) ❌
- **FreddiLM** (condilomas + prediabetes) → cita_propuesta
- **Alejo** (fimosis + verrugas + diabetes) → cita_propuesta

**Problema**: El bot NO sabe manejar VPH como caso independiente. Lo mezcla con circuncisión.

---

## 7. Problemas Críticos Encontrados en Conversaciones Reales

### P1: Próstata — Primer mensaje genérico rompe conexión emocional
**El paciente ve**: "¿Te despiertas más de una vez por la noche para ir al baño?"
**El bot responde**: "Le platico rápido: la mayoría de los pacientes que nos contactan vienen por algún tema de próstata o vías urinarias..."
**Resultado**: Se pierde la conexión emocional del anuncio. 0% conversión en 48 leads.

### P2: "¿Me platica su caso?" sigue apareciendo en circuncisión
Conversación de José (Mar 2): El bot preguntó "¿Me platica un poco qué lo motivó?" **3 veces** antes de dar precio. Viola REGLA 4.

### P3: Cierre pasivo sigue apareciendo
Conversación de Andrés: "tómese su tiempo", "Cuando guste me avisa", "Aquí quedo al pendiente", "aquí seguimos a sus órdenes" — 4 frases prohibidas en 1 conversación.

### P4: Bot repite mismo cierre 5+ veces
juliocarlosmujica584: El bot preguntó "¿Polanco o Satélite?" 5 veces. El paciente seguía preguntando cosas y el bot solo repetía el cierre.

### P5: Errores de calendario causan abandono
labustos45: Bot se disculpó 4 veces por errores del calendario, nunca agendó. Lead caliente perdido.

### P6: Precio incorrecto en conversaciones tempranas
$1,000 en vez de $1,200 (Noe Amaya, Antonio Lucero — prompt viejo).

### P7: VPH cotizado como circuncisión ($16K)
matin68688402 preguntó por VPH/verrugas y el bot le dio precio de circuncisión.

---

## 8. Cambios en V6

### Nuevos:
1. **Campaña VPH completa** — $3,500 precio fijo, flujos específicos para miedo/vergüenza
2. **REGLA 8** — No repetir mismo cierre si paciente no respondió
3. **Cirugía de próstata** — Desde $44,500 (Médica/Medlar)
4. **Fallback calendario mejorado** — 1 disculpa máx, luego escalar a humano

### Corregidos:
5. **Próstata primer mensaje** — Conecta con el síntoma del anuncio, no genérico
6. **Prohibida frase** "la mayoría de los pacientes que nos contactan"
7. **Prohibida frase** "Con gusto le paso los costos. Pero antes..."
8. **Objeciones por campaña** — Respuestas específicas ($16K/$3.5K/$1.2K)
9. **"Lo voy a pensar" por campaña** — Próstata con urgencia médica

### Eliminados:
10. Reducidos ejemplos few-shot (12→8)
11. Eliminada `<closing_timing>` (consolidada en reglas)
12. Eliminado "CIERRE POR CONTEXTO" (no se ejecutaba)

---

## 9. Estrategia de 3 Anuncios

### Anuncio CIRCUNCISIÓN (existente — optimizar):
- **Headline actual**: "3 señales médicas para considerar una circuncisión" → 10.5% conversión, mantener
- **Enfoque mercado**: El paciente ya sabe que necesita. Solo necesita precio + logística + confianza
- **Bot V6**: Precio inmediato ($16K todo incluido), recuperación en 3 días, cierre binario

### Anuncio PRÓSTATA (existente — rediseñar):
- **Headlines actuales**: 0% conversión en ambos
- **Problema**: El bot no conecta con el dolor que el anuncio activó
- **Bot V6**: Primer mensaje valida el sufrimiento + "no es normal por la edad" + consulta $1,200 con ultrasonido
- **Sugerencia de headline**: Mantener los actuales (generan buen volumen: 48 leads), el problema era el bot, no el anuncio

### Anuncio VPH (NUEVO):
- **Mercado**: Hombres que descubrieron verrugas/lesiones genitales. Asustados, avergonzados, quieren solución rápida
- **Headline sugerido**: "¿Encontraste algo que no estaba ahí? Un urólogo puede resolverlo en una visita."
- **Bot V6**: Calmar miedo + discreción + precio directo ($3,500) + cierre
- **Diferenciador**: Precio fijo accesible ($3,500 vs competidores), resolución en 1 visita

---

## 10. Métricas Objetivo Post-V6

| Métrica | Actual | Objetivo |
|---------|--------|----------|
| Tasa general de agendamiento | 4.3% | 8-10% |
| Próstata → agendada | 0.0% | 5-8% |
| Circuncisión → agendada | 10.5% | 15-18% |
| VPH → agendada | N/A | 10-15% |
| Leads con cierre pasivo | 18 (10%) | < 3% |
| Leads perdidos post-precio | 50 (28%) | < 15% |
