/**
 * ============================================================
 * CONFIGURACIÓN DEL EMBUDO DE VENTAS
 * ============================================================
 * Sistema unificado de etapas, acciones y plantillas de mensaje
 * para seguimiento de leads en el consultorio médico.
 * 
 * EMBUDO DE CONVERSIÓN:
 * ┌─────────────────────────────────────────────────────────┐
 * │  1. NUEVO          → Primer contacto, sin respuesta aún │
 * │  2. CONTACTADO     → Ya respondimos, en conversación    │
 * │  3. INTERESADO     → Preguntó precio/disponibilidad     │
 * │  4. CALIFICADO     → Listo para agendar, cumple perfil  │
 * │  5. CONVERTIDO     → Cita agendada = PACIENTE           │
 * │  ─────────────────────────────────────────────────────  │
 * │  ✖ NO_INTERESADO   → Decidió no continuar               │
 * │  ✖ PERDIDO         → Sin respuesta prolongada           │
 * └─────────────────────────────────────────────────────────┘
 */

import type { LeadEstado } from '@/types/leads';

// ============================================================
// TIPOS
// ============================================================

export interface PlantillaMensaje {
  id: string;
  nombre: string;
  mensaje: string;
  etapasAplica: LeadEstado[];
  descripcion: string;
}

export interface AccionFunnel {
  id: string;
  label: string;
  icon: string;
  descripcion: string;
  siguienteEtapa?: LeadEstado;
  plantillaSugerida?: string; // ID de plantilla
  color: string;
}

export interface EtapaFunnel {
  estado: LeadEstado;
  nombre: string;
  descripcion: string;
  objetivo: string;
  tiempoIdeal: string;
  indicadores: string[];
  acciones: AccionFunnel[];
  color: string;
  icon: string;
}

// ============================================================
// PLANTILLAS DE MENSAJE
// ============================================================

