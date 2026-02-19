'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Building2,
  Clock,
  MapPin,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  CalendarRange,
  Pencil,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { cards, accentColors } from '@/app/lib/design-system';
import type { Sede, HorarioJson, DiaSemana, Turno } from '@/types/sedes';
import { DIAS_SEMANA, DIAS_LABELS, EMPTY_HORARIO_DIA } from '@/types/sedes';

// ─── Constants ────────────────────────────────────────────────────────────────
const DIA_SHORT: Record<DiaSemana, string> = {
  lunes: 'LUN', martes: 'MAR', miercoles: 'MIÉ',
  jueves: 'JUE', viernes: 'VIE', sabado: 'SÁB', domingo: 'DOM',
};

type WeekType = 'weekA' | 'weekB';

// ─── Sub-components ───────────────────────────────────────────────────────────

function TimeRangePill({
  turno, index, dia, onUpdate, onRemove,
}: {
  turno: Turno; index: number; dia: DiaSemana;
  onUpdate: (dia: DiaSemana, idx: number, field: 0 | 1, val: string) => void;
  onRemove: (dia: DiaSemana, idx: number) => void;
}) {
  return (
    <div className="group/pill flex items-center gap-1">
      <div className={cn(
        'flex items-center gap-1 rounded-lg border px-2.5 py-1.5 transition-all duration-200',
        'border-border bg-muted/40 hover:border-teal-500/40 hover:bg-teal-500/5',
      )}>
        <input
          type="time"
          value={turno[0]}
          onChange={(e) => onUpdate(dia, index, 0, e.target.value)}
          className="w-[76px] bg-transparent text-[13px] font-mono font-medium text-teal-400 outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute"
        />
        <span className="text-muted-foreground text-[11px] font-medium mx-0.5">→</span>
        <input
          type="time"
          value={turno[1]}
          onChange={(e) => onUpdate(dia, index, 1, e.target.value)}
          className="w-[76px] bg-transparent text-[13px] font-mono font-medium text-teal-400 outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute"
        />
      </div>
      <button
        onClick={() => onRemove(dia, index)}
        aria-label="Eliminar turno"
        className={cn(
          'h-7 w-7 flex items-center justify-center rounded-md transition-all duration-150 cursor-pointer',
          'text-muted-foreground/40 opacity-0 group-hover/pill:opacity-100',
          'hover:text-rose-400 hover:bg-rose-500/10',
        )}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

function DayRow({
  dia, turnos, onAdd, onUpdate, onRemove,
}: {
  dia: DiaSemana; turnos: Turno[];
  onAdd: (dia: DiaSemana) => void;
  onUpdate: (dia: DiaSemana, idx: number, field: 0 | 1, val: string) => void;
  onRemove: (dia: DiaSemana, idx: number) => void;
}) {
  const active = turnos.length > 0;
  return (
    <div className={cn(
      'group grid grid-cols-[72px_1fr_36px] items-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
      active
        ? 'bg-muted/30 border border-border'
        : 'border border-transparent hover:bg-muted/15 hover:border-border/50',
    )}>
      {/* Day label */}
      <div className="pt-1.5 select-none">
        <span className={cn(
          'text-[11px] font-bold tracking-widest font-mono',
          active ? 'text-foreground' : 'text-muted-foreground/50',
        )}>
          {DIA_SHORT[dia]}
        </span>
        <p className={cn(
          'text-[10px] leading-tight mt-0.5',
          active ? 'text-muted-foreground' : 'text-muted-foreground/30',
        )}>
          {DIAS_LABELS[dia]}
        </p>
      </div>

      {/* Turnos */}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {turnos.length === 0 ? (
          <span className="text-[11px] text-muted-foreground/30 italic pt-1.5 select-none">
            Sin consulta
          </span>
        ) : (
          turnos.map((turno, idx) => (
            <TimeRangePill
              key={idx}
              turno={turno}
              index={idx}
              dia={dia}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))
        )}
      </div>

      {/* Add button */}
      <button
        onClick={() => onAdd(dia)}
        aria-label="Agregar turno"
        className={cn(
          'mt-1 h-7 w-7 flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer',
          'border border-dashed border-border/60 text-muted-foreground/30',
          'hover:border-teal-500/50 hover:text-teal-400 hover:bg-teal-500/10',
          'opacity-0 group-hover:opacity-100',
          !active && 'opacity-60',
        )}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ScheduleEditorProps {
  sede: Sede;
  onSave: (sedeId: string, horario: HorarioJson) => Promise<{ success: boolean; error?: string }>;
  onSaveInfo: (sedeId: string, info: {
    displayName?: string; direccion?: string;
    instruccionesLlegada?: string; anchorDate?: string; anchorWeekType?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function ScheduleEditor({ sede, onSave, onSaveInfo }: ScheduleEditorProps) {
  const [horario, setHorario] = useState<HorarioJson>(
    sede.horarioJson || { weekA: { ...EMPTY_HORARIO_DIA }, weekB: { ...EMPTY_HORARIO_DIA } }
  );
  const [activeWeek, setActiveWeek] = useState<WeekType>('weekA');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Info fields
  const [displayName, setDisplayName] = useState(sede.displayName);
  const [direccion, setDireccion] = useState(sede.direccion);
  const [instrucciones, setInstrucciones] = useState(sede.instruccionesLlegada || '');
  const [anchorDate, setAnchorDate] = useState(sede.anchorDate || '');
  const [anchorWeekType, setAnchorWeekType] = useState(sede.anchorWeekType || 'A');

  const currentWeekData = horario[activeWeek];

  const weeksAreIdentical = useMemo(() => {
    return JSON.stringify(horario.weekA) === JSON.stringify(horario.weekB);
  }, [horario]);

  const activeDaysCount = useMemo(() =>
    DIAS_SEMANA.filter(dia => currentWeekData[dia].length > 0).length
  , [currentWeekData]);

  // ─── Handlers ─────────────────────────────────────────────────────────
  const markDirty = () => setSaveStatus('idle');

  const addTurno = useCallback((dia: DiaSemana) => {
    setHorario(prev => ({
      ...prev,
      [activeWeek]: {
        ...prev[activeWeek],
        [dia]: [...prev[activeWeek][dia], ['09:00', '14:00'] as Turno],
      },
    }));
    markDirty();
  }, [activeWeek]);

  const removeTurno = useCallback((dia: DiaSemana, index: number) => {
    setHorario(prev => ({
      ...prev,
      [activeWeek]: {
        ...prev[activeWeek],
        [dia]: prev[activeWeek][dia].filter((_: Turno, i: number) => i !== index),
      },
    }));
    markDirty();
  }, [activeWeek]);

  const updateTurno = useCallback((dia: DiaSemana, index: number, field: 0 | 1, value: string) => {
    setHorario(prev => {
      const newTurnos = [...prev[activeWeek][dia]];
      const newTurno = [...newTurnos[index]] as Turno;
      newTurno[field] = value;
      newTurnos[index] = newTurno;
      return {
        ...prev,
        [activeWeek]: { ...prev[activeWeek], [dia]: newTurnos },
      };
    });
    markDirty();
  }, [activeWeek]);

  const copyWeekAtoB = useCallback(() => {
    setHorario(prev => ({
      ...prev,
      weekB: JSON.parse(JSON.stringify(prev.weekA)),
    }));
    markDirty();
  }, []);

  const handleSaveHorario = async () => {
    setSaving(true);
    setSaveStatus('idle');
    setSaveError(null);
    const result = await onSave(sede.id, horario);
    if (result.success) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
      setSaveError(result.error || 'Error al guardar');
    }
    setSaving(false);
  };

  const handleSaveInfo = async () => {
    setSaving(true);
    const result = await onSaveInfo(sede.id, {
      displayName, direccion,
      instruccionesLlegada: instrucciones,
      anchorDate: anchorDate || undefined,
      anchorWeekType: anchorWeekType || undefined,
    });
    if (result.success) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
      setSaveError(result.error || 'Error al guardar');
    }
    setSaving(false);
  };

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className={cn(cards.glass, 'overflow-visible')}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-border px-4 sm:px-5 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            accentColors.primary.bg,
          )}>
            <Building2 className={cn('h-4.5 w-4.5', accentColors.primary.text)} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">{sede.displayName}</h3>
            <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {sede.direccion || 'Sin dirección'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full',
            activeDaysCount > 0
              ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
              : 'bg-muted text-muted-foreground border border-border',
          )}>
            <Clock className="h-3 w-3" />
            {activeDaysCount} días
          </span>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={cn(
              'h-7 px-2 flex items-center gap-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer',
              showInfo
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            )}
          >
            <Pencil className="h-3 w-3" />
            <span className="hidden sm:inline">Info</span>
            {showInfo ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* ── Info Panel (collapsible) ── */}
      {showInfo && (
        <div className="border-b border-border bg-muted/20 px-4 sm:px-5 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Nombre</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Hospital Ángeles Polanco" className="text-sm h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Dirección</Label>
              <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Av. Ejército Nacional 613..." className="text-sm h-9" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[11px] text-muted-foreground">Instrucciones de llegada</Label>
              <Textarea value={instrucciones} onChange={(e) => setInstrucciones(e.target.value)} placeholder="Consultorio 710, Torre de consultorios..." className="text-sm min-h-[56px] resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Fecha ancla (A/B)</Label>
              <Input type="date" value={anchorDate} onChange={(e) => setAnchorDate(e.target.value)} className="text-sm h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Tipo semana ancla</Label>
              <select
                value={anchorWeekType}
                onChange={(e) => setAnchorWeekType(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm h-9 cursor-pointer"
              >
                <option value="A">Semana A</option>
                <option value="B">Semana B</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={handleSaveInfo} disabled={saving} className="text-xs h-8">
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Guardar info
            </Button>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="px-4 sm:px-5 py-4 space-y-4">
        {/* Week Selector */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 p-1">
            {(['weekA', 'weekB'] as const).map((week) => (
              <button
                key={week}
                onClick={() => setActiveWeek(week)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer',
                  activeWeek === week
                    ? 'bg-background text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <CalendarRange className="h-3.5 w-3.5" />
                Semana {week === 'weekA' ? 'A' : 'B'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {weeksAreIdentical && (
              <span className="text-[11px] text-muted-foreground/60 font-mono">A = B</span>
            )}
            {activeWeek === 'weekB' && !weeksAreIdentical && (
              <Button variant="ghost" size="sm" onClick={copyWeekAtoB} className="text-xs h-7 px-2">
                <Copy className="h-3 w-3 mr-1" />
                Copiar A → B
              </Button>
            )}
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="space-y-1">
          {DIAS_SEMANA.map((dia) => (
            <DayRow
              key={dia}
              dia={dia}
              turnos={currentWeekData[dia]}
              onAdd={addTurno}
              onUpdate={updateTurno}
              onRemove={removeTurno}
            />
          ))}
        </div>

        {/* Save Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2 min-h-[28px]">
            {saveStatus === 'success' && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 animate-in fade-in duration-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Guardado
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1.5 text-xs text-rose-400 animate-in fade-in duration-300">
                <AlertCircle className="h-3.5 w-3.5" />
                {saveError}
              </span>
            )}
          </div>
          <Button
            onClick={handleSaveHorario}
            disabled={saving}
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 px-4"
          >
            {saving ? (
              <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1.5" />
            )}
            Guardar horarios
          </Button>
        </div>
      </div>
    </div>
  );
}
