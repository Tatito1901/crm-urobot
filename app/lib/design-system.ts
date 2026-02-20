/**
 * ============================================================
 * DESIGN SYSTEM - CRM UROBOT
 * ============================================================
 * FUENTE ÚNICA DE VERDAD para estilos de toda la plataforma.
 * 
 * REGLA: Nunca hardcodear colores hex, rgba, oklch en TSX.
 *        Siempre importar tokens desde aquí.
 * 
 * Componentes base: shadcn/ui (Card, Button, Badge, Table, etc.)
 */

import { cn } from "@/lib/utils";

// ==================== TYPOGRAPHY ====================
export const typography = {
  // Títulos de página
  pageTitle: 'text-xl sm:text-2xl font-bold text-foreground font-jakarta tracking-tight',
  pageSubtitle: 'text-sm text-muted-foreground',
  
  // Títulos de sección/card
  sectionTitle: 'text-base font-semibold text-foreground',
  cardTitle: 'text-sm font-semibold text-foreground',
  cardTitleWithIcon: 'text-sm font-semibold text-foreground flex items-center gap-2',
  cardDescription: 'text-xs sm:text-sm text-muted-foreground',
  cardDescriptionSmall: 'text-xs text-muted-foreground',
  
  // Body text
  body: 'text-sm text-foreground',
  bodySmall: 'text-xs text-foreground',
  
  // Labels y metadata
  label: 'text-xs text-muted-foreground uppercase tracking-wider font-medium',
  labelSmall: 'text-xs text-muted-foreground uppercase tracking-wider font-medium',
  labelBold: 'text-xs font-bold uppercase tracking-wider text-muted-foreground',
  metadata: 'text-xs text-muted-foreground',
  metadataSmall: 'text-xs text-muted-foreground',
  
  // Métricas y números
  metric: 'text-xl sm:text-2xl font-extrabold text-foreground tabular-nums font-jakarta tracking-tight',
  metricLarge: 'text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums font-jakarta tracking-tight',
  metricMedium: 'text-lg font-bold text-foreground tabular-nums font-jakarta tracking-tight',
  metricSmall: 'text-base font-semibold text-foreground tabular-nums font-jakarta',
  number: 'tabular-nums font-medium',
  
  // Tablas
  tableHeader: 'text-xs uppercase tracking-wider font-medium text-muted-foreground',
  tableCell: 'text-sm text-foreground',
  tableCellSmall: 'text-xs text-muted-foreground',
} as const;

// ==================== CHART COLORS ====================
// Paleta unificada para TODOS los gráficos (Recharts, DonutChart, BarChart, etc.)
export const chartColors = {
  // Colores semánticos para estados de datos
  blue: 'var(--chart-blue)',
  emerald: 'var(--chart-emerald)',
  purple: 'var(--chart-purple)',
  amber: 'var(--chart-amber)',
  rose: 'var(--chart-rose)',
  cyan: 'var(--chart-cyan)',
  indigo: 'var(--chart-indigo)',
  teal: 'var(--chart-teal)',
  orange: 'var(--chart-orange)',
  slate: 'var(--chart-slate)',
  
  // Secuencia ordenada para gráficos con N categorías
  sequence: [
    'var(--chart-blue)',
    'var(--chart-emerald)',
    'var(--chart-purple)',
    'var(--chart-amber)',
    'var(--chart-cyan)',
    'var(--chart-rose)',
    'var(--chart-indigo)',
    'var(--chart-teal)',
    'var(--chart-orange)',
    'var(--chart-slate)',
  ],

  // Mapa de estados de leads a colores
  leadState: {
    nuevo: 'var(--chart-blue)',
    contactado: 'var(--chart-purple)',
    interesado: 'var(--chart-indigo)',
    calificado: 'var(--chart-cyan)',
    escalado: 'var(--chart-amber)',
    cita_agendada: 'var(--chart-teal)',
    convertido: 'var(--chart-emerald)',
    no_interesado: 'var(--chart-slate)',
    descartado: 'var(--chart-rose)',
  } as Record<string, string>,

  // Mapa de estados de consultas
  consultaState: {
    Programada: 'var(--chart-blue)',
    Confirmada: 'var(--chart-emerald)',
    Reagendada: 'var(--chart-amber)',
    Cancelada: 'var(--chart-slate)',
    Completada: 'var(--chart-teal)',
  } as Record<string, string>,
} as const;

