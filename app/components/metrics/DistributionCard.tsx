'use client';

interface DistributionItem {
  label: string;
  value: number;
  color: 'emerald' | 'blue' | 'purple' | 'amber' | 'red' | 'cyan' | 'fuchsia' | 'white';
  icon?: string;
}

interface DistributionCardProps {
  title: string;
  items: DistributionItem[];
  total: number;
  icon?: string;
  footer?: {
    label: string;
    value: number | string;
    color?: string;
  }[];
}

const colorClasses = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500' },
  blue: { text: 'text-blue-400', bg: 'bg-blue-500' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-500' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500' },
  red: { text: 'text-red-400', bg: 'bg-red-500' },
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500' },
  fuchsia: { text: 'text-fuchsia-400', bg: 'bg-fuchsia-500' },
  white: { text: 'text-white/70', bg: 'bg-white/30' },
};

export function DistributionCard({
  title,
  items,
  total,
  icon,
  footer,
}: DistributionCardProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300">
      {/* Title */}
      <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h3>

      {/* Distribution Items */}
      <div className="space-y-3">
        {items.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          const colors = colorClasses[item.color];

          return (
            <div key={index} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {item.icon && <span className="text-xs">{item.icon}</span>}
                  <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${colors.text}`}>
                    {item.value}
                  </span>
                  <span className="text-[10px] text-white/40">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors.bg} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {footer && footer.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs">
          {footer.map((item, index) => (
            <div key={index}>
              <span className="text-white/60">{item.label}: </span>
              <span className={`font-medium ${item.color || 'text-white'}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
