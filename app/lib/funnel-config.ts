/**
 * ============================================================
 * CONFIGURACIÓN DEL EMBUDO DE VENTAS
 * ============================================================
 * Sistema unificado de etapas, acciones y plantillas de mensaje
 * para seguimiento de leads en el consultorio médico.
 * 
 * Sincronizado con catalog_estados_lead (BD)
 * 
 * EMBUDO DE CONVERSIÓN:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  1. NUEVO            → Primer contacto, sin respuesta aún   │
 * │  2. INTERACTUANDO    → Bot chateando con el lead            │
 * │  3. CONTACTADO       → Humano ha intervenido                │
 * │  4. CITA_PROPUESTA   → Se ofreció fecha de cita             │
 * │  5. CITA_AGENDADA    → Cita confirmada en calendario        │
 * │  6. SHOW             → Asistió a la cita                    │
 * │  7. CONVERTIDO       → Paciente registrado (terminal)       │
 * │  ─────────────────────────────────────────────────────────  │
 * │  ↻ EN_SEGUIMIENTO    → Requiere follow-up humano            │
 * │  ✖ NO_SHOW           → No asistió (reagendable)             │
 * │  ✖ PERDIDO           → Sin respuesta prolongada             │
 * │  ✖ NO_INTERESADO     → Decidió no continuar                 │
 * │  ✖ DESCARTADO        → Spam/irrelevante                     │
 * └─────────────────────────────────────────────────────────────┘
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
    etapasAplica: ['nuevo'],
    descripcion: 'Primer mensaje de bienvenida para leads nuevos'
  },
  {
    id: 'respuesta-rapida',
    nombre: '⚡ Respuesta rápida',
    mensaje: `¡Hola! Recibimos tu mensaje.

Un momento, en breve te atendemos personalmente. ¿Podrías compartirnos tu nombre completo?`,
    etapasAplica: ['nuevo', 'interactuando'],
    descripcion: 'Respuesta inmediata mientras se prepara respuesta completa'
  },

  // === ETAPA: CONTACTADO / EN_SEGUIMIENTO ===
  {
    id: 'info-servicios',
    nombre: '📋 Información de servicios',
    mensaje: `¡Perfecto, [NOMBRE]!

Contamos con los siguientes servicios:
• Consulta general de urología
• Estudios diagnósticos
• Procedimientos especializados

¿Hay algún tema específico que te interese conocer más?`,
    etapasAplica: ['contactado', 'en_seguimiento'],
    descripcion: 'Presentar servicios disponibles'
  },
  {
    id: 'seguimiento-sin-respuesta',
    nombre: '🔔 Seguimiento sin respuesta',
    mensaje: `¡Hola [NOMBRE]! 

Hace unos días nos contactaste y queremos saber si aún podemos ayudarte.

¿Tienes alguna duda sobre nuestros servicios? Estamos para atenderte.`,
    etapasAplica: ['contactado', 'en_seguimiento', 'cita_propuesta'],
    descripcion: 'Reactivar conversación con lead que no ha respondido'
  },

  // === ETAPA: CITA_PROPUESTA ===
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
    etapasAplica: ['contactado', 'cita_propuesta'],
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
    etapasAplica: ['cita_propuesta', 'en_seguimiento'],
    descripcion: 'Confirmar interés y solicitar preferencia de horario'
  },

  // === ETAPA: CITA_AGENDADA ===
  {
    id: 'agendar-cita',
    nombre: '📅 Confirmar cita',
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
    etapasAplica: ['cita_agendada'],
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
    etapasAplica: ['cita_agendada', 'show'],
    descripcion: 'Instrucciones de preparación pre-consulta'
  },

  // === ETAPA: NO_SHOW ===
  {
    id: 'reagendar-no-show',
    nombre: '📅 Reagendar (no asistió)',
    mensaje: `¡Hola [NOMBRE]!

Notamos que no pudiste asistir a tu cita. ¡No te preocupes!

¿Te gustaría reagendar? Tenemos disponibilidad esta semana.

Quedamos atentos a tu respuesta.`,
    etapasAplica: ['no_show'],
    descripcion: 'Mensaje para reagendar cuando el paciente no asistió'
  },

  // === REACTIVACIÓN ===
  {
    id: 'reactivar-lead',
    nombre: '🔄 Reactivar lead inactivo',
    mensaje: `¡Hola [NOMBRE]!

Hace tiempo nos contactaste y queremos saber cómo estás.

Si aún necesitas atención urológica, seguimos disponibles para ayudarte. Actualmente tenemos disponibilidad para esta semana.

¿Te gustaría retomar la conversación?`,
    etapasAplica: ['en_seguimiento', 'perdido', 'no_interesado'],
    descripcion: 'Mensaje para reactivar leads inactivos o perdidos'
  },

  // === CIERRE ===
  {
    id: 'agradecer-no-interes',
    nombre: '🙏 Agradecimiento (no interesado)',
    mensaje: `¡Gracias por tu tiempo, [NOMBRE]!

Si en el futuro necesitas atención urológica, no dudes en contactarnos.

¡Te deseamos lo mejor!`,
    etapasAplica: ['no_interesado', 'descartado', 'perdido'],
    descripcion: 'Cierre amable cuando el lead no está interesado'
  },
];

// ============================================================
// CONFIGURACIÓN DE ETAPAS DEL FUNNEL
// ============================================================

export const ETAPAS_FUNNEL: EtapaFunnel[] = [
  // === PIPELINE PRINCIPAL ===
  {
    estado: 'nuevo',
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
        siguienteEtapa: 'interactuando',
        plantillaSugerida: 'saludo-inicial',
        color: 'blue'
      },
      {
        id: 'marcar-spam',
        label: 'Marcar spam',
        icon: '🚫',
        descripcion: 'No es un lead real',
        siguienteEtapa: 'descartado',
        color: 'red'
      }
    ],
    color: 'blue',
    icon: '🆕'
  },
  {
    estado: 'interactuando',
    nombre: 'Interactuando',
    descripcion: 'El bot está chateando activamente con el lead',
    objetivo: 'Identificar necesidad y escalar a humano si requiere',
    tiempoIdeal: 'Automático',
    indicadores: [
      'Mensajes intercambiados',
      'Problema detectado'
    ],
    acciones: [
      {
        id: 'respuesta-rapida',
        label: 'Respuesta rápida',
        icon: '⚡',
        descripcion: 'Enviar respuesta inmediata',
        plantillaSugerida: 'respuesta-rapida',
        color: 'blue'
      },
      {
        id: 'marcar-contactado',
        label: 'Tomar control',
        icon: '👤',
        descripcion: 'Intervención humana directa',
        siguienteEtapa: 'contactado',
        color: 'cyan'
      },
      {
        id: 'marcar-perdido',
        label: 'Sin respuesta',
        icon: '✖',
        descripcion: 'No respondió al bot',
        siguienteEtapa: 'perdido',
        color: 'gray'
      }
    ],
    color: 'sky',
    icon: '🤖'
  },
  {
    estado: 'contactado',
    nombre: 'Contactado',
    descripcion: 'Humano ha intervenido en la conversación',
    objetivo: 'Identificar necesidades y ofrecer cita',
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
        id: 'proponer-cita',
        label: 'Proponer cita',
        icon: '📅',
        descripcion: 'Ofrecer fecha de consulta',
        siguienteEtapa: 'cita_propuesta',
        plantillaSugerida: 'enviar-costos',
        color: 'purple'
      },
      {
        id: 'marcar-no-interesado',
        label: 'No interesado',
        icon: '✖',
        descripcion: 'Decidió no continuar',
        siguienteEtapa: 'no_interesado',
        color: 'gray'
      }
    ],
    color: 'amber',
    icon: '💬'
  },
  {
    estado: 'cita_propuesta',
    nombre: 'Cita Propuesta',
    descripcion: 'Se ofreció fecha/hora de cita, esperando confirmación',
    objetivo: 'Lograr que confirme la cita',
    tiempoIdeal: '< 24 horas',
    indicadores: [
      'Tiempo de respuesta',
      'Tasa de confirmación'
    ],
    acciones: [
      {
        id: 'confirmar-cita',
        label: 'Cita confirmada',
        icon: '✅',
        descripcion: 'El paciente aceptó la fecha',
        siguienteEtapa: 'cita_agendada',
        color: 'emerald'
      },
      {
        id: 'seguimiento-propuesta',
        label: 'Dar seguimiento',
        icon: '🔔',
        descripcion: 'No ha confirmado aún',
        plantillaSugerida: 'seguimiento-sin-respuesta',
        color: 'amber'
      },
      {
        id: 'ofrecer-otra-fecha',
        label: 'Otra fecha',
        icon: '📅',
        descripcion: 'Proponer fecha alternativa',
        plantillaSugerida: 'confirmar-interes',
        color: 'blue'
      }
    ],
    color: 'purple',
    icon: '📋'
  },
  {
    estado: 'en_seguimiento',
    nombre: 'En Seguimiento',
    descripcion: 'Requiere follow-up humano (no respondió, necesita más info)',
    objetivo: 'Reengancharlo y avanzar hacia cita',
    tiempoIdeal: '3-5 días',
    indicadores: [
      'Intentos de seguimiento',
      'Tasa de reactivación'
    ],
    acciones: [
      {
        id: 'enviar-seguimiento',
        label: 'Dar seguimiento',
        icon: '�',
        descripcion: 'Enviar mensaje de seguimiento',
        plantillaSugerida: 'seguimiento-sin-respuesta',
        color: 'amber'
      },
      {
        id: 'proponer-cita-seguimiento',
        label: 'Proponer cita',
        icon: '📅',
        descripcion: 'Ofrecer agendar cita',
        siguienteEtapa: 'cita_propuesta',
        plantillaSugerida: 'confirmar-interes',
        color: 'purple'
      },
      {
        id: 'marcar-perdido-seguimiento',
        label: 'Marcar perdido',
        icon: '✖',
        descripcion: 'Demasiados intentos sin respuesta',
        siguienteEtapa: 'perdido',
        color: 'gray'
      }
    ],
    color: 'orange',
    icon: '🔄'
  },
  {
    estado: 'cita_agendada',
    nombre: 'Cita Agendada',
    descripcion: 'Cita confirmada en calendario, esperando el día',
    objetivo: 'Asegurar asistencia (recordatorios)',
    tiempoIdeal: 'Hasta día de cita',
    indicadores: [
      'Recordatorio enviado',
      'Confirmación de asistencia'
    ],
    acciones: [
      {
        id: 'enviar-preparacion',
        label: 'Enviar preparación',
        icon: '📝',
        descripcion: 'Instrucciones pre-consulta',
        plantillaSugerida: 'preparacion-cita',
        color: 'blue'
      },
      {
        id: 'confirmar-cita-agendada',
        label: 'Confirmar cita',
        icon: '📅',
        descripcion: 'Enviar confirmación de cita',
        plantillaSugerida: 'agendar-cita',
        color: 'emerald'
      },
      {
        id: 'marcar-show',
        label: 'Asistió',
        icon: '✅',
        descripcion: 'El paciente asistió a la cita',
        siguienteEtapa: 'show',
        color: 'emerald'
      },
      {
        id: 'marcar-no-show',
        label: 'No asistió',
        icon: '❌',
        descripcion: 'El paciente no se presentó',
        siguienteEtapa: 'no_show',
        color: 'red'
      }
    ],
    color: 'emerald',
    icon: '📅'
  },
  // === POST-CITA ===
  {
    estado: 'show',
    nombre: 'Asistió',
    descripcion: 'El paciente asistió a su cita',
    objetivo: 'Convertir a paciente registrado',
    tiempoIdeal: 'Inmediato',
    indicadores: [
      'Registro como paciente',
      'Próxima cita agendada'
    ],
    acciones: [
      {
        id: 'convertir-paciente',
        label: 'Convertir a paciente',
        icon: '🏆',
        descripcion: 'Registrar como paciente formal',
        siguienteEtapa: 'convertido',
        color: 'emerald'
      },
      {
        id: 'agendar-seguimiento',
        label: 'Agendar seguimiento',
        icon: '📅',
        descripcion: 'Programar siguiente consulta',
        color: 'blue'
      }
    ],
    color: 'teal',
    icon: '✅'
  },
  {
    estado: 'convertido',
    nombre: 'Paciente',
    descripcion: '¡Éxito! Este lead ya es paciente registrado',
    objetivo: 'Asegurar satisfacción y retención',
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
  // === ESTADOS NEGATIVOS ===
  {
    estado: 'no_show',
    nombre: 'No Asistió',
    descripcion: 'Tenía cita agendada pero no se presentó',
    objetivo: 'Reagendar si es posible',
    tiempoIdeal: '1-2 días',
    indicadores: [
      'Motivo de inasistencia',
      'Intención de reagendar'
    ],
    acciones: [
      {
        id: 'reagendar',
        label: 'Reagendar cita',
        icon: '📅',
        descripcion: 'Proponer nueva fecha',
        siguienteEtapa: 'cita_agendada',
        plantillaSugerida: 'reagendar-no-show',
        color: 'amber'
      },
      {
        id: 'marcar-perdido-noshow',
        label: 'Marcar perdido',
        icon: '✖',
        descripcion: 'No quiere reagendar',
        siguienteEtapa: 'perdido',
        color: 'gray'
      }
    ],
    color: 'red',
    icon: '❌'
  },
  {
    estado: 'perdido',
    nombre: 'Perdido',
    descripcion: 'Sin respuesta prolongada o abandonó el proceso',
    objetivo: 'Intentar reactivar o archivar',
    tiempoIdeal: 'N/A',
    indicadores: [
      'Motivo de pérdida',
      'Intentos de reactivación'
    ],
    acciones: [
      {
        id: 'reactivar-perdido',
        label: 'Intentar reactivar',
        icon: '🔄',
        descripcion: 'Último intento de reactivación',
        plantillaSugerida: 'reactivar-lead',
        siguienteEtapa: 'contactado',
        color: 'amber'
      },
      {
        id: 'cerrar-perdido',
        label: 'Cerrar definitivamente',
        icon: '🙏',
        descripcion: 'Enviar despedida y archivar',
        plantillaSugerida: 'agradecer-no-interes',
        color: 'gray'
      }
    ],
    color: 'slate',
    icon: '💤'
  },
  {
    estado: 'no_interesado',
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
        siguienteEtapa: 'contactado',
        color: 'amber'
      },
      {
        id: 'cerrar-amable',
        label: 'Cerrar amablemente',
        icon: '🙏',
        descripcion: 'Enviar despedida',
        plantillaSugerida: 'agradecer-no-interes',
        color: 'gray'
      }
    ],
    color: 'gray',
    icon: '✖'
  },
  {
    estado: 'descartado',
    nombre: 'Descartado',
    descripcion: 'Spam, número equivocado o irrelevante',
    objetivo: 'Archivar',
    tiempoIdeal: 'N/A',
    indicadores: [
      'Motivo de descarte'
    ],
    acciones: [],
    color: 'red',
    icon: '�'
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
