/**
 * ============================================================
 * SLOT - Slot de tiempo vacío clickeable
 * ============================================================
 * Representa un espacio vacío en el calendario donde se puede
 * agendar una nueva cita
 */

'use client';

import React from 'react';
import { useAgendaState } from '../../hooks/useAgendaState';
import type { TimeSlot } from '@/types/agenda';

interface SlotProps {
  slot: TimeSlot;
  height?: number; // Altura en px
}

export const Slot: React.FC<SlotProps> = ({ slot, height = 48 }) => {
  const { openCreateModal } = useAgendaState();

  const handleClick = () => {
    if (!slot.available) return;
    openCreateModal(slot);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Clases base
  const baseClasses = 'border-b border-slate-800/50 transition-all duration-150';

  // Clases según estado
  const stateClasses = slot.available
    ? 'cursor-pointer hover:bg-blue-500/5 hover:border-blue-500/30 group'
    : slot.blocked
    ? 'bg-slate-700/20 cursor-not-allowed'
    : 'bg-slate-800/30 cursor-not-allowed';

  return (
    <div
      className={`${baseClasses} ${stateClasses}`}
      style={{ height: `${height}px` }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={slot.available ? 0 : -1}
      aria-label={`Slot ${slot.start.toPlainTime().toString()}, ${
        slot.available ? 'disponible' : 'no disponible'
      }`}
      data-slot-id={slot.id}
    >
      {/* Indicador visual al hacer hover (solo si está disponible) */}
      {slot.available && (
        <div className="flex h-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1 text-xs text-blue-400 font-medium">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Agendar</span>
          </div>
        </div>
      )}

      {/* Razón de no disponibilidad */}
      {!slot.available && slot.reason && (
        <div className="flex h-full items-center justify-center px-2">
          <p className="text-[10px] text-slate-500 text-center truncate">{slot.reason}</p>
        </div>
      )}

      {/* Indicador de restricciones */}
      {slot.restrictions && slot.restrictions.length > 0 && (
        <div className="absolute top-0 right-0 p-1">
          <span
            className="text-[10px] text-amber-400"
            title={`Restricciones: ${slot.restrictions.join(', ')}`}
          >
            ⚠️
          </span>
        </div>
      )}
    </div>
  );
};
