/**
 * ============================================================
 * DESTINO PACIENTE MODAL
 * ============================================================
 * Modal para registrar el destino del paciente:
 * - Alta definitiva
 * - Presupuesto enviado para cirugía
 * - Cirugía realizada
 * - Seguimiento
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, FileText, Scissors, Clock, DollarSign, MapPin, AlertCircle, Save } from 'lucide-react';
import type { 
  DestinoPaciente, 
  TipoDestino, 
  PresupuestoCirugia, 
  CirugiaRealizada 
} from '@/types/pacientes';
import { 
  TIPOS_DESTINO, 
  TIPOS_CIRUGIA, 
  DESTINO_LABELS 
} from '@/types/pacientes';

interface DestinoPacienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (destino: DestinoPaciente) => void;
  destinoActual?: DestinoPaciente;
  pacienteNombre: string;
}

export const DestinoPacienteModal: React.FC<DestinoPacienteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  destinoActual,
  pacienteNombre,
}) => {
  const [tipoDestino, setTipoDestino] = useState<TipoDestino>('pendiente');
  const [observaciones, setObservaciones] = useState('');
  
  // Estado para Alta
  const [motivoAlta, setMotivoAlta] = useState('');
  
  // Estado para Presupuesto
  const [presupuesto, setPresupuesto] = useState<Partial<PresupuestoCirugia>>({
    moneda: 'MXN',
    fechaEnvio: new Date().toISOString().split('T')[0]
  });
  
  // Estado para Cirugía
  const [cirugia, setCirugia] = useState<Partial<CirugiaRealizada>>({
    moneda: 'MXN',
    fechaCirugia: new Date().toISOString().split('T')[0],
    sedeOperacion: 'Polanco'
  });

  // Cargar datos existentes al abrir
  useEffect(() => {
    if (isOpen && destinoActual) {
      setTipoDestino(destinoActual.tipo);
      setObservaciones(destinoActual.observaciones || '');
      
      if (destinoActual.motivoAlta) {
        setMotivoAlta(destinoActual.motivoAlta);
      }
      
      if (destinoActual.presupuesto) {
        setPresupuesto(destinoActual.presupuesto);
      }
      
      if (destinoActual.cirugia) {
        setCirugia(destinoActual.cirugia);
      }
    } else if (isOpen) {
      // Resetear al abrir como nuevo
      setTipoDestino('pendiente');
      setObservaciones('');
      setMotivoAlta('');
      setPresupuesto({ moneda: 'MXN', fechaEnvio: new Date().toISOString().split('T')[0] });
      setCirugia({ moneda: 'MXN', fechaCirugia: new Date().toISOString().split('T')[0], sedeOperacion: 'Polanco' });
    }
  }, [isOpen, destinoActual]);

  const handleSave = () => {
    const destino: DestinoPaciente = {
      tipo: tipoDestino,
      fechaRegistro: new Date().toISOString(),
      observaciones: observaciones || undefined,
    };

    if (tipoDestino === 'alta_definitiva' && motivoAlta) {
      destino.motivoAlta = motivoAlta;
    }

    if (tipoDestino === 'presupuesto_enviado' && presupuesto.tipoCirugia) {
      // Validación básica
      if (!presupuesto.monto) {
        alert('Por favor ingresa el monto del presupuesto');
        return;
      }
      destino.presupuesto = presupuesto as PresupuestoCirugia;
    }

    if (tipoDestino === 'cirugia_realizada' && cirugia.tipoCirugia) {
      // Validación básica
      if (!cirugia.costo) {
        alert('Por favor ingresa el costo de la cirugía');
        return;
      }
      destino.cirugia = cirugia as CirugiaRealizada;
    }

    onSave(destino);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Window */}
      <div className="relative w-full sm:max-w-2xl md:max-w-3xl bg-white dark:bg-[#0f1623] sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-200 dark:border-blue-900/30 flex flex-col max-h-[92vh] sm:max-h-[88vh] transition-transform animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-blue-900/20 shrink-0">
          <div className="min-w-0 flex-1 mr-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TargetIcon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 shrink-0" />
              <span className="truncate">Destino del Paciente</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
              Registrar resultado para <span className="font-medium text-slate-700 dark:text-slate-300">{pacienteNombre}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          
          {/* Selección de Tipo */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            {TIPOS_DESTINO.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setTipoDestino(tipo)}
                className={`
                  relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 gap-1.5 sm:gap-2 min-h-[80px] sm:min-h-[90px]
                  ${tipoDestino === tipo 
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-600/10 dark:border-blue-500' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                `}
              >
                <div className={`
                  p-1.5 sm:p-2 rounded-full shrink-0
                  ${tipoDestino === tipo ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}
                `}>
                  <div className="h-4 w-4 sm:h-5 sm:w-5">
                    {getIconForType(tipo)}
                  </div>
                </div>
                <span className={`text-[10px] sm:text-xs font-bold text-center leading-tight ${tipoDestino === tipo ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
                  {DESTINO_LABELS[tipo]}
                </span>
                {tipoDestino === tipo && (
                  <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Formularios Condicionales */}
          <div className="bg-slate-50 dark:bg-[#131b2b] rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-100 dark:border-blue-900/10 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Formulario Alta Definitiva */}
            {tipoDestino === 'alta_definitiva' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <h3 className="font-semibold">Detalles del Alta</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Motivo del Alta</label>
                  <textarea
                    value={motivoAlta}
                    onChange={(e) => setMotivoAlta(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[100px]"
                    placeholder="Describa el motivo del alta médica..."
                  />
                </div>
              </div>
            )}

            {/* Formulario Presupuesto Enviado */}
            {tipoDestino === 'presupuesto_enviado' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                  <FileText className="h-5 w-5" />
                  <h3 className="font-semibold">Detalles del Presupuesto</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tipo de Cirugía</label>
                    <select
                      value={presupuesto.tipoCirugia || ''}
                      onChange={(e) => setPresupuesto({ ...presupuesto, tipoCirugia: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    >
                      <option value="">Seleccionar cirugía...</option>
                      {TIPOS_CIRUGIA.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Monto (MXN)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="number"
                        value={presupuesto.monto || ''}
                        onChange={(e) => setPresupuesto({ ...presupuesto, monto: Number(e.target.value) })}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Fecha de Envío</label>
                    <input
                      type="date"
                      value={presupuesto.fechaEnvio}
                      onChange={(e) => setPresupuesto({ ...presupuesto, fechaEnvio: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Notas del Presupuesto</label>
                    <textarea
                      value={presupuesto.notas || ''}
                      onChange={(e) => setPresupuesto({ ...presupuesto, notas: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all min-h-[80px]"
                      placeholder="Incluye hospitalización, honorarios..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Formulario Cirugía Realizada */}
            {tipoDestino === 'cirugia_realizada' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                  <Scissors className="h-5 w-5" />
                  <h3 className="font-semibold">Detalles de la Cirugía</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Cirugía Realizada</label>
                    <select
                      value={cirugia.tipoCirugia || ''}
                      onChange={(e) => setCirugia({ ...cirugia, tipoCirugia: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      <option value="">Seleccionar cirugía...</option>
                      {TIPOS_CIRUGIA.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Costo Final (MXN)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="number"
                        value={cirugia.costo || ''}
                        onChange={(e) => setCirugia({ ...cirugia, costo: Number(e.target.value) })}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Fecha Cirugía</label>
                    <input
                      type="date"
                      value={cirugia.fechaCirugia}
                      onChange={(e) => setCirugia({ ...cirugia, fechaCirugia: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Sede</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={cirugia.sedeOperacion || ''}
                        onChange={(e) => setCirugia({ ...cirugia, sedeOperacion: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="Ej: Polanco, Satélite..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Notas de Cirugía</label>
                    <textarea
                      value={cirugia.notas || ''}
                      onChange={(e) => setCirugia({ ...cirugia, notas: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[80px]"
                      placeholder="Complicaciones, observaciones post-op..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mensajes para otros estados */}
            {tipoDestino === 'seguimiento' && (
              <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                <Clock className="h-5 w-5 mt-0.5 text-blue-500" />
                <p className="text-sm">El paciente continuará en seguimiento regular. Use el campo de observaciones para detallar el plan.</p>
              </div>
            )}

            {tipoDestino === 'pendiente' && (
              <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                <AlertCircle className="h-5 w-5 mt-0.5 text-amber-500" />
                <p className="text-sm">El estado del paciente está pendiente de definición. Puede agregar notas temporales abajo.</p>
              </div>
            )}
          </div>

          {/* Observaciones Generales */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Observaciones Generales</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#131b2b] border border-slate-200 dark:border-blue-900/30 rounded-lg text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[80px]"
              placeholder="Cualquier otra información relevante sobre el destino del paciente..."
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-blue-900/20 bg-slate-50 dark:bg-[#0f1623]/50 flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none sm:min-w-[120px] px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm order-2 sm:order-1"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 sm:flex-[2] px-4 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg sm:rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm order-1 sm:order-2"
          >
            <Save className="h-4 w-4" />
            Guardar Destino
          </button>
        </div>

      </div>
    </div>
  );
};

// Helper icons
function getIconForType(tipo: TipoDestino) {
  switch (tipo) {
    case 'alta_definitiva': return <CheckCircle className="w-full h-full" />;
    case 'presupuesto_enviado': return <FileText className="w-full h-full" />;
    case 'cirugia_realizada': return <Scissors className="w-full h-full" />;
    case 'seguimiento': return <Clock className="w-full h-full" />;
    case 'pendiente': return <AlertCircle className="w-full h-full" />;
  }
}

function TargetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
