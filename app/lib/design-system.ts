/**
 * ============================================================
 * DESIGN SYSTEM - CRM UROBOT
 * ============================================================
 * Sistema de diseño unificado para consistencia en toda la plataforma
 */

// ==================== TYPOGRAPHY ====================
export const typography = {
  // Page titles
  pageTitle: 'text-xl sm:text-2xl lg:text-3xl font-bold text-white',
  pageSubtitle: 'text-sm sm:text-base text-slate-300/80',
  
  // Section titles
  sectionTitle: 'text-lg sm:text-xl font-semibold text-white',
  
  // Card titles
  cardTitle: 'text-base sm:text-lg font-semibold text-white',
  cardTitleSmall: 'text-sm font-semibold text-white',
  cardDescription: 'text-xs sm:text-sm text-white/60',
  
  // Body text
  body: 'text-sm sm:text-base text-white',
  bodySecondary: 'text-sm text-white/70',
  
  // Labels
  label: 'text-xs text-white/60 uppercase tracking-wider',
  labelSmall: 'text-[10px] sm:text-xs text-white/60 uppercase tracking-wide',
  
  // Metadata
  metadata: 'text-xs text-white/40',
  metadataSmall: 'text-[10px] sm:text-xs text-white/40',
  
  // Numbers/Metrics
  metricLarge: 'text-2xl sm:text-3xl font-bold text-white',
  metricMedium: 'text-xl sm:text-2xl font-bold text-white',
  metricSmall: 'text-lg font-bold text-white',
};

// ==================== SPACING ====================
export const spacing = {
  // Padding
  cardPadding: 'p-4 sm:p-5 lg:p-6',
  cardPaddingSmall: 'p-3 sm:p-4',
  cardPaddingLarge: 'p-5 sm:p-6 lg:p-8',
  
  cardHeader: 'pb-3 sm:pb-4',
  cardContent: 'pt-0',
  
  containerPadding: 'px-4 sm:px-6 lg:px-8',
  containerPaddingY: 'py-6 sm:py-8 lg:py-10',
  
  // Gaps
  gapXs: 'gap-2',
  gapSm: 'gap-3 sm:gap-4',
  gapBase: 'gap-4 sm:gap-5',
  gapLg: 'gap-5 sm:gap-6',
  gapXl: 'gap-6 sm:gap-8',
  
  // Spacing between elements
  spaceXs: 'space-y-2',
  spaceSm: 'space-y-3 sm:space-y-4',
  spaceBase: 'space-y-4 sm:space-y-5',
  spaceLg: 'space-y-5 sm:space-y-6',
  spaceXl: 'space-y-6 sm:space-y-8',
};

// ==================== BUTTONS ====================
export const buttons = {
  // Base styles
  base: 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
  
  // Sizes
  sizeLarge: 'px-5 py-3.5 sm:px-6 sm:py-3 text-base min-h-[48px] sm:min-h-0',
  sizeMedium: 'px-4 py-3 sm:px-5 sm:py-2.5 text-sm min-h-[44px] sm:min-h-0',
  sizeSmall: 'px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm',
  
  // Variants
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 active:scale-95 sm:hover:scale-105',
  secondary: 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-95',
  ghost: 'text-white hover:bg-white/5 active:bg-white/10 active:scale-95',
  danger: 'bg-red-600/20 text-red-300 border border-red-500/20 hover:bg-red-600/30 active:scale-95',
  
  // Rounded
  rounded: 'rounded-xl',
  roundedSmall: 'rounded-lg',
  roundedFull: 'rounded-full',
};

// ==================== BADGES/CHIPS ====================
export const badges = {
  // Base
  base: 'inline-flex items-center justify-center font-medium rounded-md border',
  
  // Sizes
  sizeSmall: 'px-2 py-0.5 text-[10px] sm:text-xs',
  sizeMedium: 'px-2 py-1 text-xs',
  sizeLarge: 'px-3 py-1.5 text-xs sm:text-sm',
  
  // Variants (status colors)
  success: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  warning: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  error: 'text-red-400 bg-red-400/10 border-red-400/20',
  info: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  neutral: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  primary: 'text-blue-300 bg-blue-500/15 border-blue-400/20',
};

// ==================== CARDS ====================
export const cards = {
  // Base
  base: 'bg-white/[0.03] border border-white/10 rounded-xl transition-colors',
  baseHover: 'bg-white/[0.03] border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.05] transition-all duration-200',
  
  // Gradient variants
  gradient: 'bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl',
  gradientHover: 'bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300',
  
  // Interactive (clickable)
  interactive: 'bg-white/[0.03] border border-white/10 rounded-xl cursor-pointer hover:border-white/20 hover:bg-white/[0.05] active:scale-[0.98] transition-all duration-200',
  
  // Mobile card
  mobileCard: 'bg-gradient-to-r from-white/[0.03] to-transparent border border-white/10 rounded-xl p-4 min-h-[80px] flex flex-col justify-center active:scale-[0.98] transition-all duration-200',
};

// ==================== INPUTS ====================
export const inputs = {
  // Base
  base: 'w-full rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-300/40 focus:border-blue-300/40 transition-all',
  
  // Sizes
  sizeSmall: 'px-3 py-2 text-xs',
  sizeMedium: 'px-3 py-2 sm:px-4 sm:py-2.5 text-sm',
  sizeLarge: 'px-4 py-3 text-base',
  
  // Search variant
  search: 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-300/40',
};

// ==================== TABLES ====================
export const tables = {
  // Desktop table
  wrapper: 'w-full overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02] hidden md:block',
  table: 'min-w-full divide-y divide-white/10 text-left text-sm text-white/80',
  thead: 'bg-white/5 text-xs uppercase tracking-[0.2em] text-white/40',
  th: 'px-3 py-3',
  td: 'px-3 py-3 align-top',
  tr: 'border-b border-white/10 hover:bg-white/[0.02] transition-colors',
  
  // Mobile cards
  mobileWrapper: 'space-y-3 md:hidden',
};

// ==================== FILTERS ====================
export const filters = {
  // Filter card
  card: 'bg-white/[0.03] border border-white/10 rounded-xl p-3 sm:p-4',
  
  // Filter label
  label: 'text-xs uppercase tracking-[0.3em] text-white/60 mb-2',
  
  // Filter select
  select: 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-300/40',
};

// ==================== LAYOUTS ====================
export const layouts = {
  // Page container
  page: 'relative min-h-screen bg-urobot text-white',
  pageContent: 'relative mx-auto flex max-w-7xl flex-col gap-5 px-4 pb-24 pt-6 sm:gap-6 sm:px-6 sm:pb-8 sm:pt-8 md:gap-8 md:pt-10 lg:pb-16',
  
  // Grid layouts
  gridCols2: 'grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4',
  gridCols3: 'grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3',
  gridCols4: 'grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4',
  gridCols5: 'grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5',
};

// ==================== UTILITIES ====================
export const utils = {
  // Loading states
  skeleton: 'animate-pulse bg-white/10 rounded',
  
  // Empty states
  emptyState: 'flex flex-col items-center justify-center py-12 text-center space-y-3',
  emptyIcon: 'text-4xl sm:text-5xl',
  emptyText: 'text-sm sm:text-base text-slate-400',
  
  // Dividers
  divider: 'border-t border-white/10',
  dividerVertical: 'border-l border-white/10',
  
  // Scroll
  scroll: 'overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10',
};

// ==================== HELPER FUNCTION ====================
/**
 * Combina clases de manera segura
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