// ==================== ACCENT COLORS ====================
// Colores semánticos para acentos en UI (Tailwind classes)
export const accentColors = {
  primary: {
    text: 'text-teal-400',
    bg: 'bg-teal-500/15',
    border: 'border-teal-400/25',
    hover: 'hover:bg-teal-500/25',
    dot: 'bg-teal-500',
  },
  success: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/25',
    hover: 'hover:bg-emerald-500/25',
    dot: 'bg-emerald-500',
  },
  warning: {
    text: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/25',
    hover: 'hover:bg-amber-500/25',
    dot: 'bg-amber-500',
  },
  danger: {
    text: 'text-rose-400',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/25',
    hover: 'hover:bg-rose-500/25',
    dot: 'bg-rose-500',
  },
  info: {
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/25',
    hover: 'hover:bg-cyan-500/25',
    dot: 'bg-cyan-500',
  },
  neutral: {
    text: 'text-muted-foreground',
    bg: 'bg-muted',
    border: 'border-border',
    hover: 'hover:bg-muted/80',
    dot: 'bg-muted-foreground',
  },
} as const;

// ==================== BADGES / CHIPS ====================
export const badges = {
  base: 'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border',
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-sm',
} as const;

// ==================== SPACING ====================
export const spacing = {
  cardHeader: 'pb-4',
  cardContent: 'pt-0',
  cardPadding: 'p-5',
  container: 'px-4 sm:px-6',
  containerY: 'py-6 sm:py-8',
  // Section margins entre bloques de contenido
  sectionGap: 'mb-4 sm:mb-6 md:mb-8',
  sectionGapSm: 'mb-3 sm:mb-4',
  // Gaps
  gap: { xs: 'gap-2', sm: 'gap-3', md: 'gap-4', lg: 'gap-6' },
  stack: { xs: 'space-y-2', sm: 'space-y-3', md: 'space-y-4', lg: 'space-y-6' },
} as const;

// ==================== LAYOUTS ====================
export const layouts = {
  grid2: 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4',
  grid3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4',
  grid4: 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4',
  grid5: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3',
  // KPI grids
  kpiGrid: 'grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4',
  kpiGrid5: 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3',
} as const;

// ==================== CARDS ====================
export const cards = {
  // Base para todas las cards
  base: 'overflow-hidden',
  // Card tipo glass (para Dashboard, cards principales)
  glass: 'overflow-hidden rounded-xl border border-border bg-card shadow-sm',
  // Card con header separado (glass + header border)
  glassWithHeader: 'flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm',
  // Header dentro de card glass
  glassHeader: 'flex items-center justify-between gap-3 border-b border-border px-4 sm:px-6 py-3 sm:py-4',
  // Card interactiva
  interactive: 'cursor-pointer hover:border-ring/50 hover:bg-accent/30 active:scale-[0.98] transition-all overflow-hidden',
  mobileCard: 'min-h-[80px] flex flex-col justify-center overflow-hidden',
  chart: 'overflow-hidden min-w-0',
} as const;

// ==================== BUTTONS ====================
export const buttons = {
  // Refresh / action button (usado en headers de página)
  refresh: cn(
    'flex items-center justify-center gap-1.5 rounded-xl',
    'px-3 py-1.5 sm:px-4 sm:py-2 min-h-[36px]',
    'text-xs font-semibold transition-all duration-150',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ),
  // Variantes de color para refresh
  refreshTeal: 'bg-teal-500/15 text-teal-400 border border-teal-400/25 hover:bg-teal-500/25',
  refreshCyan: 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30',
  // Select / dropdown pequeño
  select: 'px-2 sm:px-3 py-1.5 rounded-lg bg-muted border border-border text-sm',
} as const;

// ==================== TABS ====================
export const tabs = {
  // Container de tabs
  container: 'mb-4 sm:mb-6 flex items-center gap-4 sm:gap-8 border-b border-border overflow-x-auto scrollbar-hide',
  containerFlush: 'mb-4 sm:mb-6 border-b border-border overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0',
  // Tab items wrapper
  list: 'flex gap-0.5 sm:gap-1 min-w-max',
  // Tab individual
  tab: 'relative pb-2.5 sm:pb-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200',
  tabWithIcon: 'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
  // Estados
  tabActive: 'text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary',
  tabInactive: 'text-muted-foreground hover:text-foreground',
  // Tab con icono activo/inactivo (para bordes de color)
  tabIconActive: (color: string) => `border-${color}-500 text-${color}-400`,
  tabIconInactive: 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
  // Badge counter dentro de tab
  tabBadge: 'ml-1 px-1.5 py-0.5 text-xs rounded-full bg-muted',
  tabBadgeAccent: (color: string) => `ml-1 px-1.5 py-0.5 text-xs rounded-full bg-${color}-500/20 text-${color}-400`,
} as const;

