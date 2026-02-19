/**
 * ============================================================
 * CONFIGURACIÓN DE HORARIOS - Gestión de sedes y horarios del doctor
 * ============================================================
 * Permite al doctor modificar sus horarios por sede y semana (A/B)
 * Los cambios se reflejan automáticamente en el bot de WhatsApp (n8n)
 */

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
  CalendarDays,
  Info,
  CheckCircle2,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSedes } from '@/hooks/sedes/useSedes';
import { typography, spacing, cards } from '@/app/lib/design-system';
import { cn } from '@/lib/utils';
import type { Sede, HorarioJson, HorarioDia, DiaSemana, Turno } from '@/types/sedes';
import { DIAS_SEMANA, DIAS_LABELS, EMPTY_HORARIO_DIA } from '@/types/sedes';

// ============================================================
// SCHEDULE EDITOR COMPONENT (per sede)
// ============================================================

type WeekType = 'weekA' | 'weekB';

interface ScheduleEditorProps {
  sede: Sede;
  onSave: (sedeId: string, horario: HorarioJson) => Promise<{ success: boolean; error?: string }>;
  onSaveInfo: (sedeId: string, info: { displayName?: string; direccion?: string; instruccionesLlegada?: string; anchorDate?: string; anchorWeekType?: string }) => Promise<{ success: boolean; error?: string }>;
}

