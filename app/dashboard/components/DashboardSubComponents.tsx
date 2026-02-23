import React from 'react';

// ── Section Header ──────────────────────────────────────────

export function SectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-3">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

// ── Temperature Dot ─────────────────────────────────────────

const TEMP_COLORS: Record<string, string> = {
  caliente: 'bg-rose-500',
  tibio: 'bg-amber-500',
  frio: 'bg-cyan-500',
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

