/**
 * ============================================================
 * PATIENT SIDEBAR - Panel izquierdo con datos del paciente
 * ============================================================
 * Similar a Doctoralia: muestra información del paciente
 * y opciones para gestionar su información médica
 */

'use client';

import React, { useState } from 'react';
import { Phone, Mail, Calendar, AlertCircle, Pill, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import type { PacienteDetallado, InformacionMedica } from '@/types/pacientes';

interface PatientSidebarProps {
  paciente: PacienteDetallado;
  onUpdateNotas?: (notas: string) => void;
  onUpdateInfoMedica?: (info: InformacionMedica) => void;
}

export const PatientSidebar: React.FC<PatientSidebarProps> = ({ 
  paciente, 
  onUpdateNotas,
}) => {
  const [showMedicalInfo, setShowMedicalInfo] = useState(true);
  const [isEditingNotas, setIsEditingNotas] = useState(false);
  const [notas, setNotas] = useState(paciente.notas || '');

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <aside className="w-full lg:w-[320px] h-full bg-white dark:bg-[#0f1623] border-r border-slate-200 dark:border-blue-900/20 flex flex-col overflow-y-auto transition-colors">
      {/* Header con avatar y nombre */}
      <div className="p-6 border-b border-slate-200 dark:border-blue-900/20">
        {/* Avatar circular con iniciales */}
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-2xl font-bold text-white">{getInitials(paciente.nombre)}</span>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{paciente.nombre}</h2>
            <p className="text-sm text-slate-500 dark:text-blue-300/60 font-medium">N° {paciente.pacienteId}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 dark:bg-blue-950/30 dark:border-blue-900/30 dark:hover:bg-blue-900/40 dark:text-blue-200 transition-all"
            title="Enviar mensaje"
          >
            <Mail className="h-4 w-4" />
          </button>
          <button
            className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 dark:bg-blue-950/30 dark:border-blue-900/30 dark:hover:bg-blue-900/40 dark:text-blue-200 transition-all"
            title="Ver calendario"
          >
            <Calendar className="h-4 w-4" />
          </button>
          <button
            className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 dark:bg-blue-950/30 dark:border-blue-900/30 dark:hover:bg-blue-900/40 dark:text-blue-200 transition-all"
            title="Descargar historial"
          >
            <FileText className="h-4 w-4" />
          </button>
        </div>

        {/* Información de contacto */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm group cursor-pointer">
            <div className="p-1.5 rounded-md bg-slate-100 dark:bg-blue-950/30 text-slate-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
              <Phone className="h-3.5 w-3.5" />
            </div>
            <a href={`tel:${paciente.telefono}`} className="text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-white transition-colors font-medium">
              {paciente.telefono}
            </a>
          </div>
          {paciente.email && (
            <div className="flex items-center gap-3 text-sm group cursor-pointer">
              <div className="p-1.5 rounded-md bg-slate-100 dark:bg-blue-950/30 text-slate-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                <Mail className="h-3.5 w-3.5" />
              </div>
              <a href={`mailto:${paciente.email}`} className="text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-white transition-colors font-medium truncate">
                {paciente.email}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Notas */}
      <div className="p-4 border-b border-slate-200 dark:border-blue-900/20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-blue-300/70">Notas Privadas</h3>
          {!isEditingNotas && (
            <button
              onClick={() => setIsEditingNotas(true)}
              className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded"
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
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0a0f18] border border-slate-200 dark:border-blue-900/30 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[80px] resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveNotas}
                className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setIsEditingNotas(false);
                  setNotas(paciente.notas || '');
                }}
                className="flex-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0a0f18] border border-slate-100 dark:border-blue-900/10">
            <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">
              {paciente.notas || 'Sin notas registradas.'}
            </p>
          </div>
        )}
      </div>

      {/* Información médica */}
      <div className="flex-1">
        <button
          onClick={() => setShowMedicalInfo(!showMedicalInfo)}
          className="w-full px-4 py-3 flex items-center justify-between bg-white dark:bg-[#0f1623] hover:bg-slate-50 dark:hover:bg-[#131b2b] transition-colors border-b border-slate-200 dark:border-blue-900/20"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-blue-300/70">Ficha Médica</h3>
          {showMedicalInfo ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {showMedicalInfo && (
          <div className="p-4 space-y-5">
            {/* Alergias */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Alergias</h4>
              </div>
              {paciente.informacionMedica?.alergias && paciente.informacionMedica.alergias.length > 0 ? (
                <ul className="space-y-1.5">
                  {paciente.informacionMedica.alergias.map((alergia, index) => (
                    <li key={index} className="text-sm text-slate-600 dark:text-slate-400 pl-5 relative before:absolute before:left-1.5 before:top-2 before:w-1 before:h-1 before:rounded-full before:bg-rose-400">{alergia}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 pl-5">No registra alergias conocidas</p>
              )}
            </div>

            {/* Medicación */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Pill className="h-3.5 w-3.5 text-blue-500" />
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Medicación Actual</h4>
              </div>
              {paciente.informacionMedica?.medicacionActual && paciente.informacionMedica.medicacionActual.length > 0 ? (
                <ul className="space-y-1.5">
                  {paciente.informacionMedica.medicacionActual.map((med, index) => (
                    <li key={index} className="text-sm text-slate-600 dark:text-slate-400 pl-5 relative before:absolute before:left-1.5 before:top-2 before:w-1 before:h-1 before:rounded-full before:bg-blue-400">{med}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 pl-5">No registra medicación activa</p>
              )}
            </div>

            {/* Antecedentes médicos */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-3.5 w-3.5 text-emerald-500" />
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Antecedentes</h4>
              </div>
              {paciente.informacionMedica?.antecedentes && paciente.informacionMedica.antecedentes.length > 0 ? (
                <ul className="space-y-1.5">
                  {paciente.informacionMedica.antecedentes.map((antecedente, index) => (
                    <li key={index} className="text-sm text-slate-600 dark:text-slate-400 pl-5 relative before:absolute before:left-1.5 before:top-2 before:w-1 before:h-1 before:rounded-full before:bg-emerald-400">{antecedente}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 pl-5">Sin antecedentes relevantes</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer con metadata */}
      <div className="p-4 border-t border-slate-200 dark:border-blue-900/20 bg-slate-50 dark:bg-[#0a0f18]">
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[10px] sm:text-xs">
          <div>
            <p className="text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Registro</p>
            <p className="text-slate-700 dark:text-slate-300 font-medium">{formatDate(paciente.fechaRegistro)}</p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Fuente</p>
            <p className="text-slate-700 dark:text-slate-300 font-medium truncate">{paciente.fuenteOriginal}</p>
          </div>
          <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-blue-900/20 mt-1 flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Total de consultas</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full font-bold">
              {paciente.totalConsultas}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