function ScheduleEditor({ sede, onSave, onSaveInfo }: ScheduleEditorProps) {
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

  // Check if weeks A and B are identical
  const weeksAreIdentical = useMemo(() => {
    return JSON.stringify(horario.weekA) === JSON.stringify(horario.weekB);
  }, [horario]);

  const addTurno = useCallback((dia: DiaSemana) => {
    setHorario(prev => ({
      ...prev,
      [activeWeek]: {
        ...prev[activeWeek],
        [dia]: [...prev[activeWeek][dia], ['09:00', '14:00'] as Turno],
      },
    }));
    setSaveStatus('idle');
  }, [activeWeek]);

  const removeTurno = useCallback((dia: DiaSemana, index: number) => {
    setHorario(prev => ({
      ...prev,
      [activeWeek]: {
        ...prev[activeWeek],
        [dia]: prev[activeWeek][dia].filter((_, i) => i !== index),
      },
    }));
    setSaveStatus('idle');
  }, [activeWeek]);

  const updateTurno = useCallback((dia: DiaSemana, index: number, field: 0 | 1, value: string) => {
    setHorario(prev => {
      const newTurnos = [...prev[activeWeek][dia]];
      const newTurno = [...newTurnos[index]] as Turno;
      newTurno[field] = value;
      newTurnos[index] = newTurno;
      return {
        ...prev,
        [activeWeek]: {
          ...prev[activeWeek],
          [dia]: newTurnos,
        },
      };
    });
    setSaveStatus('idle');
  }, [activeWeek]);

  const copyWeekAtoB = useCallback(() => {
    setHorario(prev => ({
      ...prev,
      weekB: JSON.parse(JSON.stringify(prev.weekA)),
    }));
    setSaveStatus('idle');
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
      displayName,
      direccion,
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

  // Count active days
  const activeDaysCount = DIAS_SEMANA.filter(dia => currentWeekData[dia].length > 0).length;

  return (
    <Card className={cn(cards.glass, 'overflow-visible')}>
      <CardHeader className="border-b border-border px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/15">
              <Building2 className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <CardTitle className={typography.sectionTitle}>{sede.displayName}</CardTitle>
              <CardDescription className={typography.metadata}>
                {sede.direccion}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {activeDaysCount} días activos
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInfo(!showInfo)}
              className="text-xs"
            >
              <Info className="h-3.5 w-3.5 mr-1" />
              Info
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-5">
        {/* Info Panel (collapsible) */}
        {showInfo && (
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <h4 className={cn(typography.cardTitle, 'flex items-center gap-2')}>
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Información de la sede
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Nombre de display</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Hospital Ángeles Polanco"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Dirección</Label>
                <Input
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Av. Ejército Nacional 613..."
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Instrucciones de llegada</Label>
                <Textarea
                  value={instrucciones}
                  onChange={(e) => setInstrucciones(e.target.value)}
                  placeholder="Consultorio 710, Torre de consultorios..."
                  className="text-sm min-h-[60px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Fecha ancla (Semana A/B)</Label>
                <Input
                  type="date"
                  value={anchorDate}
                  onChange={(e) => setAnchorDate(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo de semana ancla</Label>
                <select
                  value={anchorWeekType}
                  onChange={(e) => setAnchorWeekType(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="A">Semana A</option>
                  <option value="B">Semana B</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleSaveInfo} disabled={saving} className="text-xs">
                <Save className="h-3.5 w-3.5 mr-1" />
                Guardar info
              </Button>
            </div>
          </div>
        )}

        {/* Week Selector */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
            <button
              onClick={() => setActiveWeek('weekA')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                activeWeek === 'weekA'
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <CalendarDays className="h-3.5 w-3.5 inline mr-1.5" />
              Semana A
            </button>
            <button
              onClick={() => setActiveWeek('weekB')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                activeWeek === 'weekB'
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <CalendarDays className="h-3.5 w-3.5 inline mr-1.5" />
              Semana B
            </button>
          </div>

          <div className="flex items-center gap-2">
            {weeksAreIdentical && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                A = B (idénticas)
              </Badge>
            )}
            {activeWeek === 'weekB' && !weeksAreIdentical && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyWeekAtoB}
                className="text-xs"
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copiar Semana A → B
              </Button>
            )}
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="space-y-2">
          {DIAS_SEMANA.map((dia) => {
            const turnos = currentWeekData[dia];
            const hasTurnos = turnos.length > 0;

            return (
              <div
                key={dia}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3 transition-colors',
                  hasTurnos
                    ? 'border-border bg-background'
                    : 'border-border/50 bg-muted/20'
                )}
              >
                {/* Day label */}
                <div className="w-24 shrink-0 pt-1.5">
                  <span className={cn(
                    'text-sm font-medium',
                    hasTurnos ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {DIAS_LABELS[dia]}
                  </span>
                </div>

                {/* Turnos */}
                <div className="flex-1 space-y-2">
                  {turnos.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic pt-1.5 block">
                      Sin consulta
                    </span>
                  ) : (
                    turnos.map((turno, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={turno[0]}
                          onChange={(e) => updateTurno(dia, idx, 0, e.target.value)}
                          className="w-[120px] text-sm h-8"
                        />
                        <span className="text-muted-foreground text-xs">a</span>
                        <Input
                          type="time"
                          value={turno[1]}
                          onChange={(e) => updateTurno(dia, idx, 1, e.target.value)}
                          className="w-[120px] text-sm h-8"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTurno(dia, idx)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add turno button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addTurno(dia)}
                  className="h-8 w-8 p-0 shrink-0 text-muted-foreground hover:text-teal-400 mt-0.5"
                  title="Agregar turno"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            {saveStatus === 'success' && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 animate-in fade-in duration-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Horarios guardados
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
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar horarios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function HorariosPage() {
  const { sedes, loading, error, refetch, updateHorario, updateInfo } = useSedes();

  const handleSaveHorario = useCallback(async (sedeId: string, horarioJson: HorarioJson) => {
    return updateHorario({ sedeId, horarioJson });
  }, [updateHorario]);

  const handleSaveInfo = useCallback(async (sedeId: string, info: { displayName?: string; direccion?: string; instruccionesLlegada?: string; anchorDate?: string; anchorWeekType?: string }) => {
    return updateInfo({ sedeId, ...info });
  }, [updateInfo]);

  return (
    <div className={cn(spacing.container, spacing.containerY, 'max-w-5xl mx-auto')}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={typography.pageTitle}>Horarios del Doctor</h1>
          <p className={typography.pageSubtitle}>
            Configura los horarios de consulta por sede. Los cambios se reflejan en el bot de WhatsApp.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="shrink-0"
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Recargar
        </Button>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 mb-6 flex items-start gap-3">
        <Info className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm text-foreground font-medium">
            Semanas A y B alternantes
          </p>
          <p className="text-xs text-muted-foreground">
            El sistema alterna automáticamente entre Semana A y Semana B usando la fecha ancla.
            Si ambas semanas son iguales, el horario se repite cada semana sin alternancia.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className={cn(cards.glass, 'animate-pulse')}>
              <CardHeader className="border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-40 rounded bg-muted" />
                    <div className="h-3 w-64 rounded bg-muted" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-10 rounded-lg bg-muted/50" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className={cn(cards.glass, 'border-rose-500/20')}>
          <CardContent className="p-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-400" />
            <div>
              <p className="text-sm font-medium text-rose-400">Error al cargar sedes</p>
              <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-auto">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sede Editors */}
      {!loading && !error && sedes.length === 0 && (
        <Card className={cards.glass}>
          <CardContent className="p-8 text-center">
            <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No hay sedes configuradas</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {sedes.map((sede) => (
            <ScheduleEditor
              key={sede.id}
              sede={sede}
              onSave={handleSaveHorario}
              onSaveInfo={handleSaveInfo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