export const PLANTILLAS_MENSAJE: PlantillaMensaje[] = [
  // === ETAPA: NUEVO ===
  {
    id: 'saludo-inicial',
    nombre: '👋 Saludo inicial',
    mensaje: `¡Hola! Gracias por contactarnos. Soy del consultorio del Dr. [NOMBRE].

¿En qué podemos ayudarte? Estamos disponibles para resolver tus dudas sobre nuestros servicios.`,
    etapasAplica: ['Nuevo'],
    descripcion: 'Primer mensaje de bienvenida para leads nuevos'
  },
  {
    id: 'respuesta-rapida',
    nombre: '⚡ Respuesta rápida',
    mensaje: `¡Hola! Recibimos tu mensaje.

Un momento, en breve te atendemos personalmente. ¿Podrías compartirnos tu nombre completo?`,
    etapasAplica: ['Nuevo'],
    descripcion: 'Respuesta inmediata mientras se prepara respuesta completa'
  },

  // === ETAPA: CONTACTADO ===
  {
    id: 'info-servicios',
    nombre: '📋 Información de servicios',
    mensaje: `¡Perfecto, [NOMBRE]!

Contamos con los siguientes servicios:
• Consulta general de urología
• Estudios diagnósticos
• Procedimientos especializados

¿Hay algún tema específico que te interese conocer más?`,
    etapasAplica: ['Contactado'],
    descripcion: 'Presentar servicios disponibles'
  },
  {
    id: 'seguimiento-sin-respuesta',
    nombre: '🔔 Seguimiento sin respuesta',
    mensaje: `¡Hola [NOMBRE]! 

Hace unos días nos contactaste y queremos saber si aún podemos ayudarte.

¿Tienes alguna duda sobre nuestros servicios? Estamos para atenderte.`,
    etapasAplica: ['Contactado', 'Interesado'],
    descripcion: 'Reactivar conversación con lead que no ha respondido'
  },

  // === ETAPA: INTERESADO ===
  {
    id: 'enviar-costos',
    nombre: '💰 Costos y opciones',
    mensaje: `¡Claro, [NOMBRE]!

Estos son nuestros costos:
• Consulta inicial: $[PRECIO]
• Incluye: valoración completa y plan de tratamiento

📍 Ubicación: [DIRECCIÓN]
🕐 Horarios: Lunes a Viernes 9am-6pm, Sábado 9am-2pm

¿Te gustaría agendar una cita?`,
    etapasAplica: ['Interesado'],
    descripcion: 'Enviar información de precios cuando el lead pregunta'
  },
  {
    id: 'confirmar-interes',
    nombre: '🎯 Confirmar interés',
    mensaje: `¡Excelente, [NOMBRE]!

Para agendar tu cita necesito:
1. ¿Qué día te funciona mejor?
2. ¿Prefieres mañana o tarde?

Tenemos disponibilidad esta semana. ¿Qué te parece?`,
    etapasAplica: ['Interesado'],
    descripcion: 'Confirmar interés y solicitar preferencia de horario'
  },

  // === ETAPA: CALIFICADO ===
  {
    id: 'agendar-cita',
    nombre: '📅 Agendar cita',
    mensaje: `¡Perfecto, [NOMBRE]!

Tu cita queda agendada:
📅 Fecha: [FECHA]
🕐 Hora: [HORA]
📍 Lugar: [DIRECCIÓN]
👨‍⚕️ Doctor: [DOCTOR]

Recuerda traer:
• Identificación oficial
• Estudios previos (si tienes)

Te enviaremos recordatorio un día antes. ¡Te esperamos!`,
    etapasAplica: ['Calificado'],
    descripcion: 'Confirmar cita agendada con todos los detalles'
  },
  {
    id: 'preparacion-cita',
    nombre: '📝 Preparación para cita',
    mensaje: `¡Hola [NOMBRE]!

Para tu próxima consulta te recomendamos:
• Anotar tus síntomas o dudas
• Traer lista de medicamentos actuales
• Estudios previos relacionados

¿Tienes alguna pregunta antes de tu cita?`,
    etapasAplica: ['Calificado', 'Convertido'],
    descripcion: 'Instrucciones de preparación pre-consulta'
  },

  // === REACTIVACIÓN ===
  {
    id: 'reactivar-lead',
    nombre: '🔄 Reactivar lead inactivo',
    mensaje: `¡Hola [NOMBRE]!

Hace tiempo nos contactaste y queremos saber cómo estás.

Si aún necesitas atención urológica, seguimos disponibles para ayudarte. Actualmente tenemos disponibilidad para esta semana.

¿Te gustaría retomar la conversación?`,
    etapasAplica: ['Contactado', 'Interesado', 'No_Interesado'],
    descripcion: 'Mensaje para reactivar leads inactivos o perdidos'
  },

  // === CIERRE ===
  {
    id: 'agradecer-no-interes',
    nombre: '🙏 Agradecimiento (no interesado)',
    mensaje: `¡Gracias por tu tiempo, [NOMBRE]!

Si en el futuro necesitas atención urológica, no dudes en contactarnos.

¡Te deseamos lo mejor!`,
    etapasAplica: ['No_Interesado', 'Perdido'],
    descripcion: 'Cierre amable cuando el lead no está interesado'
  },
];

// ============================================================
// CONFIGURACIÓN DE ETAPAS DEL FUNNEL
// ============================================================

