/**
 * ============================================================
 * METRIC CARD - Tarjeta de métrica mejorada con animación
 * ============================================================
 */

'use client';

import React, { memo } from 'react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';
  loading?: boolean;
}

const colorClasses = {
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-400/30 text-blue-100',
  green: 'from-emerald-500/20 to-emerald-600/10 border-emerald-400/30 text-emerald-100',
  purple: 'from-purple-500/20 to-purple-600/10 border-purple-400/30 text-purple-100',
  orange: 'from-orange-500/20 to-orange-600/10 border-orange-400/30 text-orange-100',
  red: 'from-red-500/20 to-red-600/10 border-red-400/30 text-red-100',
  teal: 'from-teal-500/20 to-teal-600/10 border-teal-400/30 text-teal-100',
};

export const MetricCard = memo(function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'blue',
  loading = false,
}: MetricCardProps) {
  return (
    <div
      className={`relative overflow-hidden p-6 rounded-xl border bg-gradient-to-br ${colorClasses[color]}`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-16 translate-x-16" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-300">{title}</h3>
          {icon && <span className="text-2xl opacity-60">{icon}</span>}
        </div>

        {/* Value */}
        {loading ? (
          <div className="h-10 w-3/4 bg-white/10 rounded animate-pulse" />
        ) : (
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold">{value}</p>
            {trend && (
              <span
                className={`text-sm font-semibold ${
                  trend.isPositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
});
