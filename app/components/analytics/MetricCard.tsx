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
  blue: 'from-blue-500/15 via-blue-600/10 to-blue-700/5 border-blue-400/20 hover:border-blue-400/40',
  green: 'from-emerald-500/15 via-emerald-600/10 to-emerald-700/5 border-emerald-400/20 hover:border-emerald-400/40',
  purple: 'from-purple-500/15 via-purple-600/10 to-purple-700/5 border-purple-400/20 hover:border-purple-400/40',
  orange: 'from-orange-500/15 via-orange-600/10 to-orange-700/5 border-orange-400/20 hover:border-orange-400/40',
  red: 'from-red-500/15 via-red-600/10 to-red-700/5 border-red-400/20 hover:border-red-400/40',
  teal: 'from-teal-500/15 via-teal-600/10 to-teal-700/5 border-teal-400/20 hover:border-teal-400/40',
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
      className={`group relative overflow-hidden rounded-2xl border backdrop-blur-sm bg-gradient-to-br ${colorClasses[color]} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10`}
    >
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-300 transition-colors">
            {title}
          </h3>
          {icon && (
            <span className="text-xl sm:text-2xl opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-300">
              {icon}
            </span>
          )}
        </div>

        {/* Value */}
        {loading ? (
          <div className="h-8 sm:h-10 w-3/4 bg-white/10 rounded-lg animate-pulse" />
        ) : (
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover:text-blue-50 transition-colors">
                {value}
              </p>
              {trend && (
                <span
                  className={`flex items-center text-[10px] sm:text-xs font-semibold px-1 sm:px-1.5 py-0.5 rounded ${
                    trend.isPositive 
                      ? 'text-emerald-400 bg-emerald-400/10' 
                      : 'text-red-400 bg-red-400/10'
                  }`}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            
            {/* Subtitle */}
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
});