// ==================== LIST ITEMS ====================
export const listItems = {
  // Item de lista clickeable (leads recientes, consultas próximas)
  row: 'group flex cursor-pointer items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 transition-colors hover:bg-muted/50 active:bg-muted/70',
  // Título del item
  rowTitle: 'truncate text-xs sm:text-sm font-medium text-foreground group-hover:text-primary',
  // Metadata del item
  rowMeta: 'mt-0.5 sm:mt-1 flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground',
  // Divisor
  divider: 'divide-y divide-border',
  // Empty state dentro de lista
  empty: 'flex h-28 sm:h-32 items-center justify-center text-xs sm:text-sm text-muted-foreground',
  // Contenedor scrollable
  scrollable: 'max-h-[320px] sm:max-h-[400px] overflow-y-auto overscroll-contain',
} as const;

// ==================== METRIC CARD COLORS ====================
// Paleta unificada para MetricCard / KpiCard
export const metricColors = {
  emerald: { label: 'text-emerald-400', border: 'border-emerald-400/20', icon: 'text-emerald-400/40', glow: 'shadow-emerald-500/[0.08]', dot: 'bg-emerald-400', bg: 'bg-emerald-500/15' },
  green: { label: 'text-emerald-400', border: 'border-emerald-400/20', icon: 'text-emerald-400/40', glow: 'shadow-emerald-500/[0.08]', dot: 'bg-emerald-400', bg: 'bg-emerald-500/15' },
  blue: { label: 'text-sky-400', border: 'border-sky-400/20', icon: 'text-sky-400/40', glow: 'shadow-sky-500/[0.08]', dot: 'bg-sky-400', bg: 'bg-sky-500/15' },
  purple: { label: 'text-violet-400', border: 'border-violet-400/20', icon: 'text-violet-400/40', glow: 'shadow-violet-500/[0.08]', dot: 'bg-violet-400', bg: 'bg-violet-500/15' },
  amber: { label: 'text-amber-400', border: 'border-amber-400/20', icon: 'text-amber-400/40', glow: 'shadow-amber-500/[0.08]', dot: 'bg-amber-400', bg: 'bg-amber-500/15' },
  orange: { label: 'text-orange-400', border: 'border-orange-400/20', icon: 'text-orange-400/40', glow: 'shadow-orange-500/[0.08]', dot: 'bg-orange-400', bg: 'bg-orange-500/15' },
  red: { label: 'text-rose-400', border: 'border-rose-400/20', icon: 'text-rose-400/40', glow: 'shadow-rose-500/[0.08]', dot: 'bg-rose-400', bg: 'bg-rose-500/15' },
  cyan: { label: 'text-cyan-400', border: 'border-cyan-400/20', icon: 'text-cyan-400/40', glow: 'shadow-cyan-500/[0.08]', dot: 'bg-cyan-400', bg: 'bg-cyan-500/15' },
  teal: { label: 'text-teal-400', border: 'border-teal-400/20', icon: 'text-teal-400/40', glow: 'shadow-teal-500/[0.08]', dot: 'bg-teal-400', bg: 'bg-teal-500/15' },
  fuchsia: { label: 'text-fuchsia-400', border: 'border-fuchsia-400/20', icon: 'text-fuchsia-400/40', glow: 'shadow-fuchsia-500/[0.08]', dot: 'bg-fuchsia-400', bg: 'bg-fuchsia-500/15' },
} as const;

export type MetricColor = keyof typeof metricColors;

// ==================== INPUTS ====================
export const inputs = {
  base: '',
  search: 'pl-10',
} as const;

// ==================== TABLES ====================
export const tables = {
  wrapper: 'w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm',
  thead: 'bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground',
  th: 'px-4 py-3 font-medium',
  td: 'px-4 py-3',
  tr: 'border-b border-border hover:bg-muted/30 transition-colors',
} as const;

// ==================== PROGRESS BARS ====================
export const progress = {
  track: 'h-2 bg-muted rounded-full overflow-hidden',
  bar: 'h-full rounded-full transition-all',
  barGradientEmerald: 'bg-gradient-to-r from-emerald-500 to-green-400',
  barGradientTeal: 'bg-gradient-to-r from-teal-500 to-cyan-400',
  barGradientBlue: 'bg-gradient-to-r from-blue-500 to-sky-400',
} as const;

// Re-exportar cn para conveniencia
export { cn };
