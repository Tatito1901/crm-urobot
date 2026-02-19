'use client';

import React from 'react';
import { Flame, ThermometerSun, Snowflake } from 'lucide-react';

// ── Section Header ──────────────────────────────────────────

export function SectionHeader({ label }: { icon?: React.ReactNode; label: string }) {
  return (
    <div className="mb-3">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

// ── Stat Pill (Pipeline summary) ────────────────────────────

export function StatPill({ label, value, variant }: { label: string; value: number; variant?: 'emerald' | 'blue' }) {
  const colors = {
    emerald: 'bg-emerald-500/15 text-emerald-400',
    blue: 'bg-sky-500/15 text-sky-400',
  };
  const valueColor = variant ? colors[variant].split(' ').slice(1).join(' ') : 'text-foreground';
  const bgColor = variant ? colors[variant].split(' ')[0] : 'bg-muted/50';
  
  return (
    <div className={`rounded-lg ${bgColor} p-2 sm:p-3 text-center`}>
      <div className={`text-xs font-medium uppercase ${variant ? valueColor : 'text-muted-foreground'}`}>{label}</div>
      <div className={`text-lg sm:text-xl font-bold tabular-nums ${valueColor}`}>{value}</div>
    </div>
  );
}

// ── Mini Stat (Bot performance row) ─────────────────────────

export function MiniStat({ icon, label, value, suffix, loading }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  suffix?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">{label}</p>
        {loading ? (
          <div className="h-5 w-10 mt-0.5 bg-muted rounded animate-pulse" />
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-bold tabular-nums text-foreground">{value}</span>
            {suffix && <span className="text-[10px] text-muted-foreground truncate">{suffix}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Temperature Dot ─────────────────────────────────────────

const TEMP_COLORS: Record<string, string> = {
  caliente: 'bg-rose-500',
  tibio: 'bg-amber-500',
  frio: 'bg-cyan-500',
};

const TEMP_ICONS: Record<string, React.ReactNode> = {
  caliente: <Flame className="h-3.5 w-3.5 text-rose-500" />,
  tibio: <ThermometerSun className="h-3.5 w-3.5 text-amber-500" />,
  frio: <Snowflake className="h-3.5 w-3.5 text-cyan-500" />,
};

const TEMP_TITLES: Record<string, string> = {
  caliente: 'Lead caliente',
  tibio: 'Lead tibio',
  frio: 'Lead frío',
};

export function TemperatureDot({ temp }: { temp: string }) {
  return (
    <span
      className={`h-2 w-2 rounded-full shrink-0 ${TEMP_COLORS[temp] || 'bg-slate-400'}`}
      title={TEMP_TITLES[temp] || temp}
    />
  );
}

export function TemperatureIcon({ temp }: { temp: string }) {
  return TEMP_ICONS[temp] ? <>{TEMP_ICONS[temp]}</> : <span className="h-2 w-2 rounded-full bg-slate-400" />;
}
