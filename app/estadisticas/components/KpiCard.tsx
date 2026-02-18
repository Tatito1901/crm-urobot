'use client';

import { type ElementType } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: ElementType;
  trend?: string;
  tooltip?: string;
}

function formatValue(val: string | number) {
  if (typeof val === 'number') {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toLocaleString('es-MX');
  }
  return val;
}

export function KpiCard({ title, value, subtext, icon: Icon, trend, tooltip }: KpiCardProps) {
  return (
    <div 
      className="bg-card dark:bg-white/[0.03] border border-border dark:border-white/[0.06] rounded-xl p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden shadow-sm hover:border-primary/50 transition-all min-h-[110px] sm:min-h-[140px] shine-top"
      title={tooltip}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 sm:p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-lg shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-emerald-500/20 shrink-0">
            <ArrowUpRight className="w-3 h-3" />
            <span className="hidden sm:inline">{trend}</span>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="text-muted-foreground text-[10px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-widest mb-1 truncate">{title}</h3>
        <div className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1 tracking-tight truncate font-jakarta">{formatValue(value)}</div>
        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">{subtext}</p>
      </div>
    </div>
  );
}
