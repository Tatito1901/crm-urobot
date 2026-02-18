/**
 * ============================================================
 * GLOSARIO MÉDICO - Explicaciones simples para personal médico
 * ============================================================
 * Traduce términos técnicos de CRM/marketing a lenguaje médico
 */

export const GLOSARIO = {
  // Página principal
  leads: {
    titulo: 'Pacientes Potenciales',
    descripcion: 'Personas que han mostrado interés en los servicios pero aún no tienen una consulta agendada.',
    ejemplos: 'Por ejemplo: alguien que preguntó por WhatsApp sobre un procedimiento.'
  },

  // Estados
  estados: {
    titulo: 'Etapa del Proceso',
    descripcion: 'En qué punto del proceso se encuentra cada persona interesada.',
    detalle: {
      'nuevo': 'Acaba de contactarnos por primera vez',
      'interactuando': 'El bot está chateando activamente con esta persona',
      'contactado': 'Ya iniciamos conversación humana con esta persona',
      'cita_propuesta': 'Se le ofreció fecha de cita, esperando confirmación',
      'en_seguimiento': 'Requiere seguimiento humano adicional',
      'cita_agendada': 'Tiene cita confirmada en calendario',
      'show': 'Asistió a su cita',
      'convertido': 'Ya es paciente registrado',
      'no_show': 'No asistió a su cita agendada',
      'perdido': 'Sin respuesta prolongada',
      'no_interesado': 'Decidió no continuar',
      'descartado': 'Spam o número equivocado'
    }
  },

  // Columnas de la tabla
  origen: {
    titulo: 'Origen',
    descripcion: 'Cómo llegó esta persona a nosotros',
    ejemplos: 'Facebook Ads: vio un anuncio en Facebook\nOrgánico: nos encontró por búsqueda en Google\nReferido: lo recomendó otro paciente'
  },

  ultimoMensaje: {
    titulo: 'Último Mensaje',
    descripcion: 'Cuándo fue la última vez que esta persona nos escribió o le escribimos',
    importante: '⚠️ Si han pasado más de 7 días, aparecerá como "Inactivo" - puede necesitar seguimiento'
  },

  conversion: {
    titulo: 'Conversión',
    descripcion: 'Si esta persona ya se convirtió en paciente',
    detalle: 'Cuando dice "Ver perfil →" significa que ya agendó consulta y puedes ver su historial médico completo'
  },

  // Indicadores visuales
  caliente: {
    icono: '🔥',
    titulo: 'Alta Prioridad',
    descripcion: 'Esta persona ha tenido mucha interacción reciente (5+ mensajes en 2 días)',
    accion: '💡 Recomendación: Dar seguimiento prioritario para agendar consulta'
  },

  inactivo: {
    titulo: 'Inactivo',
    descripcion: 'No ha habido comunicación en los últimos 7 días',
    accion: '💡 Recomendación: Considerar enviar mensaje de seguimiento'
  },

  // Filtros
  filtros: {
    titulo: 'Filtros',
    descripcion: 'Usa estos botones para ver solo ciertos grupos de personas',
    ejemplos: {
      'Todos': 'Ver todas las personas interesadas',
      'Nuevos': 'Solo los que acaban de contactarnos',
      'Seguimiento': 'Los que están en proceso de conversación',
      'Convertidos': 'Los que ya agendaron consulta',
      'Descartados': 'Los que no continuaron'
    }
  },

  // Estadísticas
  estadisticas: {
    total: 'Total de personas que han mostrado interés',
    convertidos: 'Cuántos ya agendaron su primera consulta',
    enProceso: 'Personas con las que estamos en conversación activa',
    conConsultas: 'Cuántos ya son pacientes con consultas registradas',
    altaPrioridad: 'Personas muy interesadas que necesitan atención inmediata'
  },

  // Canales de origen
  canales: {
    'Facebook Ads': 'Vio anuncio pagado en Facebook',
    'Google Ads': 'Encontró anuncio en búsqueda de Google',
    'Instagram Ads': 'Vio anuncio pagado en Instagram',
    'Orgánico': 'Encontró el consultorio de forma natural (búsqueda, recomendación)',
    'Referido': 'Recomendado por otro paciente o contacto',
    'WhatsApp Directo': 'Contactó directamente por WhatsApp',
    'Otro': 'Otro medio de contacto'
  }
};

/**
 * Función helper para obtener explicación amigable
 */
export function obtenerExplicacion(clave: keyof typeof GLOSARIO): string {
  const item = GLOSARIO[clave];
  if (!item || typeof item !== 'object' || !('descripcion' in item)) {
    return '';
  }
  return item.descripcion;
}
