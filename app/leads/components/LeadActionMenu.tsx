'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  MoreHorizontal, 
  Send, 
  Tag, 
  Calendar, 
  Copy, 
  Check,
  ChevronRight,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { WrapTooltip } from '@/app/components/common/InfoTooltip';
import { 
  getEtapaConfig, 
  getPlantillasParaEtapa, 
  personalizarPlantilla,
  type AccionFunnel,
  type PlantillaMensaje 
} from '@/app/lib/funnel-config';
import type { Lead, LeadEstado } from '@/types/leads';

// ============================================================
// TIPOS
// ============================================================

interface LeadActionMenuProps {
  lead: Lead;
  onChangeEstado?: (leadId: string, nuevoEstado: LeadEstado) => void;
  onSendMessage?: (leadId: string, mensaje: string) => void;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function LeadActionMenu({ lead, onChangeEstado, onSendMessage }: LeadActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<'acciones' | 'plantillas' | 'etapa' | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const etapaConfig = getEtapaConfig(lead.estado);
  const plantillas = getPlantillasParaEtapa(lead.estado);
  
  // Cerrar menu al hacer click fuera
  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setActiveSubmenu(null);
  }, []);

  // Copiar mensaje al clipboard
  const handleCopyMessage = useCallback(async (plantilla: PlantillaMensaje) => {
    const mensajePersonalizado = personalizarPlantilla(plantilla.mensaje, {
      nombre: lead.nombreCompleto || lead.nombre || 'paciente',
    });
    
    try {
      await navigator.clipboard.writeText(mensajePersonalizado);
      setCopiedId(plantilla.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  }, [lead]);

  // Ejecutar acción
  const handleAccion = useCallback((accion: AccionFunnel) => {
    if (accion.siguienteEtapa && onChangeEstado) {
      onChangeEstado(lead.id, accion.siguienteEtapa);
    }
    closeMenu();
  }, [lead.id, onChangeEstado, closeMenu]);

  // Si es convertido con paciente, mostrar link directo
  if (lead.estado === 'Convertido' && lead.pacienteId) {
    return (
      <div className="flex items-center gap-1">
        <WrapTooltip
          content={
            <div className="space-y-1">
              <p className="font-semibold">✅ Paciente convertido</p>
              <p className="text-muted-foreground text-xs">Clic para ver expediente completo</p>
            </div>
          }
          side="left"
        >
          <Link
            href={`/pacientes/${lead.pacienteId}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md
                       bg-emerald-50 dark:bg-emerald-500/10 
                       text-emerald-600 dark:text-emerald-400
                       border border-emerald-200 dark:border-emerald-500/30
                       hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver paciente
          </Link>
        </WrapTooltip>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Botón de acción rápida + menú */}
      <div className="flex items-center gap-1">
        {/* Acción principal rápida */}
        <AccionRapida 
          lead={lead} 
          etapaConfig={etapaConfig} 
          plantillas={plantillas}
          onCopy={handleCopyMessage}
          copiedId={copiedId}
        />
        
        {/* Botón de más opciones */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
          aria-label="Más acciones"
        >
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Menú dropdown */}
      {isOpen && (
        <>
          {/* Overlay para cerrar */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeMenu}
          />
          
          {/* Menú */}
          <div className="absolute right-0 top-full mt-1 z-50 w-56 
                          bg-popover border border-border rounded-lg shadow-lg
                          animate-in fade-in-0 zoom-in-95">
            
            {/* Header con info del lead */}
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs font-medium text-foreground truncate">
                {lead.nombre}
              </p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span>{etapaConfig?.icon}</span>
                <span>{etapaConfig?.nombre || lead.estado}</span>
              </p>
            </div>

            {/* Opciones principales */}
            <div className="p-1">
              {/* Enviar mensaje */}
              <MenuButton
                icon={<MessageSquare className="w-4 h-4" />}
                label="Enviar mensaje"
                hasSubmenu
                isActive={activeSubmenu === 'plantillas'}
                onClick={() => setActiveSubmenu(activeSubmenu === 'plantillas' ? null : 'plantillas')}
              />
              
              {/* Submenu plantillas */}
              {activeSubmenu === 'plantillas' && (
                <div className="ml-2 pl-2 border-l border-border space-y-0.5 py-1">
                  {plantillas.length > 0 ? (
                    plantillas.map((plantilla) => (
                      <button
                        key={plantilla.id}
                        onClick={() => handleCopyMessage(plantilla)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded
                                   hover:bg-muted transition-colors text-left"
                      >
                        {copiedId === plantilla.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        )}
                        <span className="flex-1 truncate">{plantilla.nombre}</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-[10px] text-muted-foreground px-2 py-1">
                      No hay plantillas para esta etapa
                    </p>
                  )}
                </div>
              )}

              {/* Cambiar etapa */}
              <MenuButton
                icon={<Tag className="w-4 h-4" />}
                label="Cambiar etapa"
                hasSubmenu
                isActive={activeSubmenu === 'etapa'}
                onClick={() => setActiveSubmenu(activeSubmenu === 'etapa' ? null : 'etapa')}
              />
              
              {/* Submenu etapas */}
              {activeSubmenu === 'etapa' && (
                <div className="ml-2 pl-2 border-l border-border space-y-0.5 py-1">
                  {etapaConfig?.acciones
                    .filter(a => a.siguienteEtapa)
                    .map((accion) => (
                      <button
                        key={accion.id}
                        onClick={() => handleAccion(accion)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded
                                   hover:bg-muted transition-colors text-left
                                   ${accion.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : ''}
                                   ${accion.color === 'red' ? 'text-red-600 dark:text-red-400' : ''}
                                   ${accion.color === 'amber' ? 'text-amber-600 dark:text-amber-400' : ''}`}
                      >
                        <span>{accion.icon}</span>
                        <span className="flex-1">{accion.label}</span>
                      </button>
                    ))
                  }
                </div>
              )}

              <div className="h-px bg-border my-1" />

              {/* Agendar (si aplica) */}
              {['Interesado', 'Calificado'].includes(lead.estado) && (
                <MenuButton
                  icon={<Calendar className="w-4 h-4" />}
                  label="Agendar cita"
                  onClick={() => {
                    // TODO: Abrir modal de agendar
                    closeMenu();
                  }}
                />
              )}

              {/* Link a WhatsApp */}
              <a
                href={`https://wa.me/${lead.telefono.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-1.5 text-xs rounded
                           hover:bg-muted transition-colors w-full"
                onClick={closeMenu}
              >
                <Send className="w-4 h-4 text-emerald-500" />
                <span>Abrir WhatsApp</span>
                <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
              </a>
            </div>

            {/* Footer con tip */}
            <div className="px-3 py-2 border-t border-border bg-muted/50">
              <p className="text-[10px] text-muted-foreground">
                💡 {etapaConfig?.objetivo || 'Dar seguimiento al lead'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

interface MenuButtonProps {
  icon: React.ReactNode;
  label: string;
  hasSubmenu?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

function MenuButton({ icon, label, hasSubmenu, isActive, onClick }: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded
                  transition-colors text-left
                  ${isActive ? 'bg-muted' : 'hover:bg-muted'}`}
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1">{label}</span>
      {hasSubmenu && (
        <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform
                                  ${isActive ? 'rotate-90' : ''}`} />
      )}
    </button>
  );
}

interface AccionRapidaProps {
  lead: Lead;
  etapaConfig: ReturnType<typeof getEtapaConfig>;
  plantillas: PlantillaMensaje[];
  onCopy: (plantilla: PlantillaMensaje) => void;
  copiedId: string | null;
}

function AccionRapida({ lead, etapaConfig, plantillas, onCopy, copiedId }: AccionRapidaProps) {
  const accionPrincipal = etapaConfig?.acciones[0];
  const plantillaPrincipal = plantillas[0];
  
  // Determinar qué mostrar basado en el estado
  const getBotonConfig = () => {
    switch (lead.estado) {
      case 'Nuevo':
        return {
          label: '👋 Saludar',
          color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
          tooltip: 'Copiar mensaje de saludo inicial',
          action: () => plantillaPrincipal && onCopy(plantillaPrincipal)
        };
      case 'Contactado':
        return {
          label: lead.esInactivo ? '🔔 Seguimiento' : '📋 Info',
          color: lead.esInactivo 
            ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
            : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
          tooltip: lead.esInactivo ? 'Copiar mensaje de seguimiento' : 'Copiar información de servicios',
          action: () => {
            const plantilla = lead.esInactivo 
              ? plantillas.find(p => p.id === 'seguimiento-sin-respuesta')
              : plantillaPrincipal;
            if (plantilla) onCopy(plantilla);
          }
        };
      case 'Interesado':
        return {
          label: '💰 Costos',
          color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
          tooltip: 'Copiar información de costos',
          action: () => {
            const plantilla = plantillas.find(p => p.id === 'enviar-costos');
            if (plantilla) onCopy(plantilla);
          }
        };
      case 'Calificado':
        return {
          label: '📅 Agendar',
          color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
          tooltip: 'Copiar confirmación de cita',
          action: () => {
            const plantilla = plantillas.find(p => p.id === 'agendar-cita');
            if (plantilla) onCopy(plantilla);
          }
        };
      case 'No_Interesado':
      case 'Perdido':
        return {
          label: '🔄 Reactivar',
          color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
          tooltip: 'Copiar mensaje de reactivación',
          action: () => {
            const plantilla = plantillas.find(p => p.id === 'reactivar-lead');
            if (plantilla) onCopy(plantilla);
          }
        };
      default:
        return {
          label: '💬 Mensaje',
          color: 'bg-muted text-muted-foreground border-border',
          tooltip: 'Copiar plantilla de mensaje',
          action: () => plantillaPrincipal && onCopy(plantillaPrincipal)
        };
    }
  };

  const config = getBotonConfig();
  const isCopied = copiedId === plantillaPrincipal?.id;

  return (
    <WrapTooltip
      content={
        <div className="space-y-1 max-w-xs">
          <p className="font-semibold">{config.tooltip}</p>
          <p className="text-muted-foreground text-[10px]">
            {isCopied ? '✅ ¡Copiado! Pégalo en WhatsApp' : 'Clic para copiar mensaje'}
          </p>
        </div>
      }
      side="left"
    >
      <button
        onClick={config.action}
        className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md
                    border transition-all
                    ${config.color}
                    ${isCopied ? 'ring-2 ring-emerald-500/50' : 'hover:opacity-80'}`}
      >
        {isCopied ? <Check className="w-3 h-3" /> : null}
        <span>{isCopied ? 'Copiado' : config.label}</span>
      </button>
    </WrapTooltip>
  );
}

export default LeadActionMenu;
