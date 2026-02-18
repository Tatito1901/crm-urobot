'use client';

import React from 'react';
import { buttons } from '@/app/lib/design-system';
import { cn } from '@/lib/utils';

/**
 * RefreshButton - Botón de actualización unificado para headers de página.
 * Reemplaza las implementaciones dispersas en Dashboard, Urobot, etc.
 */

interface RefreshButtonProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
  variant?: 'teal' | 'cyan';
  className?: string;
}

export function RefreshButton({
  onClick,
  loading = false,
  label = 'Actualizar',
  variant = 'teal',
  className,
}: RefreshButtonProps) {
  const colorClass = variant === 'cyan' ? buttons.refreshCyan : buttons.refreshTeal;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(buttons.refresh, colorClass, className)}
    >
      <span className={loading ? 'animate-spin' : ''}>↻</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
