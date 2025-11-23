import React from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  percentage?: number;
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'red' | 'cyan' | 'fuchsia' | 'green' | 'orange' | 'teal';
  icon?: React.ReactNode;
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
  emerald: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/30', bgLight: 'bg-emerald-50 dark:bg-emerald-500/10' },
  green: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/30', bgLight: 'bg-emerald-50 dark:bg-emerald-500/10' },
  blue: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500', border: 'border-blue-500/30', bgLight: 'bg-blue-50 dark:bg-blue-500/10' },
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
}: MetricCardProps) => {
  const finalDescription = description || subtitle;
  const colors = colorClasses[color];
  
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg dark:hover:shadow-black/20">
      {/* Decorative gradient subtle */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.03]`} />
      
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon && (
          <span className={`rounded-md p-1.5 ${colors.bgLight} ${colors.text} transition-colors group-hover:bg-opacity-20`}>
             {icon} 
          </span>
        )}
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="mb-1 h-8 w-24 animate-pulse rounded-md bg-muted" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-card-foreground tabular-nums">
              {percentage !== undefined ? `${percentage}%` : value}
            </span>
            {maxValue > 0 && typeof value === 'number' && (
              <span className="text-sm font-medium text-muted-foreground">/ {maxValue}</span>
            )}
          </div>
        )}

        <div className="mt-1 flex items-center gap-2 text-sm">
          {finalDescription && (
            <p className="font-medium text-muted-foreground truncate max-w-[180px]">{finalDescription}</p>
          )}
          
          {trend && (
            <div className={`flex items-center gap-0.5 font-medium ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MetricCard.displayName = 'MetricCard';
