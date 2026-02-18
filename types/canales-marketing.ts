/**
 * ============================================================
 * CANALES DE MARKETING - Orígenes de Leads
 * ============================================================
 * Fuente de verdad: leads_fuente_check en BD
 * DB values: whatsapp, whatsapp_directo, meta_ads, instagram,
 *            google_ads, referido, sitio_web, doctoralia, otro
 * Última sync: 2026-02-18
 */

export const CANALES_MARKETING = [
  'Meta Ads',
  'Google Ads',
  'Instagram',
  'Orgánico',
  'Referido',
  'WhatsApp Directo',
  'Doctoralia',
  'Sitio Web',
  'Otro'
] as const;

export type CanalMarketing = typeof CANALES_MARKETING[number];

/**
 * Colores para cada canal (para badges y visualización)
 */
export const CANAL_COLORS: Record<CanalMarketing, { bg: string; text: string; border: string; icon: string }> = {
  'Meta Ads': {
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
  'Instagram': {
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
  'Doctoralia': {
    bg: 'bg-teal-50 dark:bg-teal-500/10',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-500/30',
    icon: '🏥'
  },
  'Sitio Web': {
    bg: 'bg-cyan-50 dark:bg-cyan-500/10',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-500/30',
    icon: '🌐'
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
    // Meta Ads (BD: meta_ads) — covers Facebook & Instagram paid
    'facebook': 'Meta Ads',
    'facebook ads': 'Meta Ads',
    'fb': 'Meta Ads',
    'fb ads': 'Meta Ads',
    'meta': 'Meta Ads',
    'meta ads': 'Meta Ads',
    'meta_ads': 'Meta Ads',
    
    // Google (BD: google_ads)
    'google': 'Google Ads',
    'google ads': 'Google Ads',
    'google_ads': 'Google Ads',
    'adwords': 'Google Ads',
    'sem': 'Google Ads',
    'click to chat link': 'Google Ads',
    'click_to_chat_link': 'Google Ads',
    'click to chat': 'Google Ads',
    'click_to_chat': 'Google Ads',
    'ctc': 'Google Ads',
    
    // Instagram (BD: instagram)
    'instagram': 'Instagram',
    'instagram ads': 'Instagram',
    'ig': 'Instagram',
    'ig ads': 'Instagram',
    
    // Orgánico (BD: organico)
    'organico': 'Orgánico',
    'orgánico': 'Orgánico',
    'organic': 'Orgánico',
    'seo': 'Orgánico',
    
    // Referido (BD: referido)
    'referido': 'Referido',
    'referral': 'Referido',
    'referencia': 'Referido',
    'recomendacion': 'Referido',
    'recomendación': 'Referido',
    
    // WhatsApp (BD: whatsapp, whatsapp_directo)
    'whatsapp': 'WhatsApp Directo',
    'whatsapp directo': 'WhatsApp Directo',
    'whatsapp_directo': 'WhatsApp Directo',
    'wa': 'WhatsApp Directo',
    'wsp': 'WhatsApp Directo',
    'directo': 'WhatsApp Directo',
    
    // Doctoralia (BD: doctoralia)
    'doctoralia': 'Doctoralia',
    
    // Sitio Web (BD: sitio_web)
    'sitio_web': 'Sitio Web',
    'sitio web': 'Sitio Web',
    'landing': 'Sitio Web',
    'landing_page': 'Sitio Web',
    'landing page': 'Sitio Web',
    'website': 'Sitio Web',
    'web': 'Sitio Web',
    
    // Otro (BD: otro)
    'otro': 'Otro',
    'other': 'Otro',
    'desconocido': 'Otro',
    'unknown': 'Otro',
  };
  
  return mappings[normalized] || 'Otro';
}
