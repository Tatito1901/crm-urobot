/**
 * ============================================================
 * DESIGN SYSTEM - CRM UROBOT
 * ============================================================
 * Sistema de diseño unificado para consistencia visual
 * 
 * IMPORTANTE: Usar componentes de shadcn/ui como base:
 * - Card, CardHeader, CardTitle, CardContent → @/components/ui/card
 * - Button → @/components/ui/button
 * - Badge → @/components/ui/badge
 * - Table → @/components/ui/table
 * - Skeleton → @/components/ui/skeleton
 * - Tooltip → @/components/ui/tooltip
 * - Input → @/components/ui/input
 */

import { cn } from "@/lib/utils";

// ==================== TYPOGRAPHY ====================
// Tamaños consistentes en toda la plataforma
export const typography = {
  // Títulos de página
  pageTitle: 'text-lg sm:text-xl font-semibold text-foreground',
  pageSubtitle: 'text-sm text-muted-foreground',
  
  // Títulos de sección/card
  sectionTitle: 'text-sm font-semibold text-foreground',
  cardTitle: 'text-sm font-semibold text-foreground',
  cardDescription: 'text-xs text-muted-foreground',
  
  // Body text
  body: 'text-sm text-foreground',
  bodySmall: 'text-xs text-foreground',
  
  // Labels y metadata
  label: 'text-[11px] text-muted-foreground uppercase tracking-wider font-medium',
  labelSmall: 'text-[10px] text-muted-foreground uppercase tracking-wider font-medium',
  metadata: 'text-xs text-muted-foreground',
  metadataSmall: 'text-[11px] text-muted-foreground',
  
  // Métricas y números
  metric: 'text-xl sm:text-2xl font-bold text-foreground tabular-nums',
  metricMedium: 'text-lg font-semibold text-foreground tabular-nums',
  metricSmall: 'text-base font-semibold text-foreground tabular-nums',
  number: 'tabular-nums font-medium',
  
  // Tablas
  tableHeader: 'text-[11px] uppercase tracking-wider font-medium text-muted-foreground',
  tableCell: 'text-sm text-foreground',
  tableCellSmall: 'text-xs text-muted-foreground',
};

// ==================== BADGES / CHIPS ====================
// Estilos consistentes para todos los badges
export const badges = {
  // Base (aplicar siempre)
  base: 'inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md border',
  
  // Variantes de tamaño
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-[11px]',
  lg: 'px-2.5 py-1 text-xs',
};

// ==================== SPACING ====================
export const spacing = {
  // Card spacing
  cardHeader: 'pb-4',
  cardContent: 'pt-0',
  cardPadding: 'p-5',
  
  // Container
  container: 'px-4 sm:px-6',
  containerY: 'py-6 sm:py-8',
  
  // Gaps
  gap: { xs: 'gap-2', sm: 'gap-3', md: 'gap-4', lg: 'gap-6' },
  stack: { xs: 'space-y-2', sm: 'space-y-3', md: 'space-y-4', lg: 'space-y-6' },
};

// ==================== LAYOUTS ====================
// Grids responsivos pre-configurados
export const layouts = {
  // Grid columns
  grid2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  grid3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  grid4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  grid5: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4',
};

// ==================== CARDS ====================
// Variantes de Card (base viene de shadcn, estas son extensiones)
export const cards = {
  base: 'overflow-hidden', // Previene desbordamiento de contenido
  interactive: 'cursor-pointer hover:border-ring/50 hover:bg-accent/30 active:scale-[0.98] transition-all overflow-hidden',
  mobileCard: 'min-h-[80px] flex flex-col justify-center overflow-hidden',
  chart: 'overflow-hidden min-w-0', // Para cards con gráficos
};

// ==================== INPUTS ====================
// Usar <Input> de shadcn, estos son helpers para clases adicionales
export const inputs = {
  base: '', // Usar <Input> de shadcn directamente
  search: 'pl-10', // Para inputs con icono de búsqueda
};

// ==================== TABLES (legacy - usar shadcn Table) ====================
// Mantener temporalmente para compatibilidad
export const tables = {
  wrapper: 'w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm',
  thead: 'bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground',
  th: 'px-4 py-3 font-medium',
  td: 'px-4 py-3',
  tr: 'border-b border-border hover:bg-muted/30 transition-colors',
};

// Re-exportar cn para conveniencia
export { cn };
