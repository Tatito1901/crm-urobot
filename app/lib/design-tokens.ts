/**
 * ============================================================
 * DESIGN TOKENS - SISTEMA UNIFICADO
 * ============================================================
 * Tokens de diseño centralizados para mantener consistencia
 * en toda la aplicación mobile-first
 */

/**
 * Sistema de espaciado responsive
 * Mobile-first approach: base → sm → md → lg → xl
 */
export const SPACING = {
  // Layout principal de páginas
  page: {
    mobile: {
      gap: 'gap-4',       // 16px
      px: 'px-4',         // 16px
      pb: 'pb-20',        // 80px (espacio para BottomNav)
      pt: 'pt-6',         // 24px
    },
    tablet: {
      gap: 'sm:gap-6',    // 24px
      px: 'sm:px-6',      // 24px
      pb: 'sm:pb-24',     // 96px
      pt: 'sm:pt-8',      // 32px
    },
    desktop: {
      gap: 'md:gap-8',    // 32px
      px: 'md:px-8',      // 32px (opcional, usa container)
      pb: 'lg:pb-20',     // 80px
      pt: 'md:pt-10',     // 40px
    },
  },

  // Secciones dentro de páginas
  section: {
    mobile: {
      gap: 'gap-3',       // 12px
      mb: 'mb-6',         // 24px
    },
    tablet: {
      gap: 'sm:gap-4',    // 16px
      mb: 'sm:mb-8',      // 32px
    },
    desktop: {
      gap: 'md:gap-6',    // 24px
      mb: 'md:mb-10',     // 40px
    },
  },

  // Componentes individuales (Cards, etc.)
  component: {
    padding: {
      xs: 'p-3',          // 12px - muy compacto
      sm: 'p-4',          // 16px - compacto
      md: 'p-5',          // 20px - estándar
      lg: 'p-6',          // 24px - espacioso
    },
    gap: {
      xs: 'gap-1',        // 4px
      sm: 'gap-2',        // 8px
      md: 'gap-3',        // 12px
      lg: 'gap-4',        // 16px
    },
  },
} as const;

/**
 * Helpers para construir clases de espaciado completas
 */
export const getPageSpacing = () => {
  const { mobile, tablet, desktop } = SPACING.page;
  return [
    mobile.gap, tablet.gap, desktop.gap,
    mobile.px, tablet.px,
    mobile.pb, tablet.pb, desktop.pb,
    mobile.pt, tablet.pt, desktop.pt,
  ].join(' ');
};

export const getSectionSpacing = () => {
  const { mobile, tablet, desktop } = SPACING.section;
  return [
    mobile.gap, tablet.gap, desktop.gap,
    mobile.mb, tablet.mb, desktop.mb,
  ].join(' ');
};

/**
 * Breakpoints Tailwind (documentación)
 */
export const BREAKPOINTS = {
  sm: '640px',   // Teléfonos grandes, phablets
  md: '768px',   // Tablets portrait
  lg: '1024px',  // Tablets landscape, laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px', // Monitores grandes
} as const;

/**
 * Touch targets (iOS HIG compliance)
 */
export const TOUCH_TARGETS = {
  minimum: '44px',      // Mínimo iOS HIG
  comfortable: '48px',  // Recomendado Android Material
  large: '56px',        // Extra grande
} as const;

/**
 * Borders con contraste WCAG AA
 */
export const BORDERS = {
  subtle: 'border-white/20',      // Contraste mínimo AA (2.3:1)
  medium: 'border-white/25',      // Contraste medio
  strong: 'border-white/30',      // Contraste alto (3.5:1)
  focus: 'border-sky-300',        // Focus state
} as const;

/**
 * Opacidades de fondo
 */
export const BG_OPACITY = {
  subtle: 'bg-white/[0.03]',      // Muy sutil
  light: 'bg-white/[0.04]',       // Sutil
  medium: 'bg-white/[0.08]',      // Medio
  strong: 'bg-white/10',          // Fuerte
} as const;

/**
 * Opacidades de texto (WCAG compliant)
 */
export const TEXT_OPACITY = {
  primary: 'text-white',          // 100% - Contraste máximo
  secondary: 'text-white/80',     // 80% - Secundario
  tertiary: 'text-white/60',      // 60% - Terciario
  disabled: 'text-white/40',      // 40% - Deshabilitado
  placeholder: 'text-white/50',   // 50% - Placeholders (mejorado)
} as const;

/**
 * Transiciones estándar
 */
export const TRANSITIONS = {
  fast: 'transition-all duration-100',     // Feedback táctil
  normal: 'transition-all duration-200',   // Transiciones normales
  slow: 'transition-all duration-300',     // Transiciones lentas
  colors: 'transition-colors duration-200', // Solo colores
} as const;

/**
 * Estados interactivos (hover, active, focus)
 */
export const INTERACTIVE_STATES = {
  hover: 'hover:bg-white/10',
  active: 'active:scale-95 active:bg-white/15',
  focus: 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300',
} as const;

/**
 * Grid columns responsive
 */
export const GRID_COLS = {
  // Para métricas/cards pequeñas
  metrics: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  // Para secciones principales
  sections: 'grid-cols-1 lg:grid-cols-2',
  // Para listados de items
  items: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
} as const;

/**
 * Container max-widths
 */
export const CONTAINERS = {
  sm: 'max-w-3xl',    // 768px
  md: 'max-w-4xl',    // 896px
  lg: 'max-w-5xl',    // 1024px
  xl: 'max-w-6xl',    // 1152px (default CRM)
  '2xl': 'max-w-7xl', // 1280px
} as const;

/**
 * Border radius
 */
export const RADIUS = {
  sm: 'rounded-lg',      // 8px
  md: 'rounded-xl',      // 12px
  lg: 'rounded-2xl',     // 16px
  full: 'rounded-full',  // Circular
} as const;

/**
 * Ejemplo de uso:
 *
 * import { SPACING, BORDERS, TRANSITIONS } from '@/app/lib/design-tokens';
 *
 * <div className={`${SPACING.component.padding.md} ${BORDERS.medium} ${TRANSITIONS.normal}`}>
 *   Content
 * </div>
 *
 * // O con helper:
 * <div className={getPageSpacing()}>
 *   Page content
 * </div>
 */
