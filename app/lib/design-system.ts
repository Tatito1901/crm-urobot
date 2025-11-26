/**
 * ============================================================
 * DESIGN SYSTEM - CRM UROBOT
 * ============================================================
 * Sistema de diseño unificado sincronizado con globals.css
 * Fuente de la verdad: app/globals.css (Tailwind CSS Variables)
 */

import { cn } from "@/lib/utils";

// ==================== TYPOGRAPHY ====================
export const typography = {
  // Page titles
  pageTitle: 'text-xl sm:text-2xl lg:text-3xl font-bold text-foreground',
  pageSubtitle: 'text-sm sm:text-base text-muted-foreground',
  
  // Section titles
  sectionTitle: 'text-lg sm:text-xl font-semibold text-foreground',
  
  // Card titles
  cardTitle: 'text-base sm:text-lg font-semibold text-card-foreground',
  cardTitleSmall: 'text-sm font-semibold text-card-foreground',
  cardDescription: 'text-xs sm:text-sm text-muted-foreground',
  
  // Body text
  body: 'text-sm sm:text-base text-foreground',
  bodySecondary: 'text-sm text-muted-foreground',
  
  // Labels
  label: 'text-xs text-muted-foreground uppercase tracking-wider',
  labelSmall: 'text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide',
  
  // Metadata
  metadata: 'text-xs text-muted-foreground/80',
  metadataSmall: 'text-[10px] sm:text-xs text-muted-foreground/80',
  
  // Numbers/Metrics
  metricLarge: 'text-2xl sm:text-3xl font-bold text-foreground',
  metricMedium: 'text-xl sm:text-2xl font-bold text-foreground',
  metricSmall: 'text-lg font-bold text-foreground',
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
// NOTA: Preferir usar componentes <Button /> de shadcn/ui
export const buttons = {
  base: 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
  
  sizeLarge: 'px-5 py-3.5 sm:px-6 sm:py-3 text-base min-h-[48px] sm:min-h-0',
  sizeMedium: 'px-4 py-3 sm:px-5 sm:py-2.5 text-sm min-h-[44px] sm:min-h-0',
  sizeSmall: 'px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm',
  
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 sm:hover:scale-105 shadow-sm',
  secondary: 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 active:scale-95 shadow-sm',
  ghost: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-95',
  danger: 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 active:scale-95',
  
  rounded: 'rounded-xl',
  roundedSmall: 'rounded-lg',
  roundedFull: 'rounded-full',
};

// ==================== BADGES/CHIPS ====================
// NOTA: Preferir usar componente <Badge />
export const badges = {
  base: 'inline-flex items-center justify-center font-medium rounded-md border',
  
  sizeSmall: 'px-2 py-0.5 text-[10px] sm:text-xs',
  sizeMedium: 'px-2 py-1 text-xs',
  sizeLarge: 'px-3 py-1.5 text-xs sm:text-sm',
  
  // Mapeado a colores semánticos o hardcodeados específicos si se requiere mantener colores de estado
  success: 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/30',
  warning: 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/30',
  error: 'text-destructive dark:text-red-400 bg-red-100 dark:bg-red-950/30 border-red-200 dark:border-red-900/30',
  info: 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/30',
  neutral: 'text-muted-foreground bg-muted border-border',
  primary: 'text-primary bg-primary/10 border-primary/20',
};

// ==================== CARDS ====================
export const cards = {
  // Base
  base: 'bg-card text-card-foreground border border-border rounded-xl shadow-sm',
  baseHover: 'bg-card text-card-foreground border border-border rounded-xl hover:border-ring/50 hover:bg-accent/50 transition-all duration-200 shadow-sm',
  
  // Gradient variants
  gradient: 'bg-gradient-to-br from-card to-muted/50 border border-border rounded-xl shadow-sm',
  gradientHover: 'bg-gradient-to-br from-card to-muted/50 border border-border rounded-xl hover:border-ring/50 hover:shadow-md transition-all duration-300',
  
  // Interactive
  interactive: 'bg-card text-card-foreground border border-border rounded-xl cursor-pointer hover:border-ring/50 hover:bg-accent/50 active:scale-[0.98] transition-all duration-200 shadow-sm',
  
  // Mobile card
  mobileCard: 'bg-card text-card-foreground border border-border rounded-xl p-4 min-h-[80px] flex flex-col justify-center active:scale-[0.98] transition-all duration-200 shadow-sm',
};

// ==================== INPUTS ====================
export const inputs = {
  base: 'w-full rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-all',
  
  sizeSmall: 'px-3 py-2 text-xs',
  sizeMedium: 'px-3 py-2 sm:px-4 sm:py-2.5 text-sm',
  sizeLarge: 'px-4 py-3 text-base',
  
  search: 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40',
};

// ==================== TABLES ====================
export const tables = {
  wrapper: 'w-full overflow-x-auto rounded-xl border border-border bg-card hidden md:block shadow-sm',
  table: 'min-w-full divide-y divide-border text-left text-sm text-foreground',
  thead: 'bg-muted text-xs uppercase tracking-[0.2em] text-muted-foreground',
  th: 'px-3 py-3',
  td: 'px-3 py-3 align-top',
  tr: 'border-b border-border hover:bg-muted/50 transition-colors',
  
  mobileWrapper: 'space-y-3 md:hidden',
};

// ==================== FILTERS ====================
export const filters = {
  card: 'bg-card border border-border rounded-xl p-3 sm:p-4 shadow-sm',
  label: 'text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2',
  select: 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40',
};

// ==================== LAYOUTS ====================
export const layouts = {
  page: 'relative min-h-screen bg-background text-foreground',
  pageContent: 'relative mx-auto flex max-w-7xl flex-col gap-5 px-4 pb-24 pt-6 sm:gap-6 sm:px-6 sm:pb-8 sm:pt-8 md:gap-8 md:pt-10 lg:pb-16',
  
  gridCols2: 'grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4',
  gridCols3: 'grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3',
  gridCols4: 'grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4',
  gridCols5: 'grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5',
};

// ==================== UTILITIES ====================
export const utils = {
  skeleton: 'animate-pulse bg-muted rounded',
  
  emptyState: 'flex flex-col items-center justify-center py-12 text-center space-y-3',
  emptyIcon: 'text-4xl sm:text-5xl text-muted-foreground/50',
  emptyText: 'text-sm sm:text-base text-muted-foreground',
  
  divider: 'border-t border-border',
  dividerVertical: 'border-l border-border',
  
  scroll: 'overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border',
};

// Re-exportar cn para conveniencia
export { cn };
