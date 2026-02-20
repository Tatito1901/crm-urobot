'use client';

import React, { useEffect, useState, useRef, type ElementType } from 'react';
import { metricColors, type MetricColor } from '@/app/lib/design-system';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ============================================================
 * METRIC CARD — Componente unificado de KPI / Stat
 * ============================================================
 * Variantes:
 *  - "default"  → Dashboard: dot+label, big value, ghost icon bg
 *  - "compact"  → Leads: horizontal, icon left, label+value right
 *  - "kpi"      → Urobot/Estadísticas: icon-box header, value, subtext
 */
interface MetricCardProps {
  title: string;
  value: number | string;
  percentage?: number;
  color?: MetricColor;
  icon?: React.ReactNode;
  /** ElementType icon (for kpi variant — renders as component) */
  iconComponent?: ElementType;
  /** Direct Tailwind color classes for kpi icon (e.g. 'text-blue-400') */
  iconColor?: string;
  description?: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  } | string;
  showProgress?: boolean;
  maxValue?: number;
  loading?: boolean;
  /** Animar el valor numérico (solo si es número) */
  animate?: boolean;
  tooltip?: string;
  /** Layout variant */
  variant?: 'default' | 'compact' | 'kpi';
}

/**
 * Hook para animar números con efecto de contador
 * Optimizado para no causar re-renders innecesarios
 */
function useAnimatedNumber(targetValue: number, duration = 600, enabled = true) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || typeof targetValue !== 'number') {
      setDisplayValue(targetValue);
      return;
    }

    const startValue = previousValue.current;
    const startTime = performance.now();
    const difference = targetValue - startValue;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (difference * eased);
      
      setDisplayValue(Math.round(currentValue));
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = targetValue;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [targetValue, duration, enabled]);

  return displayValue;
}


export const MetricCard = React.memo(({
  title,
  value,
  percentage,
  color = 'blue',
  icon,
  iconComponent: IconComponent,
  iconColor,
  description,
  subtitle,
  trend,
  loading = false,
  maxValue = 100,
  animate = true,
  tooltip,
  variant = 'default',
}: MetricCardProps) => {
  // Evitar hydration mismatch: siempre renderizar skeleton en SSR y primer render del cliente
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const finalDescription = description || subtitle;
  const colors = metricColors[color];
  
  // Extraer valor numérico para animación
  const numericValue = typeof value === 'number' ? value : 
    (typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, ''), 10) || 0 : 0);
  
  // Animar el número cuando no está cargando
  const shouldAnimate = variant === 'default' && animate;
  const animatedValue = useAnimatedNumber(numericValue, 400, shouldAnimate && !loading && mounted);
  
  // Mostrar skeleton hasta que esté montado en cliente
  const isLoading = variant === 'default' ? (!mounted || loading) : loading;
  
  // Mostrar valor formateado
  const displayValue = isLoading ? '—' : 
    (shouldAnimate && typeof value === 'number') ? animatedValue.toLocaleString('es-MX') : value;
  
  // Trend rendering (supports both object and string formats)
  const trendElement = trend ? (
    typeof trend === 'string' ? (
      <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25 shrink-0">
        <ArrowUpRight className="w-3 h-3" />
        <span className="hidden sm:inline">{trend}</span>
      </div>
    ) : (
      <span className={`ml-1.5 font-semibold ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
        {trend.isPositive ? '↑' : '↓'}{Math.abs(trend.value)}%
      </span>
    )
  ) : null;

  // ═══════════════════════════════════════════════
  // VARIANT: compact (horizontal — Leads page)
  // ═══════════════════════════════════════════════
  if (variant === 'compact') {
    return (
      <div
        className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border transition-all duration-200 hover:border-primary/30 hover:bg-muted/10 hover:shadow-sm min-h-[72px] cursor-pointer relative overflow-hidden group"
        title={tooltip}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:animate-shimmer pointer-events-none" />
        
        {(icon || IconComponent) && (
          <div className={cn('p-2.5 sm:p-3 rounded-xl shrink-0 flex items-center justify-center shadow-inner transition-transform group-hover:scale-110', iconColor ? `bg-muted/50 border border-border/50 ${iconColor}` : `${colors.bg} border border-${color}-500/20 text-${color}-500`)}>
            {IconComponent ? <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" /> : icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] sm:text-xs text-muted-foreground font-semibold truncate uppercase tracking-wider">
              {title}
            </p>
            <ArrowUpRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary transition-colors" />
          </div>
          {loading ? (
            <div className="h-6 w-12 mt-1 bg-muted rounded animate-pulse" />
          ) : (
            <p className={cn('text-lg sm:text-2xl font-bold tabular-nums leading-tight mt-0.5 tracking-tight', iconColor ? iconColor.split(' ')[0] : 'text-foreground')}>
              {percentage !== undefined ? `${percentage}%` : displayValue}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // VARIANT: kpi (icon-box header — Urobot/Estadísticas)
  // ═══════════════════════════════════════════════
  if (variant === 'kpi') {
    const kpiColor = iconColor || `${colors.label}`;
    return (
      <div
        className="bg-white/[0.05] border border-white/[0.10] rounded-xl p-2.5 sm:p-4 flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-primary/50 transition-all min-h-[110px] sm:min-h-[140px] shine-top"
        title={tooltip}
      >
        <div className="flex justify-between items-start mb-3">
          <div className={cn('p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl shrink-0 border', iconColor ? `bg-muted/50 ${kpiColor} border-transparent` : `${colors.bg} ${colors.label} ${colors.border}`)}>
            {IconComponent ? <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" /> : icon}
          </div>
          {typeof trend === 'string' && trendElement}
        </div>
        <div className="min-w-0">
          <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1 truncate">{title}</h3>
          {loading ? (
            <div className="h-8 w-20 bg-muted rounded-md animate-pulse mb-1" />
          ) : (
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1 tracking-tight truncate font-jakarta">
              {percentage !== undefined ? `${percentage}%` : displayValue}
            </div>
          )}
          {finalDescription && (
            <p className="text-xs font-medium text-muted-foreground truncate">{finalDescription}</p>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // VARIANT: default (Dashboard — dot+label, ghost icon)
  // ═══════════════════════════════════════════════
  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${colors.border} bg-card p-3 sm:p-4 flex flex-col justify-between min-h-[90px] sm:min-h-[108px] transition-colors hover:bg-muted/30`}
      title={tooltip}
    >
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
          <span className={`text-xs ${colors.label} font-semibold uppercase tracking-wider`}>{title}</span>
        </div>
        {isLoading ? (
          <div className="h-8 w-20 bg-white/[0.08] rounded-md animate-pulse" />
        ) : (
          <div className="text-2xl font-extrabold text-foreground tabular-nums tracking-tight font-jakarta">
            {percentage !== undefined ? `${percentage}%` : displayValue}
          </div>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground mt-2">
        {isLoading ? (
          <div className="h-3 w-24 bg-white/[0.08] rounded animate-pulse" />
        ) : (
          <>
            {finalDescription}
            {typeof trend === 'object' && trendElement}
          </>
        )}
      </div>
    </div>
  );
});

MetricCard.displayName = 'MetricCard';
