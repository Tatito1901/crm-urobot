/**
 * ============================================================
 * PATIENT SIDEBAR - Panel izquierdo con datos del paciente
 * ============================================================
 * Similar a Doctoralia: muestra información del paciente
 * y opciones para gestionar su información médica
 */

'use client';

import React, { useState } from 'react';
import { Phone, Mail, Calendar, AlertCircle, Pill, FileText, ChevronDown, ChevronUp, Target, CheckCircle, Scissors, DollarSign, Plus } from 'lucide-react';
import { type PacienteDetallado } from '@/hooks/usePacienteDetallado';
import { DESTINO_LABELS, DESTINO_COLORS, type TipoDestino } from '@/types/destinos-pacientes';
import { DestinoPacienteModal } from './DestinoPacienteModal';

// Tipos locales para el sidebar (compatibilidad con UI existente)
interface InformacionMedica {
  alergias?: string[];
  medicamentos?: string[];
  condiciones?: string[];
}

interface PresupuestoUI {
  monto: number;
  tipoCirugia: string;
  fechaEnvio?: string;
  notas?: string;
}

interface CirugiaUI {
  tipoCirugia: string;
  costo: number;
  fechaCirugia?: string;
  sedeOperacion?: string;
  notas?: string;
}

interface DestinoPacienteUI {
  tipo: TipoDestino;
  fechaRegistro: string;
  observaciones?: string;
  motivoAlta?: string;
  presupuesto?: PresupuestoUI;
  cirugia?: CirugiaUI;
}

type DestinoPaciente = DestinoPacienteUI;

interface PatientSidebarProps {
  paciente: PacienteDetallado;
  onUpdateNotas?: (notas: string) => void;
  onUpdateInfoMedica?: (info: InformacionMedica) => void;
  onUpdateDestino?: (destino: DestinoPaciente) => void;
}

