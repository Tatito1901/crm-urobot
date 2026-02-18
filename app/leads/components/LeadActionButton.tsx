'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, ExternalLink, Loader2 } from 'lucide-react';
import { WrapTooltip } from '@/app/components/common/InfoTooltip';
import { getEtapaConfig, getPlantillasParaEtapa, personalizarPlantilla } from '@/app/lib/funnel-config';
import { useLeadActions } from '@/hooks/useLeadActions';
import { LeadActionsModal } from './LeadActionsModal';
import type { Lead } from '@/types/leads';

interface LeadActionButtonProps {
  lead: Lead;
  onRefresh?: () => void;
}

export function LeadActionButton({ lead, onRefresh }: LeadActionButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickSending, setIsQuickSending] = useState(false);

  const { 
    recomendacion, 
    isLoading,
    enviarMensajeWhatsApp 
  } = useLeadActions(lead);

  const plantillas = getPlantillasParaEtapa(lead.estado);
  const etapaConfig = getEtapaConfig(lead.estado);

  // Acción rápida de 1-click
  const handleQuickAction = async () => {
    if (!plantillas[0]) return;
    
    setIsQuickSending(true);
    try {
      const mensaje = personalizarPlantilla(plantillas[0].mensaje, {
        nombre: lead.nombre || 'paciente',
      });
      await enviarMensajeWhatsApp(mensaje, plantillas[0].id);
      onRefresh?.();
    } finally {
      setIsQuickSending(false);
    }
  };

  // Si es paciente convertido, solo mostrar link
  if (lead.estado === 'convertido' && lead.convertidoAPacienteId) {
    return (
      <Link
        href={`/pacientes/${lead.convertidoAPacienteId}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg
                   bg-emerald-50 dark:bg-emerald-500/10 
                   text-emerald-600 dark:text-emerald-400
                   border border-emerald-200 dark:border-emerald-500/30
                   hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Ver paciente
      </Link>
    );
  }

  // Configuración del botón según estado y recomendación
  const getQuickButtonConfig = () => {
    if (recomendacion?.prioridad === 'no_contactar') {
      return { label: '⛔', color: 'bg-slate-100 text-slate-400', disabled: true };
    }
    if (recomendacion?.accion === 'esperar') {
      const dias = recomendacion.diasEsperar;
      // Si diasEsperar es 0 o undefined, mostrar solo el reloj
      if (dias === undefined || dias === 0) {
        return { label: '⏳', color: 'bg-slate-100 text-slate-500', disabled: true };
      }
      return { label: `⏳ ${dias}d`, color: 'bg-slate-100 text-slate-500', disabled: true };
    }
    if (recomendacion?.prioridad === 'alta') {
      return { label: '🚨', color: 'bg-red-100 text-red-600 dark:bg-red-500/20 animate-pulse', disabled: false };
    }
    
    switch (lead.estado) {
      case 'nuevo': return { label: '👋', color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20', disabled: false };
      case 'contactado': return { label: '📋', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20', disabled: false };
      case 'interesado': return { label: '💰', color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20', disabled: false };
      case 'calificado': return { label: '📅', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20', disabled: false };
      default: return { label: '💬', color: 'bg-slate-100 text-slate-600', disabled: false };
    }
  };

  const quickConfig = getQuickButtonConfig();

  return (
    <>
      <div className="flex items-center gap-1">
        {/* Botón de acción rápida */}
        <WrapTooltip
          content={
            <div className="text-xs">
              <p className="font-medium">{recomendacion?.razon || 'Enviar mensaje rápido'}</p>
              {!quickConfig.disabled && <p className="text-muted-foreground mt-0.5">Clic para abrir WhatsApp</p>}
            </div>
          }
          side="left"
        >
          <button
            onClick={handleQuickAction}
            disabled={quickConfig.disabled || isLoading || isQuickSending}
            className={`px-2 py-1.5 text-xs font-medium rounded-lg border border-transparent
                       transition-all disabled:opacity-60 disabled:cursor-not-allowed
                       ${quickConfig.color}`}
          >
            {isQuickSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : quickConfig.label}
          </button>
        </WrapTooltip>

        {/* Botón para abrir modal con más opciones */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Más acciones"
        >
          <MoreHorizontal className="w-4 h-4 text-slate-400" />
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
