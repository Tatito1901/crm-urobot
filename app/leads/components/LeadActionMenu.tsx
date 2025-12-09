'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  MoreHorizontal, 
  Send, 
  Tag, 
  Calendar, 
  Check,
  ChevronRight,
  MessageSquare,
  ExternalLink,
  AlertTriangle,
  Ban,
  Phone,
  Clock,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { WrapTooltip } from '@/app/components/common/InfoTooltip';
import { 
  getEtapaConfig, 
  getPlantillasParaEtapa, 
  personalizarPlantilla,
  type PlantillaMensaje
} from '@/app/lib/funnel-config';
import { LeadInsights } from './LeadInsights';
import { useLeadActions } from '@/hooks/useLeadActions';
import type { Lead, LeadEstado } from '@/types/leads';

// ============================================================
// TIPOS
// ============================================================

interface LeadActionMenuProps {
  lead: Lead;
  onRefresh?: () => void;
}

// Estados disponibles para cambiar
const ESTADOS_CAMBIO: LeadEstado[] = ['Nuevo', 'Contactado', 'Interesado', 'Calificado', 'Convertido', 'No_Interesado', 'Perdido'];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function LeadActionMenu({ lead, onRefresh }: LeadActionMenuProps) {
  // ====== TODOS LOS HOOKS PRIMERO (antes de cualquier return) ======
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<'plantillas' | 'etapa' | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Hook inteligente de acciones
  const { 
    historial, 
    recomendacion, 
    isLoading,
    enviarMensajeWhatsApp,
    cambiarEstado,
    marcarComoNoMolestar,
    generarURLWhatsApp
  } = useLeadActions(lead);
  
  const etapaConfig = getEtapaConfig(lead.estado);
  const plantillas = getPlantillasParaEtapa(lead.estado);
  
  // Cerrar menu
  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setActiveSubmenu(null);
  }, []);

  // Enviar mensaje con 1 click (abre WhatsApp con mensaje pre-llenado)
  const handleEnviarMensaje = useCallback(async (plantilla: PlantillaMensaje) => {
    setEnviando(true);
    try {
      const mensajePersonalizado = personalizarPlantilla(plantilla.mensaje, {
        nombre: lead.nombreCompleto || lead.nombre || 'paciente',
      });
      
      await enviarMensajeWhatsApp(mensajePersonalizado, plantilla.id);
      closeMenu();
      onRefresh?.();
    } finally {
      setEnviando(false);
    }
  }, [lead, enviarMensajeWhatsApp, closeMenu, onRefresh]);

  // Cambiar estado del lead
  const handleCambiarEstado = useCallback(async (nuevoEstado: LeadEstado) => {
    await cambiarEstado(nuevoEstado);
    closeMenu();
    onRefresh?.();
  }, [cambiarEstado, closeMenu, onRefresh]);

  // Marcar como no molestar
  const handleNoMolestar = useCallback(async () => {
    await marcarComoNoMolestar();
    closeMenu();
    onRefresh?.();
  }, [marcarComoNoMolestar, closeMenu, onRefresh]);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, closeMenu]);

  // Bloquear scroll del body en móvil cuando está abierto
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isMobile, isOpen]);

  // ====== EARLY RETURNS DESPUÉS DE LOS HOOKS ======
  
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
        {/* Acción principal rápida basada en recomendación */}
        <AccionRapidaInteligente 
          lead={lead}
          recomendacion={recomendacion}
          plantillas={plantillas}
          isLoading={isLoading || enviando}
          onEnviarMensaje={handleEnviarMensaje}
        />
        
        {/* Botón de más opciones */}
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors active:scale-95"
          aria-label="Más acciones"
          aria-expanded={isOpen}
        >
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Menú - Bottom Sheet en móvil, Dropdown en desktop */}
      {isOpen && (
        <>
          {/* Overlay para cerrar */}
          <div 
            className={`fixed inset-0 z-40 ${isMobile ? 'bg-black/40 backdrop-blur-sm' : ''}`} 
            onClick={closeMenu} 
          />
          
          {/* Menú */}
          <div 
            ref={menuRef}
            className={`
              ${isMobile 
                ? 'fixed left-0 right-0 bottom-0 z-50 w-full max-h-[85vh] rounded-t-2xl animate-in slide-in-from-bottom duration-200' 
                : 'absolute right-0 top-full mt-1 z-50 w-72 rounded-lg animate-in fade-in-0 zoom-in-95'
              }
              bg-popover border border-border shadow-xl overflow-hidden
            `}
          >
            {/* Handle para arrastrar en móvil */}
            {isMobile && (
              <div className="flex justify-center py-2 border-b border-border/50">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>
            )}
            
            {/* Header con info del lead y recomendación */}
            <div className="px-3 py-2 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground truncate">
                    {lead.nombre}
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span>{etapaConfig?.icon}</span>
                    <span>{etapaConfig?.nombre || lead.estado}</span>
                  </p>
                </div>
                {historial && (
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">
                      {historial.totalMensajesEnviados} enviados / {historial.totalMensajesRecibidos} recibidos
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Tasa: {historial.tasaRespuesta}%
                    </p>
                  </div>
                )}
              </div>
              
              {/* Recomendación inteligente */}
              {recomendacion && (
                <div className={`mt-2 p-2 rounded-md text-[10px] ${
                  recomendacion.prioridad === 'alta' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' :
                  recomendacion.prioridad === 'no_contactar' ? 'bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400' :
                  recomendacion.prioridad === 'media' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                  'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}>
                  <p className="font-medium">{recomendacion.razon}</p>
                  {recomendacion.alertas.map((alerta, i) => (
                    <p key={i} className="flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      {alerta}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* INSIGHTS DE IA (NUEVO) */}
            <div className="px-4 pt-4 pb-2">
              <LeadInsights telefono={lead.telefono} />
            </div>

            {/* Acciones principales */}
            <div className="p-2 space-y-1">
              {/* Enviar mensaje */}
              <MenuButton
                icon={<MessageSquare className="w-4 h-4" />}
                label="Enviar mensaje"
                badge={plantillas.length > 0 ? `${plantillas.length}` : undefined}
                hasSubmenu
                isActive={activeSubmenu === 'plantillas'}
                onClick={() => setActiveSubmenu(activeSubmenu === 'plantillas' ? null : 'plantillas')}
              />
              
              {/* Submenu plantillas - ahora envía directo */}
              {activeSubmenu === 'plantillas' && (
                <div className="ml-2 pl-2 border-l border-border space-y-0.5 py-1">
                  {plantillas.length > 0 ? (
                    plantillas.map((plantilla) => (
                      <button
                        key={plantilla.id}
                        onClick={() => handleEnviarMensaje(plantilla)}
                        disabled={enviando}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded
                                   hover:bg-muted transition-colors text-left disabled:opacity-50"
                      >
                        <Send className="w-3 h-3 text-emerald-500" />
                        <span className="flex-1 truncate">{plantilla.nombre}</span>
                        <span className="text-[9px] text-muted-foreground">1-click</span>
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
                  {ESTADOS_CAMBIO.filter(e => e !== lead.estado).map((estado) => (
                    <button
                      key={estado}
                      onClick={() => handleCambiarEstado(estado)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded
                                 hover:bg-muted transition-colors text-left"
                    >
                      <span>{getEtapaConfig(estado)?.icon || '📌'}</span>
                      <span className="flex-1">{estado.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="h-px bg-border my-1" />

              {/* Historial de interacciones */}
              {historial && (
                <div className="px-2 py-1.5 text-[10px] text-muted-foreground space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>
                      {historial.diasSinRespuesta === 0 
                        ? 'Respondió recientemente' 
                        : historial.diasSinRespuesta === 999
                          ? 'Sin interacción'
                          : `${historial.diasSinRespuesta} días sin respuesta`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    <span>Seguimientos: {historial.intentosSeguimiento}</span>
                  </div>
                </div>
              )}

              <div className="h-px bg-border my-1" />

              {/* Acciones adicionales */}
              <a
                href={generarURLWhatsApp('')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-1.5 text-xs rounded
                           hover:bg-muted transition-colors w-full"
              >
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>Abrir WhatsApp</span>
                <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
              </a>

              {/* Marcar como no molestar (si tiene demasiados intentos) */}
              {recomendacion?.prioridad === 'no_contactar' && (
                <button
                  onClick={handleNoMolestar}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded
                             hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-red-600 dark:text-red-400"
                >
                  <Ban className="w-4 h-4" />
                  <span>Marcar como "No molestar"</span>
                </button>
              )}
            </div>

            {/* Footer con tip */}
            <div className={`px-3 py-2 border-t border-border bg-muted/50 ${isMobile ? 'pb-[calc(0.5rem+env(safe-area-inset-bottom))]' : ''}`}>
              <p className="text-[10px] text-muted-foreground">
                💡 {recomendacion?.diasEsperar 
                  ? `Esperar ${recomendacion.diasEsperar} días antes del próximo contacto`
                  : etapaConfig?.objetivo || 'Dar seguimiento al lead'}
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
  badge?: string;
  hasSubmenu?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

function MenuButton({ icon, label, badge, hasSubmenu, isActive, onClick }: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded
                  transition-colors text-left
                  ${isActive ? 'bg-muted' : 'hover:bg-muted'}`}
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      {hasSubmenu && (
        <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform
                                  ${isActive ? 'rotate-90' : ''}`} />
      )}
    </button>
  );
}

interface AccionRapidaInteligenteProps {
  lead: Lead;
  recomendacion: ReturnType<typeof useLeadActions>['recomendacion'];
  plantillas: PlantillaMensaje[];
  isLoading: boolean;
  onEnviarMensaje: (plantilla: PlantillaMensaje) => void;
}

function AccionRapidaInteligente({ 
  lead, 
  recomendacion, 
  plantillas, 
  isLoading,
  onEnviarMensaje 
}: AccionRapidaInteligenteProps) {
  
  // Determinar qué mostrar basado en recomendación inteligente
  const getBotonConfig = () => {
    // Si hay recomendación de no contactar
    if (recomendacion?.prioridad === 'no_contactar') {
      return {
        label: '⛔ No contactar',
        color: 'bg-gray-100 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-500/30',
        tooltip: recomendacion.razon,
        disabled: true,
        plantilla: null
      };
    }

    // Si hay que esperar
    if (recomendacion?.accion === 'esperar') {
      return {
        label: `⏳ Esperar ${recomendacion.diasEsperar}d`,
        color: 'bg-gray-100 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-500/30',
        tooltip: recomendacion.razon,
        disabled: true,
        plantilla: null
      };
    }

    // Buscar plantilla sugerida
    const plantillaSugerida = recomendacion?.plantillaSugerida 
      ? plantillas.find(p => p.id === recomendacion.plantillaSugerida)
      : plantillas[0];

    // Configuración por prioridad
    if (recomendacion?.prioridad === 'alta') {
      return {
        label: '🚨 Urgente',
        color: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30 animate-pulse',
        tooltip: recomendacion.razon,
        disabled: false,
        plantilla: plantillaSugerida
      };
    }

    // Por estado del lead
    switch (lead.estado) {
      case 'Nuevo':
        return {
          label: '👋 Saludar',
          color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
          tooltip: 'Enviar saludo inicial',
          disabled: false,
          plantilla: plantillaSugerida
        };
      case 'Contactado':
        return {
          label: lead.esInactivo ? '🔔 Seguimiento' : '📋 Info',
          color: lead.esInactivo 
            ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
            : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
          tooltip: lead.esInactivo ? 'Enviar seguimiento' : 'Enviar información',
          disabled: false,
          plantilla: plantillaSugerida
        };
      case 'Interesado':
        return {
          label: '💰 Costos',
          color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
          tooltip: 'Enviar información de costos',
          disabled: false,
          plantilla: plantillaSugerida
        };
      case 'Calificado':
        return {
          label: '📅 Agendar',
          color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
          tooltip: 'Enviar para agendar',
          disabled: false,
          plantilla: plantillaSugerida
        };
      case 'No_Interesado':
      case 'Perdido':
        return {
          label: '🔄 Reactivar',
          color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
          tooltip: 'Intentar reactivación',
          disabled: false,
          plantilla: plantillaSugerida
        };
      default:
        return {
          label: '💬 Mensaje',
          color: 'bg-muted text-muted-foreground border-border',
          tooltip: 'Enviar mensaje',
          disabled: false,
          plantilla: plantillaSugerida
        };
    }
  };

  const config = getBotonConfig();

  return (
    <WrapTooltip
      content={
        <div className="space-y-1 max-w-xs">
          <p className="font-semibold">{config.tooltip}</p>
          {!config.disabled && (
            <p className="text-muted-foreground text-[10px]">
              Clic para abrir WhatsApp con mensaje
            </p>
          )}
        </div>
      }
      side="left"
    >
      <button
        onClick={() => config.plantilla && onEnviarMensaje(config.plantilla)}
        disabled={config.disabled || isLoading || !config.plantilla}
        className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md
                    border transition-all
                    ${config.color}
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${!config.disabled ? 'hover:opacity-80' : ''}`}
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : null}
        <span>{config.label}</span>
      </button>
    </WrapTooltip>
  );
}

export default LeadActionMenu;
