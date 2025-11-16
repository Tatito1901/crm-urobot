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
    <aside className="w-full lg:w-[320px] h-full bg-gradient-to-b from-slate-900/60 to-slate-950/60 border-r-2 border-slate-700/50 flex flex-col overflow-y-auto">
      {/* Header con avatar y nombre */}
      <div className="p-6 border-b border-slate-800/40">
        {/* Avatar circular con iniciales */}
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{getInitials(paciente.nombre)}</span>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">{paciente.nombre}</h2>
            <p className="text-sm text-slate-400">N° {paciente.pacienteId}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 transition-colors"
            title="Enviar mensaje"
          >
            <Mail className="h-4 w-4" />
          </button>
          <button
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 transition-colors"
            title="Ver calendario"
          >
            <Calendar className="h-4 w-4" />
          </button>
          <button
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 transition-colors"
            title="Descargar historial"
          >
            <FileText className="h-4 w-4" />
          </button>
        </div>

        {/* Información de contacto */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-slate-400" />
            <a href={`tel:${paciente.telefono}`} className="text-slate-300 hover:text-white transition-colors">
              {paciente.telefono}
            </a>
          </div>
          {paciente.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-slate-400" />
              <a href={`mailto:${paciente.email}`} className="text-slate-300 hover:text-white transition-colors">
                {paciente.email}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Notas */}
      <div className="p-4 border-b border-slate-800/40">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-300">Notas</h3>
          {!isEditingNotas && (
            <button
              onClick={() => setIsEditingNotas(true)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Editar
            </button>
          )}
        </div>
        {isEditingNotas ? (
          <div className="space-y-2">
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Agrega notas sobre el paciente..."
              className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[80px] resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveNotas}
                className="flex-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setIsEditingNotas(false);
                  setNotas(paciente.notas || '');
                }}
                className="flex-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">
            {paciente.notas || 'Agrega notas sobre el paciente...'}
          </p>
        )}
      </div>

      {/* Información médica */}
      <div className="flex-1">
        <button
          onClick={() => setShowMedicalInfo(!showMedicalInfo)}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-800/40 hover:bg-slate-800/60 transition-colors border-b border-slate-800/40"
        >
          <h3 className="text-sm font-semibold text-slate-300">Otra información médica</h3>
          {showMedicalInfo ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {showMedicalInfo && (
          <div className="p-4 space-y-4">
            {/* Alergias */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <h4 className="text-xs font-semibold text-slate-300">Alergias</h4>
              </div>
              {paciente.informacionMedica?.alergias && paciente.informacionMedica.alergias.length > 0 ? (
                <ul className="space-y-1">
                  {paciente.informacionMedica.alergias.map((alergia, index) => (
                    <li key={index} className="text-sm text-slate-400 pl-4">• {alergia}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic pl-4">Escribe las alergias</p>
              )}
            </div>

            {/* Medicación */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Pill className="h-4 w-4 text-blue-400" />
                <h4 className="text-xs font-semibold text-slate-300">Medicación</h4>
              </div>
              {paciente.informacionMedica?.medicacionActual && paciente.informacionMedica.medicacionActual.length > 0 ? (
                <ul className="space-y-1">
                  {paciente.informacionMedica.medicacionActual.map((med, index) => (
                    <li key={index} className="text-sm text-slate-400 pl-4">• {med}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic pl-4">Escribe la medicación</p>
              )}
            </div>

            {/* Antecedentes médicos */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <h4 className="text-xs font-semibold text-slate-300">Antecedentes médicos</h4>
              </div>
              {paciente.informacionMedica?.antecedentes && paciente.informacionMedica.antecedentes.length > 0 ? (
                <ul className="space-y-1">
                  {paciente.informacionMedica.antecedentes.map((antecedente, index) => (
                    <li key={index} className="text-sm text-slate-400 pl-4">• {antecedente}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic pl-4">Escribe los antecedentes</p>
              )}
            </div>

            {/* Otros datos */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Otros</h4>
              <p className="text-sm text-slate-500 italic">Escribe cualquier otra información</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer con metadata */}
      <div className="p-4 border-t border-slate-800/40 bg-slate-900/40">
        <div className="space-y-2 text-xs text-slate-500">
          <div className="flex justify-between">
            <span>Registro:</span>
            <span className="text-slate-400">{formatDate(paciente.fechaRegistro)}</span>
          </div>
          <div className="flex justify-between">
            <span>Fuente:</span>
            <span className="text-slate-400">{paciente.fuenteOriginal}</span>
          </div>
          <div className="flex justify-between">
            <span>Total consultas:</span>
            <span className="text-slate-400 font-medium">{paciente.totalConsultas}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
