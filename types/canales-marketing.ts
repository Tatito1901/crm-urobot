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
export interface CanalStyle {
  bg: string;
  text: string;
  border: string;
  icon: string;
  /** Short brand label for the chip (e.g. "WA", "Meta", "G") */
  abbr: string;
  /** Pre-composed chip className: bg + text + border */
  chip: string;
}

export const CANAL_COLORS: Record<CanalMarketing, CanalStyle> = {
  'Meta Ads': {
    bg: 'bg-[#1877f2]/12',
    text: 'text-[#5b9bf5]',
    border: 'border-[#1877f2]/25',
    icon: 'f',
    abbr: 'Meta',
    chip: 'bg-[#1877f2]/12 text-[#5b9bf5] border border-[#1877f2]/25',
  },
  'Google Ads': {
    bg: 'bg-[#ea4335]/12',
    text: 'text-[#f28b83]',
    border: 'border-[#ea4335]/25',
    icon: 'G',
    abbr: 'Google',
    chip: 'bg-[#ea4335]/12 text-[#f28b83] border border-[#ea4335]/25',
  },
  'Instagram': {
    bg: 'bg-[#e1306c]/12',
    text: 'text-[#f472b6]',
    border: 'border-[#e1306c]/25',
    icon: 'IG',
    abbr: 'Instagram',
    chip: 'bg-[#e1306c]/12 text-[#f472b6] border border-[#e1306c]/25',
  },
  'Orgánico': {
    bg: 'bg-emerald-500/12',
    text: 'text-emerald-400',
    border: 'border-emerald-500/25',
    icon: '○',
    abbr: 'Orgánico',
    chip: 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/25',
  },
  'Referido': {
    bg: 'bg-violet-500/12',
    text: 'text-violet-400',
    border: 'border-violet-500/25',
    icon: '⇄',
    abbr: 'Referido',
    chip: 'bg-violet-500/12 text-violet-400 border border-violet-500/25',
  },
  'WhatsApp Directo': {
    bg: 'bg-[#25d366]/12',
    text: 'text-[#25d366]',
    border: 'border-[#25d366]/25',
    icon: 'WA',
    abbr: 'WhatsApp',
    chip: 'bg-[#25d366]/12 text-[#25d366] border border-[#25d366]/25',
  },
  'Doctoralia': {
    bg: 'bg-teal-500/12',
    text: 'text-teal-400',
    border: 'border-teal-500/25',
    icon: '+',
    abbr: 'Doctoralia',
    chip: 'bg-teal-500/12 text-teal-400 border border-teal-500/25',
  },
  'Sitio Web': {
    bg: 'bg-cyan-500/12',
    text: 'text-cyan-400',
    border: 'border-cyan-500/25',
    icon: '◎',
    abbr: 'Web',
    chip: 'bg-cyan-500/12 text-cyan-400 border border-cyan-500/25',
  },
  'Otro': {
    bg: 'bg-slate-500/12',
    text: 'text-slate-400',
    border: 'border-slate-500/25',
    icon: '•',
    abbr: 'Otro',
    chip: 'bg-slate-500/12 text-slate-400 border border-slate-500/25',
  },
};

/**
 * Valida si un string es un canal de marketing válido
 */
function isCanalMarketing(value: unknown): value is CanalMarketing {
  return typeof value === 'string' && (CANALES_MARKETING as readonly string[]).includes(value);
}

/**
 * Obtiene el canal por defecto si no existe
 */
const DEFAULT_CANAL: CanalMarketing = 'Otro';

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
