'use client';

import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { LeadActionsModal } from './LeadActionsModal';
import type { Lead } from '@/types/leads';

interface LeadActionButtonProps {
  lead: Lead;
  onRefresh?: () => void;
}

export function LeadActionButton({ lead, onRefresh }: LeadActionButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Si es paciente convertido, mostrar badge
  if (lead.estado === 'convertido' && lead.convertidoAPacienteId) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg
                   bg-emerald-500/10 
                   text-emerald-600 dark:text-emerald-400
                   border border-emerald-500/20"
      >
        ✅ Convertido
      </span>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1">
        {/* Botón para abrir modal con más opciones */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          title="Más acciones"
        >
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Modal de acciones */}
      <LeadActionsModal
        lead={lead}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={onRefresh}
      />
    </>
  );
}

export default LeadActionButton;
