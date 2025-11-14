/**
 * ============================================================
 * PATIENT SEARCH - Búsqueda de pacientes con autocompletado
 * ============================================================
 * Componente de búsqueda inteligente con autocompletado
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePacientes } from '@/hooks/usePacientes';
import type { Paciente } from '@/types/pacientes';

interface PatientSearchProps {
  onSelect: (patient: Paciente) => void;
  selectedPatientId?: string;
  error?: string;
  touched?: boolean;
}

export const PatientSearch: React.FC<PatientSearchProps> = ({
  onSelect,
  selectedPatientId,
  error,
  touched,
}) => {
  const { pacientes, loading } = usePacientes();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Buscar paciente seleccionado
  const selectedPatient = pacientes.find((p) => p.id === selectedPatientId);

  // Filtrar pacientes según búsqueda
  const filteredPatients = pacientes.filter((p) => {
    const searchTerm = query.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(searchTerm) ||
      p.telefono.includes(searchTerm) ||
      (p.email && p.email.toLowerCase().includes(searchTerm))
    );
  });

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredPatients.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredPatients.length) % filteredPatients.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredPatients[selectedIndex]) {
          handleSelectPatient(filteredPatients[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelectPatient = (patient: Paciente) => {
    onSelect(patient);
    setQuery(patient.nombre);
    setIsOpen(false);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(true);
    setSelectedIndex(0);
  };

  return (
    <div className="relative">
      {/* Input de búsqueda */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={selectedPatient ? selectedPatient.nombre : query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar paciente por nombre, teléfono o email..."
          className={`
            w-full px-4 py-2.5 pr-10 rounded-xl
            bg-slate-800/50 border text-slate-100
            placeholder-slate-500
            focus:outline-none focus:ring-2
            ${
              touched && error
                ? 'border-red-500 focus:ring-red-500/20'
                : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
            }
          `}
        />

        {/* Icono de búsqueda */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          ) : (
            <svg
              className="h-5 w-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Error */}
      {touched && error && <p className="mt-1 text-sm text-red-400">{error}</p>}

      {/* Dropdown de resultados */}
      {isOpen && filteredPatients.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl max-h-64 overflow-y-auto"
        >
          {filteredPatients.map((patient, index) => (
            <button
              key={patient.id}
              type="button"
              onClick={() => handleSelectPatient(patient)}
              className={`
                w-full px-4 py-3 text-left transition-colors
                ${
                  index === selectedIndex
                    ? 'bg-blue-500/10 border-l-2 border-blue-500'
                    : 'hover:bg-slate-700/50'
                }
                ${index > 0 ? 'border-t border-slate-700/50' : ''}
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">{patient.nombre}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400">{patient.telefono}</span>
                    {patient.email && (
                      <span className="text-xs text-slate-400 truncate">{patient.email}</span>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-col items-end gap-1">
                  {patient.totalConsultas > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                      {patient.totalConsultas} consultas
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      patient.estado === 'Activo'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-slate-500/10 text-slate-400'
                    }`}
                  >
                    {patient.estado}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No hay resultados */}
      {isOpen && query && filteredPatients.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl p-4"
        >
          <p className="text-sm text-slate-400 text-center">
            No se encontraron pacientes con &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs text-slate-500 text-center mt-1">
            Se creará un nuevo paciente al guardar la cita
          </p>
        </div>
      )}

      {/* Info del paciente seleccionado */}
      {selectedPatient && (
        <div className="mt-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">
                <span className="text-slate-400">Paciente:</span> {selectedPatient.nombre}
              </p>
              {selectedPatient.totalConsultas > 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  {selectedPatient.totalConsultas} consultas previas •{' '}
                  {selectedPatient.ultimaConsulta
                    ? `Última: ${new Date(selectedPatient.ultimaConsulta).toLocaleDateString('es-MX')}`
                    : 'Sin consultas previas'}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                onSelect({} as Paciente);
                setQuery('');
              }}
              className="text-slate-400 hover:text-slate-300"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