export const PatientSidebar: React.FC<PatientSidebarProps> = ({ 
  paciente, 
  onUpdateNotas,
  onUpdateDestino,
}) => {
  const [showMedicalInfo, setShowMedicalInfo] = useState(true);
  const [showDestino, setShowDestino] = useState(true);
  const [isEditingNotas, setIsEditingNotas] = useState(false);
  const [notas, setNotas] = useState(paciente.notas || '');
  const [isDestinoModalOpen, setIsDestinoModalOpen] = useState(false);
  
  // Convertir destino de BD a formato UI si existe
  const convertDestinoToUI = (): DestinoPaciente | undefined => {
    const destino = paciente.destinoActual;
    if (!destino) return undefined;
    return {
      tipo: destino.tipoDestino,
      fechaRegistro: destino.fechaRegistro || new Date().toISOString(),
      observaciones: destino.observaciones || undefined,
      motivoAlta: destino.motivoAlta || undefined,
      presupuesto: destino.tipoDestino === 'presupuesto_enviado' && destino.tipoCirugia ? {
        monto: destino.monto || 0,
        tipoCirugia: destino.tipoCirugia,
        fechaEnvio: destino.fechaEvento || undefined,
        notas: destino.notas || undefined,
      } : undefined,
      cirugia: destino.tipoDestino === 'cirugia_realizada' && destino.tipoCirugia ? {
        tipoCirugia: destino.tipoCirugia,
        costo: destino.monto || 0,
        fechaCirugia: destino.fechaEvento || undefined,
        sedeOperacion: destino.sedeOperacion || undefined,
        notas: destino.notas || undefined,
      } : undefined,
    };
  };
  
  const [destinoActual, setDestinoActual] = useState<DestinoPaciente | undefined>(convertDestinoToUI());

  const handleSaveDestino = (destino: DestinoPaciente) => {
    setDestinoActual(destino);
    onUpdateDestino?.(destino);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  const handleSaveNotas = () => {
    onUpdateNotas?.(notas);
    setIsEditingNotas(false);
  };

  // Obtener iniciales para el avatar
  const getInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'No registrada';
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <aside className="w-full lg:w-[320px] h-full bg-background border-r border-border flex flex-col overflow-y-auto transition-colors">
      {/* Header con avatar y nombre */}
      <div className="p-6 border-b border-border">
        {/* Avatar circular con iniciales */}
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-2xl font-bold text-primary-foreground">{getInitials(paciente.nombre || '')}</span>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground">{paciente.nombre}</h2>
            <p className="text-sm text-muted-foreground font-medium">N° {paciente.id.slice(0, 8)}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            className="p-2 rounded-lg bg-secondary/50 border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            title="Enviar mensaje"
          >
            <Mail className="h-4 w-4" />
          </button>
          <button
            className="p-2 rounded-lg bg-secondary/50 border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            title="Ver calendario"
          >
            <Calendar className="h-4 w-4" />
          </button>
          <button
            className="p-2 rounded-lg bg-secondary/50 border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            title="Descargar historial"
          >
            <FileText className="h-4 w-4" />
          </button>
        </div>

        {/* Información de contacto */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm group cursor-pointer">
            <div className="p-1.5 rounded-md bg-secondary text-muted-foreground group-hover:text-primary transition-colors">
              <Phone className="h-3.5 w-3.5" />
            </div>
            <a href={`tel:${paciente.telefono}`} className="text-muted-foreground group-hover:text-primary transition-colors font-medium">
              {paciente.telefono}
            </a>
          </div>
          {paciente.email && (
            <div className="flex items-center gap-3 text-sm group cursor-pointer">
              <div className="p-1.5 rounded-md bg-secondary text-muted-foreground group-hover:text-primary transition-colors">
                <Mail className="h-3.5 w-3.5" />
              </div>
              <a href={`mailto:${paciente.email}`} className="text-muted-foreground group-hover:text-primary transition-colors font-medium truncate">
                {paciente.email}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Destino del Paciente */}
      <div className="border-b border-border">
        <button
          onClick={() => setShowDestino(!showDestino)}
          className="w-full px-4 py-3 flex items-center justify-between bg-background hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Destino del Paciente</h3>
          </div>
          {showDestino ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {showDestino && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2.5 sm:space-y-3">
            {destinoActual ? (
              <>
                {/* Badge del tipo de destino */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${DESTINO_COLORS[destinoActual.tipo]} truncate max-w-[60%]`}>
                    {destinoActual.tipo === 'alta_definitiva' && <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />}
                    {destinoActual.tipo === 'presupuesto_enviado' && <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />}
                    {destinoActual.tipo === 'cirugia_realizada' && <Scissors className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />}
                    <span className="truncate">{DESTINO_LABELS[destinoActual.tipo]}</span>
                  </span>
                  <button
                    onClick={() => setIsDestinoModalOpen(true)}
                    className="text-[9px] sm:text-[10px] font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-1.5 sm:px-2 py-0.5 rounded shrink-0 transition-colors"
                  >
                    NUEVA ACCIÓN
                  </button>
                </div>

                {/* Detalles del presupuesto */}
                {destinoActual.presupuesto && (
                  <div className="p-2.5 sm:p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-amber-700 dark:text-amber-400">
                      <DollarSign className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold truncate">
                        {formatCurrency(destinoActual.presupuesto.monto)}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-amber-600 dark:text-amber-300 line-clamp-2">
                      <span className="font-medium">{destinoActual.presupuesto.tipoCirugia}</span>
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-amber-500 dark:text-amber-400/70">
                      Enviado: {formatDate(destinoActual.presupuesto.fechaEnvio)}
                    </p>
                    {destinoActual.presupuesto.notas && (
                      <p className="text-[10px] sm:text-xs text-amber-600/80 dark:text-amber-300/60 italic line-clamp-2">
                        {destinoActual.presupuesto.notas}
                      </p>
                    )}
                  </div>
                )}

                {/* Detalles de la cirugía realizada */}
                {destinoActual.cirugia && (
                  <div className="p-2.5 sm:p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-blue-700 dark:text-blue-400">
                      <Scissors className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold line-clamp-1">{destinoActual.cirugia.tipoCirugia}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-blue-600 dark:text-blue-300">
                      <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                      <span className="text-[11px] sm:text-xs font-medium truncate">
                        {formatCurrency(destinoActual.cirugia.costo)}
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-blue-500 dark:text-blue-400/70 line-clamp-1">
                      Fecha: {formatDate(destinoActual.cirugia.fechaCirugia)}
                      {destinoActual.cirugia.sedeOperacion && ` • ${destinoActual.cirugia.sedeOperacion}`}
                    </p>
                    {destinoActual.cirugia.notas && (
                      <p className="text-[10px] sm:text-xs text-blue-600/80 dark:text-blue-300/60 italic line-clamp-2">
                        {destinoActual.cirugia.notas}
                      </p>
                    )}
                  </div>
                )}

                {/* Alta definitiva */}
                {destinoActual.tipo === 'alta_definitiva' && destinoActual.motivoAlta && (
                  <div className="p-2.5 sm:p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30">
                    <p className="text-[11px] sm:text-xs text-emerald-700 dark:text-emerald-300 line-clamp-3">
                      {destinoActual.motivoAlta}
                    </p>
                  </div>
                )}

                {/* Observaciones */}
                {destinoActual.observaciones && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground italic line-clamp-2">
                    {destinoActual.observaciones}
                  </p>
                )}
              </>
            ) : (
              <button
                onClick={() => setIsDestinoModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-primary/5 hover:bg-primary/10 border border-dashed border-primary/30 rounded-lg text-primary text-xs sm:text-sm font-medium transition-colors"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Registrar Destino
              </button>
            )}

            {/* HISTORIAL DE DESTINOS (TIMELINE) */}
            {paciente.destinos && paciente.destinos.length > 1 && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Historial de Eventos</h4>
                <div className="space-y-0 relative pl-2">
                  {/* Línea vertical del timeline */}
                  <div className="absolute left-[11px] top-1 bottom-0 w-px bg-border"></div>
                  
                  {paciente.destinos.slice(1).map((destino) => (
                    <div key={destino.id} className="relative pl-6 pb-4 last:pb-0 group">
                      {/* Punto del timeline */}
                      <div className={`
                        absolute left-0 top-1 w-6 h-6 rounded-full border-2 bg-background flex items-center justify-center z-10
                        ${destino.tipoDestino === 'cirugia_realizada' ? 'border-blue-500 text-blue-500' : 
                          destino.tipoDestino === 'presupuesto_enviado' ? 'border-amber-500 text-amber-500' :
                          destino.tipoDestino === 'alta_definitiva' ? 'border-emerald-500 text-emerald-500' :
                          'border-muted-foreground text-muted-foreground'}
                      `}>
                        <div className={`w-2 h-2 rounded-full ${
                          destino.tipoDestino === 'cirugia_realizada' ? 'bg-blue-500' : 
                          destino.tipoDestino === 'presupuesto_enviado' ? 'bg-amber-500' :
                          destino.tipoDestino === 'alta_definitiva' ? 'bg-emerald-500' :
                          'bg-muted-foreground'
                        }`}></div>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-foreground">
                            {destino.label}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            {destino.fechaRegistro ? new Date(destino.fechaRegistro).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : ''}
                          </span>
                        </div>
                        
                        {destino.tipoCirugia && destino.monto && (
                          <p className="text-[10px] text-muted-foreground">
                            {destino.tipoCirugia} - {formatCurrency(destino.monto)}
                          </p>
                        )}

                        {destino.motivoAlta && (
                          <p className="text-[10px] text-muted-foreground italic line-clamp-1">
                            Alta: {destino.motivoAlta}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notas */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notas Privadas</h3>
          {!isEditingNotas && (
            <button
              onClick={() => setIsEditingNotas(true)}
              className="text-[10px] font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded transition-colors"
            >
              EDITAR
            </button>
          )}
        </div>
        {isEditingNotas ? (
          <div className="space-y-2">
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Agrega notas sobre el paciente..."
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveNotas}
                className="flex-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setIsEditingNotas(false);
                  setNotas(paciente.notas || '');
                }}
                className="flex-1 px-3 py-1.5 bg-muted hover:bg-accent text-muted-foreground hover:text-foreground text-xs font-medium rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              {paciente.notas || 'Sin notas registradas.'}
            </p>
          </div>
        )}
      </div>

      {/* Información médica */}
      <div className="flex-1">
        <button
          onClick={() => setShowMedicalInfo(!showMedicalInfo)}
          className="w-full px-4 py-3 flex items-center justify-between bg-background hover:bg-muted/30 transition-colors border-b border-border"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ficha Médica</h3>
          {showMedicalInfo ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {showMedicalInfo && (
          <div className="p-4 space-y-5">
            {/* Alergias */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                <h4 className="text-xs font-semibold text-foreground">Alergias</h4>
              </div>
              <p className="text-xs text-muted-foreground pl-5">No registra alergias conocidas</p>
            </div>

            {/* Medicación */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Pill className="h-3.5 w-3.5 text-blue-500" />
                <h4 className="text-xs font-semibold text-foreground">Medicación Actual</h4>
              </div>
              <p className="text-xs text-muted-foreground pl-5">No registra medicación activa</p>
            </div>

            {/* Antecedentes médicos */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-3.5 w-3.5 text-emerald-500" />
                <h4 className="text-xs font-semibold text-foreground">Antecedentes</h4>
              </div>
              <p className="text-xs text-muted-foreground pl-5">Sin antecedentes relevantes</p>
            </div>
            
            <p className="text-[10px] text-muted-foreground/60 italic text-center">
              Información médica no disponible en BD actual
            </p>
          </div>
        )}
      </div>

      {/* Footer con metadata */}
      <div className="p-4 border-t border-border bg-muted/10">
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[10px] sm:text-xs">
          <div>
            <p className="text-muted-foreground uppercase tracking-wider mb-0.5">Registro</p>
            <p className="text-foreground font-medium">{formatDate(paciente.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground uppercase tracking-wider mb-0.5">Fuente</p>
            <p className="text-foreground font-medium truncate">{paciente.origenLead || 'WhatsApp'}</p>
          </div>
          <div className="col-span-2 pt-2 border-t border-border mt-1 flex justify-between items-center">
            <span className="text-muted-foreground">Total de consultas</span>
            <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full font-bold">
              {paciente.totalConsultas}
            </span>
          </div>
        </div>
      </div>
      {/* Modal de Destino */}
      <DestinoPacienteModal
        isOpen={isDestinoModalOpen}
        onClose={() => setIsDestinoModalOpen(false)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSave={handleSaveDestino as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        destinoActual={destinoActual as any}
        pacienteNombre={paciente.nombre || ''}
      />
    </aside>
  );
};