export const ETAPAS_FUNNEL: EtapaFunnel[] = [
  {
    estado: 'Nuevo',
    nombre: 'Nuevo Lead',
    descripcion: 'Persona que acaba de contactar por primera vez',
    objetivo: 'Responder en menos de 1 hora para maximizar conversión',
    tiempoIdeal: '< 1 hora',
    indicadores: [
      'Tiempo de primera respuesta',
      'Tasa de respuesta'
    ],
    acciones: [
      {
        id: 'enviar-saludo',
        label: 'Enviar saludo',
        icon: '👋',
        descripcion: 'Enviar mensaje de bienvenida',
        siguienteEtapa: 'Contactado',
        plantillaSugerida: 'saludo-inicial',
        color: 'blue'
      },
      {
        id: 'marcar-spam',
        label: 'Marcar spam',
        icon: '🚫',
        descripcion: 'No es un lead real',
        siguienteEtapa: 'Perdido',
        color: 'red'
      }
    ],
    color: 'blue',
    icon: '🆕'
  },
  {
    estado: 'Contactado',
    nombre: 'En Conversación',
    descripcion: 'Ya iniciamos contacto, esperando respuesta o dando información',
    objetivo: 'Identificar necesidades y despertar interés',
    tiempoIdeal: '1-3 días',
    indicadores: [
      'Número de mensajes intercambiados',
      'Tiempo de respuesta del lead'
    ],
    acciones: [
      {
        id: 'enviar-info',
        label: 'Enviar información',
        icon: '📋',
        descripcion: 'Compartir detalles de servicios',
        plantillaSugerida: 'info-servicios',
        color: 'blue'
      },
      {
        id: 'dar-seguimiento',
        label: 'Dar seguimiento',
        icon: '🔔',
        descripcion: 'Lead no ha respondido',
        plantillaSugerida: 'seguimiento-sin-respuesta',
        color: 'amber'
      },
      {
        id: 'marcar-interesado',
        label: 'Marcar interesado',
        icon: '🎯',
        descripcion: 'Mostró interés real',
        siguienteEtapa: 'Interesado',
        color: 'purple'
      },
      {
        id: 'marcar-no-interesado',
        label: 'No interesado',
        icon: '✖',
        descripcion: 'Decidió no continuar',
        siguienteEtapa: 'No_Interesado',
        color: 'gray'
      }
    ],
    color: 'amber',
    icon: '💬'
  },
  {
    estado: 'Interesado',
    nombre: 'Interesado Activo',
    descripcion: 'Preguntó por precios, disponibilidad o servicios específicos',
    objetivo: 'Cerrar la venta agendando una cita',
    tiempoIdeal: '1-2 días',
    indicadores: [
      'Preguntas sobre costos',
      'Solicitud de horarios'
    ],
    acciones: [
      {
        id: 'enviar-costos',
        label: 'Enviar costos',
        icon: '💰',
        descripcion: 'Compartir precios y opciones',
        plantillaSugerida: 'enviar-costos',
        color: 'emerald'
      },
      {
        id: 'ofrecer-cita',
        label: 'Ofrecer agendar',
        icon: '📅',
        descripcion: 'Proponer agendar cita',
        plantillaSugerida: 'confirmar-interes',
        color: 'purple'
      },
      {
        id: 'marcar-calificado',
        label: 'Listo para agendar',
        icon: '✅',
        descripcion: 'Confirmó que quiere cita',
        siguienteEtapa: 'Calificado',
        color: 'emerald'
      }
    ],
    color: 'purple',
    icon: '🎯'
  },
  {
    estado: 'Calificado',
    nombre: 'Listo para Agendar',
    descripcion: 'Confirmó interés y está listo para su primera cita',
    objetivo: 'Confirmar cita y convertir a paciente',
    tiempoIdeal: '< 24 horas',
    indicadores: [
      'Cita agendada',
      'Confirmación recibida'
    ],
    acciones: [
      {
        id: 'confirmar-cita',
        label: 'Confirmar cita',
        icon: '📅',
        descripcion: 'Enviar confirmación de cita',
        plantillaSugerida: 'agendar-cita',
        siguienteEtapa: 'Convertido',
        color: 'emerald'
      },
      {
        id: 'enviar-preparacion',
        label: 'Enviar preparación',
        icon: '📝',
        descripcion: 'Instrucciones pre-consulta',
        plantillaSugerida: 'preparacion-cita',
        color: 'blue'
      }
    ],
    color: 'emerald',
    icon: '✅'
  },
  {
    estado: 'Convertido',
    nombre: 'Paciente',
    descripcion: '¡Éxito! Este lead ya es paciente con cita agendada',
    objetivo: 'Asegurar asistencia y satisfacción',
    tiempoIdeal: 'N/A',
    indicadores: [
      'Cita completada',
      'Satisfacción del paciente'
    ],
    acciones: [
      {
        id: 'ver-paciente',
        label: 'Ver expediente',
        icon: '👤',
        descripcion: 'Ir al perfil del paciente',
        color: 'emerald'
      },
      {
        id: 'enviar-recordatorio',
        label: 'Recordatorio',
        icon: '🔔',
        descripcion: 'Enviar recordatorio de cita',
        plantillaSugerida: 'preparacion-cita',
        color: 'blue'
      }
    ],
    color: 'emerald',
    icon: '🏆'
  },
  {
    estado: 'No_Interesado',
    nombre: 'No Interesado',
    descripcion: 'Decidió no continuar con el proceso',
    objetivo: 'Dejar puerta abierta para futuro',
    tiempoIdeal: 'N/A',
    indicadores: [
      'Motivo de no interés'
    ],
    acciones: [
      {
        id: 'reactivar',
        label: 'Intentar reactivar',
        icon: '🔄',
        descripcion: 'Enviar mensaje de reactivación',
        plantillaSugerida: 'reactivar-lead',
        color: 'amber'
      },
      {
        id: 'cerrar-amable',
        label: 'Cerrar amablemente',
        icon: '🙏',
        descripcion: 'Enviar despedida',
        plantillaSugerida: 'agradecer-no-interes',
        siguienteEtapa: 'Perdido',
        color: 'gray'
      }
    ],
    color: 'gray',
    icon: '✖'
  },
  {
    estado: 'Perdido',
    nombre: 'Perdido',
    descripcion: 'Sin respuesta prolongada o cerrado',
    objetivo: 'Archivar y analizar motivo',
    tiempoIdeal: 'N/A',
    indicadores: [
      'Motivo de pérdida'
    ],
    acciones: [
      {
        id: 'reactivar-perdido',
        label: 'Intentar reactivar',
        icon: '🔄',
        descripcion: 'Último intento de reactivación',
        plantillaSugerida: 'reactivar-lead',
        siguienteEtapa: 'Contactado',
        color: 'amber'
      }
    ],
    color: 'red',
    icon: '💤'
  }
];

