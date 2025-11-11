/**
 * ============================================================
 * STATUS BADGE - Badge profesional para estados de citas
 * ============================================================
 */

import React from 'react';
import { getStatusConfig } from '../lib/agenda-utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'compact' | 'dot-only';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({
  status,
  variant = 'default',
  className = ''
}) => {
  const config = getStatusConfig(status);

  if (variant === 'dot-only') {
    return (
      <span className={`inline-flex h-2 w-2 rounded-full ${config.dotClass} ${className}`} />
    );
  }

  if (variant === 'compact') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${config.bgClass} ${config.borderClass} ${config.textClass} ${className}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
        {config.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium ${config.bgClass} ${config.borderClass} ${config.textClass} ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';
