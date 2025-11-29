/**
 * ============================================================
 * CANALES DE MARKETING - Orígenes de Leads
 * ============================================================
 * Definición de canales consistente con la base de datos
 */

export const CANALES_MARKETING = [
  'Facebook Ads',
  'Google Ads',
  'Instagram Ads',
  'Orgánico',
  'Referido',
  'WhatsApp Directo',
  'Otro'
] as const;

export type CanalMarketing = typeof CANALES_MARKETING[number];

/**
 * Colores para cada canal (para badges y visualización)
 */
export const CANAL_COLORS: Record<CanalMarketing, { bg: string; text: string; border: string; icon: string }> = {
  'Facebook Ads': {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-500/30',
    icon: '📘'
  },
  'Google Ads': {
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-500/30',
    icon: '🔍'
  },
  'Instagram Ads': {
    bg: 'bg-pink-50 dark:bg-pink-500/10',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-200 dark:border-pink-500/30',
    icon: '📸'
  },
  'Orgánico': {
    bg: 'bg-green-50 dark:bg-green-500/10',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-500/30',
    icon: '🌱'
  },
  'Referido': {
    bg: 'bg-purple-50 dark:bg-purple-500/10',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-500/30',
    icon: '👥'
  },
  'WhatsApp Directo': {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-500/30',
    icon: '💬'
  },
  'Otro': {
    bg: 'bg-slate-50 dark:bg-slate-500/10',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-500/30',
    icon: '📌'
  }
};

/**
 * Valida si un string es un canal de marketing válido
 */
export function isCanalMarketing(value: unknown): value is CanalMarketing {
  return typeof value === 'string' && (CANALES_MARKETING as readonly string[]).includes(value);
}

/**
 * Obtiene el canal por defecto si no existe
 */
export const DEFAULT_CANAL: CanalMarketing = 'Otro';

/**
 * Normaliza valores de canal que pueden venir de n8n con diferentes formatos
 */
export function normalizeCanalMarketing(value: string | null | undefined): CanalMarketing {
  if (!value) return 'Otro';
  
  const normalized = value.toLowerCase().trim();
  
  // Mapeo de variantes comunes a valores estándar
  const mappings: Record<string, CanalMarketing> = {
    // Facebook
    'facebook': 'Facebook Ads',
    'facebook ads': 'Facebook Ads',
    'fb': 'Facebook Ads',
    'fb ads': 'Facebook Ads',
    'meta': 'Facebook Ads',
    'meta ads': 'Facebook Ads',
    
    // Google
    'google': 'Google Ads',
    'google ads': 'Google Ads',
    'adwords': 'Google Ads',
    'sem': 'Google Ads',
    
    // Instagram
    'instagram': 'Instagram Ads',
    'instagram ads': 'Instagram Ads',
    'ig': 'Instagram Ads',
    'ig ads': 'Instagram Ads',
    
    // Orgánico
    'organico': 'Orgánico',
    'orgánico': 'Orgánico',
    'organic': 'Orgánico',
    'seo': 'Orgánico',
    
    // Referido
    'referido': 'Referido',
    'referral': 'Referido',
    'referencia': 'Referido',
    'recomendacion': 'Referido',
    'recomendación': 'Referido',
    
    // WhatsApp
    'whatsapp': 'WhatsApp Directo',
    'whatsapp directo': 'WhatsApp Directo',
    'wa': 'WhatsApp Directo',
    'wsp': 'WhatsApp Directo',
    'directo': 'WhatsApp Directo',
    
    // Otro
    'otro': 'Otro',
    'other': 'Otro',
    'desconocido': 'Otro',
    'unknown': 'Otro',
  };
  
  return mappings[normalized] || 'Otro';
}