// ============================================================
// HELPERS
// ============================================================

/**
 * Obtiene la configuración de una etapa por estado
 */
export function getEtapaConfig(estado: LeadEstado): EtapaFunnel | undefined {
  return ETAPAS_FUNNEL.find(e => e.estado === estado);
}

/**
 * Obtiene las plantillas aplicables a un estado
 */
export function getPlantillasParaEtapa(estado: LeadEstado): PlantillaMensaje[] {
  return PLANTILLAS_MENSAJE.filter(p => p.etapasAplica.includes(estado));
}

/**
 * Obtiene una plantilla por ID
 */
export function getPlantilla(id: string): PlantillaMensaje | undefined {
  return PLANTILLAS_MENSAJE.find(p => p.id === id);
}

/**
 * Reemplaza variables en un mensaje de plantilla
 */
export function personalizarPlantilla(
  mensaje: string, 
  variables: Record<string, string>
): string {
  let resultado = mensaje;
  for (const [key, value] of Object.entries(variables)) {
    resultado = resultado.replace(new RegExp(`\\[${key.toUpperCase()}\\]`, 'g'), value);
  }
  return resultado;
}

/**
 * Obtiene la acción principal sugerida para un lead
 */
export function getAccionPrincipal(estado: LeadEstado, esInactivo: boolean): AccionFunnel | null {
  const etapa = getEtapaConfig(estado);
  if (!etapa) return null;
  
  // Si está inactivo, priorizar seguimiento/reactivación
  if (esInactivo) {
    const accionReactivar = etapa.acciones.find(a => 
      a.id.includes('seguimiento') || a.id.includes('reactivar')
    );
    if (accionReactivar) return accionReactivar;
  }
  
  // Retornar primera acción como principal
  return etapa.acciones[0] || null;
}
