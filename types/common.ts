export const TAB_KEYS = ['leads', 'pacientes', 'consultas', 'confirmaciones', 'metricas'] as const;

export type TabKey = (typeof TAB_KEYS)[number];
