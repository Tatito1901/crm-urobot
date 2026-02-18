/**
 * ============================================================
 * PATIENT SEARCH - Búsqueda con creación de pacientes
 * ============================================================
 * Componente de búsqueda inteligente que permite crear pacientes nuevos
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePacientes } from '@/hooks/pacientes/usePacientes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { Paciente } from '@/types/pacientes';

interface PatientSearchProps {
  onSelect: (patient: Paciente | null) => void;
  onNewPatientData?: (data: { nombre: string; telefono: string; email: string }) => void;
  selectedPatientId?: string;
  newPatientData?: { nombre: string; telefono: string; email: string } | null;
  error?: string;
  touched?: boolean;
}

export const PatientSearch: React.FC<PatientSearchProps> = ({
  onSelect,
  onNewPatientData,
  selectedPatientId,
  newPatientData,
  error,
  touched,
}) => {
  const { pacientes, loading } = usePacientes();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Buscar paciente seleccionado
  const selectedPatient = pacientes.find((p) => p.id === selectedPatientId);

  // Filtrar pacientes según búsqueda
  const filteredPatients = pacientes.filter((p) => {
    const searchTerm = query.toLowerCase();
    return (
      (p.nombre || '').toLowerCase().includes(searchTerm) ||
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
        setShowNewPatientForm(false);
        break;
    }
  };

  const handleSelectPatient = (patient: Paciente) => {
    onSelect(patient);
    setQuery(patient.nombre || '');
    setIsOpen(false);
    setShowNewPatientForm(false);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(true);
    setSelectedIndex(0);
    setShowNewPatientForm(false);

    // Si hay un paciente seleccionado y cambia el query, limpiar selección
    if (selectedPatient) {
      onSelect(null);
    }
  };

  const handleCreateNewPatient = () => {
    setShowNewPatientForm(true);
    setIsOpen(false);
    // Prellenar nombre con el query actual
    setNewPatientForm({
      nombre: query || '',
      telefono: '',
      email: '',
    });
  };

  const handleNewPatientFormSubmit = () => {
    if (onNewPatientData) {
      onNewPatientData(newPatientForm);
      setShowNewPatientForm(false);
    }
  };

  const handleCancelNewPatient = () => {
    setShowNewPatientForm(false);
    setNewPatientForm({ nombre: '', telefono: '', email: '' });
    setQuery('');
    onSelect(null);
    if (onNewPatientData) {
      onNewPatientData({ nombre: '', telefono: '', email: '' });
    }
  };

  // Validación simple
  const isNewPatientFormValid =
    newPatientForm.nombre.trim().length >= 3 &&
    newPatientForm.telefono.trim().length >= 10;

  return (
    <div className="relative">
      {/* Input de búsqueda */}
      {!showNewPatientForm && !newPatientData && (
        <>
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
                bg-muted/50 border text-foreground
                placeholder-muted-foreground
                focus:outline-none focus:ring-2
                ${
                  touched && error
                    ? 'border-destructive focus:ring-destructive/20'
                    : 'border-border focus:border-primary focus:ring-primary/20'
                }
              `}
            />

            {/* Icono de búsqueda */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <svg
                  className="h-5 w-5 text-muted-foreground"
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
          {touched && error && <p className="mt-1 text-sm text-destructive">{error}</p>}

          {/* Dropdown de resultados */}
          {isOpen && filteredPatients.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-2 rounded-xl bg-popover border border-border shadow-2xl max-h-64 overflow-y-auto"
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
                        ? 'bg-primary/10 border-l-2 border-primary'
                        : 'hover:bg-accent'
                    }
                    ${index > 0 ? 'border-t border-border' : ''}
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{patient.nombre}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{patient.telefono}</span>
                        {patient.email && (
                          <span className="text-xs text-muted-foreground truncate">{patient.email}</span>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-col items-end gap-1">
                      {(patient.totalConsultas ?? 0) > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                          {patient.totalConsultas} consultas
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          patient.estado === 'activo'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-slate-500/10 text-slate-500'
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

          {/* No hay resultados - Opción para crear nuevo */}
          {isOpen && query && filteredPatients.length === 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-2 rounded-xl bg-popover border border-border shadow-2xl p-4"
            >
              <p className="text-sm text-muted-foreground text-center mb-3">
                No se encontraron pacientes con &ldquo;{query}&rdquo;
              </p>
              <button
                type="button"
                onClick={handleCreateNewPatient}
                className="w-full px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Crear nuevo paciente
              </button>
            </div>
          )}

          {/* Info del paciente seleccionado */}
          {selectedPatient && (
            <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">
                    <span className="text-muted-foreground">Paciente:</span> {selectedPatient.nombre}
                  </p>
                  {(selectedPatient.totalConsultas ?? 0) > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
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
                    onSelect(null);
                    setQuery('');
                  }}
                  className="text-muted-foreground hover:text-foreground"
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
        </>
      )}

      {/* Formulario para nuevo paciente */}
      {(showNewPatientForm || newPatientData) && (
        <div className="space-y-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-emerald-500 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Nuevo Paciente
            </h4>
            {!newPatientData && (
              <button
                type="button"
                onClick={handleCancelNewPatient}
                className="text-muted-foreground hover:text-foreground"
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
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Nombre completo <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              value={newPatientData?.nombre || newPatientForm.nombre}
              onChange={(e) =>
                setNewPatientForm({ ...newPatientForm, nombre: e.target.value })
              }
              disabled={!!newPatientData}
              placeholder="Ej: Juan Pérez García"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Teléfono <span className="text-destructive">*</span>
            </Label>
            <Input
              type="tel"
              value={newPatientData?.telefono || newPatientForm.telefono}
              onChange={(e) =>
                setNewPatientForm({ ...newPatientForm, telefono: e.target.value })
              }
              disabled={!!newPatientData}
              placeholder="10 dígitos"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Email (opcional)</Label>
            <Input
              type="email"
              value={newPatientData?.email || newPatientForm.email}
              onChange={(e) =>
                setNewPatientForm({ ...newPatientForm, email: e.target.value })
              }
              disabled={!!newPatientData}
              placeholder="ejemplo@correo.com"
            />
          </div>

          {!newPatientData && (
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelNewPatient}
                className="flex-1"
                size="sm"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleNewPatientFormSubmit}
                disabled={!isNewPatientFormValid}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                size="sm"
              >
                Continuar
              </Button>
            </div>
          )}

          {newPatientData && (
            <button
              type="button"
              onClick={handleCancelNewPatient}
              className="w-full px-3 py-2 rounded-lg border border-border text-muted-foreground hover:bg-accent transition-colors text-sm"
            >
              Cambiar paciente
            </button>
          )}
        </div>
      )}
    </div>
  );
};
