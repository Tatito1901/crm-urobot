'use client';

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
    <div className="group rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm p-5 hover:border-white/20 hover:from-white/[0.08] hover:to-white/[0.04] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-xl">{icon}</span>}
          <span className="text-sm font-medium text-white/70">{title}</span>
        </div>
      </div>

      {/* Value */}
      {loading ? (
        <div className="h-10 w-3/4 bg-white/10 rounded-lg animate-pulse mb-3" />
      ) : (
        <div className={`text-3xl font-bold ${colors.text} mb-3 tracking-tight relative`}>
          {percentage !== undefined ? `${percentage}%` : value}
        </div>
      )}

      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-3 relative">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.bg} rounded-full transition-all duration-500 ease-out shadow-lg`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between relative">
        {finalDescription && (
          <p className="text-xs text-white/50 font-medium">{finalDescription}</p>
        )}
        
        {trend && (
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            <span className="text-sm">{trend.isPositive ? '↗' : '↘'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
