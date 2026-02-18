'use client';

import React, { useEffect, useState, useRef } from 'react';
import { metricColors, type MetricColor } from '@/app/lib/design-system';

interface MetricCardProps {
  title: string;
  value: number | string;
  percentage?: number;
  color?: MetricColor;
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
  const colors = metricColors[color];
  
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
    <div className={`relative overflow-hidden rounded-xl border ${colors.border} bg-card dark:bg-white/[0.03] p-3 sm:p-4 flex flex-col justify-between group min-h-[90px] sm:min-h-[108px] transition-all duration-200 hover:bg-white/[0.05] dark:shadow-lg ${colors.glow} shine-top`}>
      {/* Subtle background icon */}
      {icon && (
        <div className="absolute -top-1 -right-1 p-2 transition-opacity duration-200 opacity-100 group-hover:opacity-100">
          <span className={`${colors.icon} [&>svg]:w-12 [&>svg]:h-12`}>{icon}</span>
        </div>
      )}
      
      <div className="relative">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${colors.dot} opacity-70`} />
          <span className={`text-[10px] ${colors.label} font-semibold uppercase tracking-wider`}>{title}</span>
        </div>
        {isLoading ? (
          <div className="h-8 w-20 bg-white/[0.05] rounded-md animate-pulse" />
        ) : (
          <div className={`text-2xl font-extrabold text-foreground tabular-nums tracking-tight font-jakarta`}>
            {percentage !== undefined ? `${percentage}%` : displayValue}
          </div>
        )}
      </div>
      
      <div className="text-[10px] text-muted-foreground mt-2">
        {isLoading ? (
          <div className="h-3 w-24 bg-white/[0.05] rounded animate-pulse" />
        ) : (
          <>
            {finalDescription}
            {trend && (
              <span className={`ml-1.5 font-semibold ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trend.isPositive ? '↑' : '↓'}{Math.abs(trend.value)}%
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
});

MetricCard.displayName = 'MetricCard';
