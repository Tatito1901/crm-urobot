'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { 
  X,
  Send, 
  MessageSquare,
  ExternalLink,
  Phone,
  Clock,
  Star,
  Check,
  XCircle,
  Zap,
  Calendar,
  User,
  Copy,
  Loader2,
  ChevronRight,
  AlertCircle,
  ShieldBan,
  ShieldCheck
} from 'lucide-react';
import { 
  getEtapaConfig, 
  getPlantillasParaEtapa, 
  personalizarPlantilla,
  type PlantillaMensaje
} from '@/app/lib/funnel-config';
import { useLeadActions } from '@/hooks/leads/useLeadActions';
import { useBloqueo } from '@/hooks/leads/useBloqueo';
import type { Lead, LeadEstado } from '@/types/leads';
import { getValidTransitions, LEAD_ESTADO_DESCRIPCION } from '@/types/leads';

// ============================================================
// TIPOS
// ============================================================

interface LeadActionsModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

// Estados con configuración visual — sincronizado con catalog_estados_lead
const ESTADOS_CONFIG: { estado: LeadEstado; icon: React.ReactNode; label: string; color: string }[] = [
  { estado: 'nuevo', icon: <Star className="w-4 h-4" />, label: 'Nuevo', color: 'bg-blue-500' },
  { estado: 'interactuando', icon: <Zap className="w-4 h-4" />, label: 'Bot activo', color: 'bg-sky-500' },
  { estado: 'contactado', icon: <MessageSquare className="w-4 h-4" />, label: 'Contactado', color: 'bg-amber-500' },
  { estado: 'cita_propuesta', icon: <Calendar className="w-4 h-4" />, label: 'Cita propuesta', color: 'bg-purple-500' },
  { estado: 'en_seguimiento', icon: <Clock className="w-4 h-4" />, label: 'En seguimiento', color: 'bg-orange-500' },
  { estado: 'cita_agendada', icon: <Calendar className="w-4 h-4" />, label: 'Cita agendada', color: 'bg-emerald-500' },
  { estado: 'show', icon: <Check className="w-4 h-4" />, label: 'Asistió', color: 'bg-teal-500' },
  { estado: 'convertido', icon: <User className="w-4 h-4" />, label: 'Paciente', color: 'bg-green-600' },
  { estado: 'no_show', icon: <XCircle className="w-4 h-4" />, label: 'No asistió', color: 'bg-red-400' },
  { estado: 'perdido', icon: <X className="w-4 h-4" />, label: 'Perdido', color: 'bg-slate-400' },
  { estado: 'no_interesado', icon: <XCircle className="w-4 h-4" />, label: 'No interesado', color: 'bg-slate-500' },
  { estado: 'descartado', icon: <X className="w-4 h-4" />, label: 'Descartado', color: 'bg-red-500' },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function LeadActionsModal({ lead, isOpen, onClose, onRefresh }: LeadActionsModalProps) {
  const [activeTab, setActiveTab] = useState<'mensaje' | 'estado'>('mensaje');
  const [selectedPlantilla, setSelectedPlantilla] = useState<PlantillaMensaje | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cambioExitoso, setCambioExitoso] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [showBloqueoConfirm, setShowBloqueoConfirm] = useState(false);
  const [bloqueoMotivo, setBloqueoMotivo] = useState('');
  const [transitionError, setTransitionError] = useState<string | null>(null);

  // Hook de bloqueo
  const { estaBloqueado, bloquear, desbloquear } = useBloqueo(lead.telefono, {
    nombre: lead.nombre,
    leadId: lead.id,
  });

  // Hook de acciones
  const { 
    historial,
    recomendacion, 
    isLoading,
    enviarMensajeWhatsApp,
    cambiarEstado,
    generarURLWhatsApp
  } = useLeadActions(lead);

  const etapaConfig = getEtapaConfig(lead.estado);
  const plantillas = getPlantillasParaEtapa(lead.estado);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // Seleccionar plantilla
  const handleSelectPlantilla = useCallback((plantilla: PlantillaMensaje) => {
    setSelectedPlantilla(plantilla);
    const mensajePersonalizado = personalizarPlantilla(plantilla.mensaje, {
      nombre: lead.nombre || 'paciente',
    });
    setMensaje(mensajePersonalizado);
  }, [lead]);

  // Enviar mensaje
  const handleEnviar = useCallback(async () => {
    if (!mensaje.trim()) return;
    
    setEnviando(true);
    try {
      // Abrir WhatsApp
      const url = generarURLWhatsApp(mensaje);
      window.open(url, '_blank');
      
      // Registrar el envío
      await enviarMensajeWhatsApp(mensaje, selectedPlantilla?.id);
      
      // Limpiar y cerrar
      setMensaje('');
      setSelectedPlantilla(null);
      onRefresh?.();
      onClose();
    } finally {
      setEnviando(false);
    }
  }, [mensaje, generarURLWhatsApp, enviarMensajeWhatsApp, selectedPlantilla, onRefresh, onClose]);

  // Copiar mensaje
  const handleCopiar = useCallback(async () => {
    if (!mensaje.trim()) return;
    await navigator.clipboard.writeText(mensaje);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }, [mensaje]);

  // Cambiar estado (con feedback de validación)
  const handleCambiarEstado = useCallback(async (nuevoEstado: LeadEstado) => {
    setTransitionError(null);
    const result = await cambiarEstado(nuevoEstado);
    if (result.success) {
      setCambioExitoso(nuevoEstado);
      setTimeout(() => {
        setCambioExitoso(null);
        onRefresh?.();
        onClose();
      }, 1000);
    } else {
      setTransitionError(result.error || 'Error al cambiar estado');
    }
  }, [cambiarEstado, onRefresh, onClose]);

  // URL de WhatsApp
  const whatsappUrl = generarURLWhatsApp('');

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div 
          className="bg-card rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-lg lg:max-w-xl
                     animate-in fade-in zoom-in-95 duration-200 overflow-hidden border border-border"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-5 pt-5 pb-4 border-b border-border">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold
                ${lead.estado === 'convertido' || lead.estado === 'show' ? 'bg-emerald-500' : 
                  lead.estado === 'cita_agendada' ? 'bg-green-500' : 
                  lead.estado === 'cita_propuesta' ? 'bg-purple-500' : 'bg-blue-500'}`}
              >
                {(lead.nombre || lead.telefono).slice(0, 2).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {lead.nombre || 'Sin nombre'}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                    ${lead.estado === 'convertido' || lead.estado === 'show' ? 'bg-emerald-500/20 text-emerald-300' : 
                      lead.estado === 'cita_propuesta' || lead.estado === 'cita_agendada' ? 'bg-amber-500/20 text-amber-300' : 
                      'bg-blue-500/20 text-blue-300'}`}
                  >
                    {etapaConfig?.icon} {etapaConfig?.nombre || lead.estado}
                  </span>
                  <span className="text-xs text-muted-foreground">{lead.telefono}</span>
                </div>
              </div>
            </div>

            {/* Recomendación IA */}
            {recomendacion && recomendacion.prioridad !== 'no_contactar' && (
              <div className={`mt-3 p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                recomendacion.prioridad === 'alta' ? 'bg-red-500/10 text-red-300 border border-red-500/20' :
                recomendacion.prioridad === 'media' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                'bg-blue-500/10 text-blue-300 border border-blue-500/20'
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{recomendacion.razon}</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('mensaje')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative
                ${activeTab === 'mensaje' 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Enviar mensaje
              </div>
              {activeTab === 'mensaje' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('estado')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative
                ${activeTab === 'estado' 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Cambiar estado
              </div>
              {activeTab === 'estado' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          {/* Contenido */}
          <div className="p-4 sm:p-5 max-h-[60vh] sm:max-h-[55vh] overflow-y-auto">
            {activeTab === 'mensaje' ? (
              <div className="space-y-4">
                {/* Plantillas */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                    Plantillas rápidas
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {plantillas.slice(0, 4).map((plantilla) => (
                      <button
                        key={plantilla.id}
                        onClick={() => handleSelectPlantilla(plantilla)}
                        className={`p-3 sm:p-4 text-left rounded-xl border transition-all active:scale-[0.98]
                          ${selectedPlantilla?.id === plantilla.id 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'border-border hover:border-primary/40 hover:bg-secondary/50'}`}
                      >
                        <p className="text-sm font-medium text-foreground">
                          {plantilla.nombre}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                          {plantilla.descripcion}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor de mensaje */}
                {selectedPlantilla && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Mensaje personalizado
                    </label>
                    <textarea
                      value={mensaje}
                      onChange={(e) => setMensaje(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 text-sm leading-relaxed bg-muted/50 text-foreground
                               border border-border rounded-xl 
                               focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary 
                               resize-y min-h-[120px] sm:min-h-[150px] max-h-[300px] placeholder:text-muted-foreground"
                      placeholder="Escribe tu mensaje..."
                    />
                    
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleEnviar}
                        disabled={enviando || !mensaje.trim()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
                                 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold 
                                 rounded-xl transition-all disabled:opacity-50 active:scale-[0.98]"
                      >
                        {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span className="hidden sm:inline">Enviar por WhatsApp</span>
                        <span className="sm:hidden">Enviar</span>
                      </button>
                      <button
                        onClick={handleCopiar}
                        disabled={!mensaje.trim()}
                        className="px-4 py-3 bg-secondary hover:bg-secondary/80 
                                 rounded-xl transition-colors flex items-center gap-2"
                        title="Copiar mensaje"
                      >
                        {copiado ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                        <span className="hidden sm:inline text-sm text-foreground">Copiar</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Acción directa si no hay plantilla seleccionada */}
                {!selectedPlantilla && (
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground text-center mb-3">
                      Selecciona una plantilla arriba o abre WhatsApp directamente
                    </p>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3.5 
                               bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold 
                               rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
                    >
                      <Phone className="w-5 h-5" />
                      Abrir WhatsApp directo
                      <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground mb-2">
                  Transiciones válidas desde <span className="font-semibold text-foreground">{ESTADOS_CONFIG.find(e => e.estado === lead.estado)?.label || lead.estado}</span>
                </p>
                {transitionError && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {transitionError}
                  </div>
                )}
                
                {ESTADOS_CONFIG.filter(e => getValidTransitions(lead.estado).includes(e.estado)).map(({ estado, icon, label, color }) => (
                  <button
                    key={estado}
                    onClick={() => handleCambiarEstado(estado)}
                    disabled={cambioExitoso !== null}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
                      ${cambioExitoso === estado 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'border-border hover:border-border/80 hover:bg-secondary/50'}
                      disabled:opacity-50`}
                  >
                    <div className={`w-8 h-8 rounded-full ${color} text-white flex items-center justify-center`}>
                      {icon}
                    </div>
                    <span className="flex-1 text-left text-sm font-medium text-foreground">
                      {cambioExitoso === estado ? '✓ Actualizado' : label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bloqueo banner */}
          {estaBloqueado && (
            <div className="px-5 py-2.5 bg-red-500/10 border-t border-red-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-red-400">
                <ShieldBan className="w-4 h-4" />
                <span className="font-medium">Número bloqueado — el bot no responderá</span>
              </div>
              <button
                onClick={async () => { await desbloquear(); onRefresh?.(); }}
                className="text-xs font-medium text-red-300 hover:text-red-200 underline underline-offset-2"
              >
                Desbloquear
              </button>
            </div>
          )}

          {/* Bloqueo confirm dialog */}
          {showBloqueoConfirm && (
            <div className="px-5 py-3 border-t border-border bg-red-500/5 space-y-2">
              <p className="text-xs text-red-400 font-medium">¿Bloquear este número? El bot dejará de responder.</p>
              <input
                type="text"
                value={bloqueoMotivo}
                onChange={(e) => setBloqueoMotivo(e.target.value)}
                placeholder="Motivo del bloqueo (opcional)"
                className="w-full px-3 py-2 text-xs bg-muted border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500/30"
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await bloquear(bloqueoMotivo || 'Bloqueado desde CRM');
                    setShowBloqueoConfirm(false);
                    setBloqueoMotivo('');
                    onRefresh?.();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <ShieldBan className="w-3.5 h-3.5" />
                  Confirmar bloqueo
                </button>
                <button
                  onClick={() => { setShowBloqueoConfirm(false); setBloqueoMotivo(''); }}
                  className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-xs font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Footer con info */}
          <div className="px-5 py-3 border-t border-border bg-secondary/30">
            <div className="flex items-center justify-between">
              {historial ? (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {historial.diasSinRespuesta === 0 ? 'Activo hoy' :
                       historial.diasSinRespuesta === 999 ? 'Sin interacción' :
                       `${historial.diasSinRespuesta}d sin respuesta`}
                    </span>
                  </div>
                  <span>{historial.totalMensajesEnviados} enviados</span>
                  <span>{historial.totalMensajesRecibidos} recibidos</span>
                </div>
              ) : <div />}
              {!estaBloqueado && !showBloqueoConfirm && (
                <button
                  onClick={() => setShowBloqueoConfirm(true)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors"
                  title="Bloquear número"
                >
                  <ShieldBan className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bloquear</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


