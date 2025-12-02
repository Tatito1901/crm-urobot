'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RefreshIndicatorProps {
  /** Función de refrescar datos */
  onRefresh: () => Promise<void> | void;
  /** Última vez que se actualizaron los datos */
  lastUpdated?: Date;
  /** Texto personalizado */
  label?: string;
  /** Tamaño del componente */
  size?: 'sm' | 'md';
  /** Clases adicionales */
  className?: string;
}

/**
 * Indicador de última actualización con botón de refrescar
 * Muestra cuándo se actualizaron los datos y permite forzar refresh
 */
export function RefreshIndicator({
  onRefresh,
  lastUpdated,
  label = 'Datos',
  size = 'sm',
  className,
}: RefreshIndicatorProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeAgo, setTimeAgo] = useState<string>('');

  // Calcular tiempo transcurrido
  const updateTimeAgo = useCallback(() => {
    if (!lastUpdated) {
      setTimeAgo('');
      return;
    }

    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);

    if (diff < 60) {
      setTimeAgo('hace un momento');
    } else if (diff < 3600) {
      const mins = Math.floor(diff / 60);
      setTimeAgo(`hace ${mins} min`);
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      setTimeAgo(`hace ${hours}h`);
    } else {
      setTimeAgo('hace más de 1 día');
    }
  }, [lastUpdated]);

  useEffect(() => {
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, [updateTimeAgo]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      // Pequeño delay para feedback visual
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const sizeClasses = {
    sm: 'text-[10px] gap-1 px-2 py-1',
    md: 'text-xs gap-1.5 px-3 py-1.5',
  };

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={cn(
        'inline-flex items-center rounded-lg border transition-all',
        'bg-muted/50 border-border/50 text-muted-foreground',
        'hover:bg-muted hover:border-border hover:text-foreground',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        sizeClasses[size],
        className
      )}
      title={`Actualizar ${label}`}
    >
      <RefreshCw 
        className={cn(
          iconSize,
          isRefreshing && 'animate-spin'
        )} 
      />
      {timeAgo && (
        <>
          <Clock className={cn(iconSize, 'opacity-50')} />
          <span className="font-medium">{timeAgo}</span>
        </>
      )}
      {!timeAgo && (
        <span className="font-medium">Actualizar</span>
      )}
    </button>
  );
}

/**
 * Hook para trackear última actualización
 */
export function useLastUpdated() {
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);

  const markUpdated = useCallback(() => {
    setLastUpdated(new Date());
  }, []);

  return { lastUpdated, markUpdated };
}
