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
  emerald: { label: 'text-emerald-500 dark:text-emerald-300', value: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', icon: 'text-emerald-400' },
  green: { label: 'text-emerald-500 dark:text-emerald-300', value: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', icon: 'text-emerald-400' },
  blue: { label: 'text-blue-500 dark:text-blue-300', value: 'text-foreground', border: 'border-blue-500/20', icon: 'text-blue-400' },
  purple: { label: 'text-purple-500 dark:text-purple-300', value: 'text-foreground', border: 'border-purple-500/20', icon: 'text-purple-400' },
  amber: { label: 'text-amber-500 dark:text-amber-300', value: 'text-foreground', border: 'border-amber-500/20', icon: 'text-amber-400' },
  orange: { label: 'text-amber-500 dark:text-amber-300', value: 'text-foreground', border: 'border-amber-500/20', icon: 'text-amber-400' },
  red: { label: 'text-red-500 dark:text-red-300', value: 'text-foreground', border: 'border-red-500/20', icon: 'text-red-400' },
  cyan: { label: 'text-cyan-500 dark:text-cyan-300', value: 'text-foreground', border: 'border-cyan-500/20', icon: 'text-cyan-400' },
  teal: { label: 'text-cyan-500 dark:text-cyan-300', value: 'text-foreground', border: 'border-cyan-500/20', icon: 'text-cyan-400' },
  fuchsia: { label: 'text-fuchsia-500 dark:text-fuchsia-300', value: 'text-foreground', border: 'border-fuchsia-500/20', icon: 'text-fuchsia-400' },
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
    <div className={`bg-card border ${colors.border} rounded-lg p-3.5 flex flex-col justify-between relative overflow-hidden group min-h-[100px]`}>
      {/* Icono de fondo grande */}
      {icon && (
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className={`${colors.icon} [&>svg]:w-10 [&>svg]:h-10`}>{icon}</span>
        </div>
      )}
      
      <div>
        <div className={`text-[11px] ${colors.label} mb-0.5 font-medium`}>{title}</div>
        {isLoading ? (
          <div className="h-7 w-16 bg-muted/50 rounded animate-pulse" />
        ) : (
          <div className={`text-2xl font-bold ${colors.value} tabular-nums`}>
            {percentage !== undefined ? `${percentage}%` : displayValue}
          </div>
        )}
      </div>
      
      <div className="text-[10px] text-muted-foreground mt-1">
        {isLoading ? (
          <div className="h-3 w-20 bg-muted/50 rounded animate-pulse" />
        ) : (
          <>
            {finalDescription}
            {trend && (
              <span className={`ml-1 ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
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
