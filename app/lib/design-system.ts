/**
 * ============================================================
 * DESIGN SYSTEM - CRM UROBOT
 * ============================================================
 * Tokens de diseño complementarios a shadcn/ui
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
export const typography = {
  // Títulos
  pageTitle: 'text-xl sm:text-2xl font-bold text-foreground',
  pageSubtitle: 'text-sm text-muted-foreground',
  cardTitle: 'text-base font-semibold text-foreground',
  cardDescription: 'text-sm text-muted-foreground',
  
  // Body
  body: 'text-sm text-foreground',
  
  // Labels y metadata
  label: 'text-xs text-muted-foreground uppercase tracking-wider',
  metadata: 'text-xs text-muted-foreground/80',
  metadataSmall: 'text-[11px] text-muted-foreground/70',
  
  // Métricas
  metric: 'text-2xl font-bold text-foreground tabular-nums',
  metricSmall: 'text-lg font-semibold text-foreground tabular-nums',
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
  base: '', // Usar <Card> de shadcn directamente
  interactive: 'cursor-pointer hover:border-ring/50 hover:bg-accent/30 active:scale-[0.98] transition-all',
  mobileCard: 'min-h-[80px] flex flex-col justify-center',
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
