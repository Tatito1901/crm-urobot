'use client';

import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  percentage?: number;
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'red' | 'cyan' | 'fuchsia' | 'green' | 'orange' | 'teal';
  icon?: string;
  description?: string;
  subtitle?: string;  // Alias for description (compatibility)
  trend?: {
    value: number;
    isPositive: boolean;
  };
  showProgress?: boolean;
  maxValue?: number;
  loading?: boolean;  // Support loading state
}

const colorClasses = {
  emerald: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500/30',
    bgLight: 'bg-emerald-500/10',
  },
  green: {  // Alias for emerald
    text: 'text-emerald-400',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500/30',
    bgLight: 'bg-emerald-500/10',
  },
  blue: {
    text: 'text-blue-400',
    bg: 'bg-blue-500',
    border: 'border-blue-500/30',
    bgLight: 'bg-blue-500/10',
  },
  purple: {
    text: 'text-purple-400',
    bg: 'bg-purple-500',
    border: 'border-purple-500/30',
    bgLight: 'bg-purple-500/10',
  },
  amber: {
    text: 'text-amber-400',
    bg: 'bg-amber-500',
    border: 'border-amber-500/30',
    bgLight: 'bg-amber-500/10',
  },
  orange: {  // Alias for amber
    text: 'text-amber-400',
    bg: 'bg-amber-500',
    border: 'border-amber-500/30',
    bgLight: 'bg-amber-500/10',
  },
  red: {
    text: 'text-red-400',
    bg: 'bg-red-500',
    border: 'border-red-500/30',
    bgLight: 'bg-red-500/10',
  },
  cyan: {
    text: 'text-cyan-400',
    bg: 'bg-cyan-500',
    border: 'border-cyan-500/30',
    bgLight: 'bg-cyan-500/10',
  },
  teal: {  // Alias for cyan
    text: 'text-cyan-400',
    bg: 'bg-cyan-500',
    border: 'border-cyan-500/30',
    bgLight: 'bg-cyan-500/10',
  },
  fuchsia: {
    text: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500',
    border: 'border-fuchsia-500/30',
    bgLight: 'bg-fuchsia-500/10',
  },
};

export function MetricCard({
  title,
  value,
  percentage,
  color = 'blue',
  icon,
  description,
  subtitle,
  trend,
  showProgress = true,
  maxValue = 100,
  loading = false,
}: MetricCardProps) {
  const finalDescription = description || subtitle;
  const colors = colorClasses[color];
  const progressPercentage = percentage ?? (typeof value === 'number' && maxValue > 0 ? (value / maxValue) * 100 : 0);

  return (
    <div className="group rounded-lg border border-white/10 bg-white/[0.02] p-3 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-base">{icon}</span>}
          <span className="text-xs text-white/60">{title}</span>
        </div>
        <span className={`text-xs font-medium ${colors.text}`}>
          {percentage !== undefined ? `${percentage}%` : value}
        </span>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-2">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.bg} rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Value */}
      {loading ? (
        <div className="h-8 w-3/4 bg-white/10 rounded-lg animate-pulse mb-2" />
      ) : (
        <span className={`text-xs font-medium ${colors.text}`}>
          {percentage !== undefined ? `${percentage}%` : value}
        </span>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {finalDescription && (
          <p className="text-[10px] text-white/40">{finalDescription}</p>
        )}
        
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            <span>{trend.isPositive ? '↗' : '↘'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
