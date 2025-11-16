'use client';

import { ReactNode } from 'react';

interface MetricGridProps {
  title?: string;
  icon?: string;
  description?: string;
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5;
  alert?: {
    message: string;
    type: 'warning' | 'info' | 'success' | 'error';
  };
}

const alertStyles = {
  warning: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    text: 'text-amber-300',
    icon: '⚠️',
  },
  info: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    text: 'text-blue-300',
    icon: 'ℹ️',
  },
  success: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-300',
    icon: '✅',
  },
  error: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/5',
    text: 'text-red-300',
    icon: '🔴',
  },
};

export function MetricGrid({
  title,
  icon,
  description,
  children,
  columns = 4,
  alert,
}: MetricGridProps) {
  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    5: 'sm:grid-cols-2 lg:grid-cols-5',
  };

  return (
    <div className="space-y-3">
      {/* Alert (si existe) */}
      {alert && (
        <div className={`rounded-lg border ${alertStyles[alert.type].border} ${alertStyles[alert.type].bg} p-4`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{alertStyles[alert.type].icon}</span>
            <p className={`text-sm ${alertStyles[alert.type].text}`}>
              {alert.message}
            </p>
          </div>
        </div>
      )}

      {/* Card Container */}
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        {/* Header */}
        {(title || description) && (
          <div className="mb-3 pb-3 border-b border-white/10">
            {title && (
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                {icon && <span>{icon}</span>}
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-white/60 mt-1">{description}</p>
            )}
          </div>
        )}

        {/* Grid */}
        <div className={`grid grid-cols-1 ${gridCols[columns]} gap-3`}>
          {children}
        </div>
      </div>
    </div>
  );
}
