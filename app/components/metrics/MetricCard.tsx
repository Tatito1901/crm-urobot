'use client';

import React, { useEffect, useState, useRef } from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  percentage?: number;
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'red' | 'cyan' | 'fuchsia' | 'green' | 'orange' | 'teal';
  icon?: React.ReactNode;
  description?: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  showProgress?: boolean;
  maxValue?: number;
  loading?: boolean;
  /** Animar el valor numérico (solo si es número) */
  animate?: boolean;
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

const colorClasses = {
  emerald: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/30', bgLight: 'bg-emerald-50 dark:bg-emerald-500/10' },
  green: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/30', bgLight: 'bg-emerald-50 dark:bg-emerald-500/10' },
  blue: { text: 'text-foreground', bg: 'bg-blue-500', border: 'border-blue-500/30', bgLight: 'bg-blue-50 dark:bg-blue-500/10' },
  purple: { text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500', border: 'border-purple-500/30', bgLight: 'bg-purple-50 dark:bg-purple-500/10' },
  amber: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30', bgLight: 'bg-amber-50 dark:bg-amber-500/10' },
  orange: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30', bgLight: 'bg-amber-50 dark:bg-amber-500/10' },
  red: { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-500', border: 'border-red-500/30', bgLight: 'bg-red-50 dark:bg-red-500/10' },
  cyan: { text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500/30', bgLight: 'bg-cyan-50 dark:bg-cyan-500/10' },
  teal: { text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500/30', bgLight: 'bg-cyan-50 dark:bg-cyan-500/10' },
  fuchsia: { text: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-500', border: 'border-fuchsia-500/30', bgLight: 'bg-fuchsia-50 dark:bg-fuchsia-500/10' },
};

export const MetricCard = React.memo(({
  title,
  value,
  percentage,
  color = 'blue',
  icon,
  description,
  subtitle,
  trend,
  loading = false,
  maxValue = 100,
  animate = true,
}: MetricCardProps) => {
  // Evitar hydration mismatch: siempre renderizar skeleton en SSR y primer render del cliente
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const finalDescription = description || subtitle;
  const colors = colorClasses[color];
  
  // Extraer valor numérico para animación
  const numericValue = typeof value === 'number' ? value : 
    (typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, ''), 10) || 0 : 0);
  
  // Animar el número cuando no está cargando
  const animatedValue = useAnimatedNumber(numericValue, 400, animate && !loading && mounted);
  
  // Mostrar skeleton hasta que esté montado en cliente
  const isLoading = !mounted || loading;
  
  // Mostrar valor formateado
  const displayValue = isLoading ? '—' : 
    (animate && typeof value === 'number') ? animatedValue.toLocaleString('es-MX') : value;
  
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/50 bg-card p-4 sm:p-5 min-h-[120px]">
      
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">{title}</span>
        {icon && (
          <span className={`rounded-md p-1 sm:p-1.5 shrink-0 ${colors.bgLight} ${colors.text} transition-colors`}>
             {icon} 
          </span>
        )}
      </div>

      <div className="mt-3 sm:mt-4">
        {isLoading ? (
          <div className="mb-1 h-7 sm:h-8 w-20 sm:w-24 skeleton-pulse rounded-md bg-muted" />
        ) : (
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap transition-opacity duration-200">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-card-foreground tabular-nums">
              {percentage !== undefined ? `${percentage}%` : displayValue}
            </span>
            {maxValue > 0 && typeof value === 'number' && (
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">/ {maxValue}</span>
            )}
          </div>
        )}

        <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm">
          {isLoading ? (
            <div className="h-4 w-24 skeleton-pulse rounded bg-muted" />
          ) : (
            <>
              {finalDescription && (
                <p className="font-medium text-muted-foreground truncate">{finalDescription}</p>
              )}
              
              {trend && (
                <div className={`flex items-center gap-0.5 font-medium shrink-0 ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                  <span>{trend.isPositive ? '↑' : '↓'}</span>
                  <span>{Math.abs(trend.value)}%</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

MetricCard.displayName = 'MetricCard';
