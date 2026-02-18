'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Send, 
  MessageSquare,
  ExternalLink,
  Phone,
  Loader2,
  Copy,
  Check,
  Sparkles,
  User,
  X,
  ChevronDown,
  Star,
  XCircle,
  Calendar,
  Clock,
  Zap
} from 'lucide-react';
import { 
  getEtapaConfig, 
  getPlantillasParaEtapa, 
  personalizarPlantilla,
  PLANTILLAS_MENSAJE,
  type PlantillaMensaje
} from '@/app/lib/funnel-config';
import { useLeadActions } from '@/hooks/useLeadActions';
import { useLeadByTelefono } from '@/hooks/useLeadByTelefono';
import type { LeadEstado } from '@/types/leads';

// ============================================================
// TIPOS
// ============================================================

interface ConversationActionsPanelProps {
  telefono: string;
  nombreContacto: string | null;
  onClose?: () => void;
  isMobile?: boolean;
}

// Estados con iconos de Lucide
const ESTADOS_CONFIG: { estado: LeadEstado; icon: React.ReactNode; label: string; color: string }[] = [
  { estado: 'interesado', icon: <Star className="w-3.5 h-3.5" />, label: 'Interesado', color: 'text-amber-500' },
  { estado: 'calificado', icon: <Check className="w-3.5 h-3.5" />, label: 'Calificado', color: 'text-emerald-500' },
  { estado: 'convertido', icon: <Zap className="w-3.5 h-3.5" />, label: 'Paciente', color: 'text-blue-500' },
  { estado: 'no_interesado', icon: <XCircle className="w-3.5 h-3.5" />, label: 'No interesa', color: 'text-slate-400' },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function ConversationActionsPanel({ 
  telefono, 
  nombreContacto,
  onClose,
  isMobile = false
}: ConversationActionsPanelProps) {
  // Estados
  const [selectedPlantilla, setSelectedPlantilla] = useState<PlantillaMensaje | null>(null);
  const [mensajePersonalizado, setMensajePersonalizado] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [cambioExitoso, setCambioExitoso] = useState<string | null>(null);
  const [showPlantillas, setShowPlantillas] = useState(false);
  
  // Obtener lead por teléfono
  const { lead, isLoading: loadingLead, refetch: refetchLead } = useLeadByTelefono(telefono);
  
  // Hook de acciones
  const { 
    recomendacion, 
    isLoading: loadingActions,
    enviarMensajeWhatsApp,
    cambiarEstado,
    generarURLWhatsApp
  } = useLeadActions(lead);

  // Plantillas según estado del lead
  const plantillas = useMemo(() => {
    if (!lead) return PLANTILLAS_MENSAJE.slice(0, 4);
    return getPlantillasParaEtapa(lead.estado);
  }, [lead]);

  const etapaConfig = lead ? getEtapaConfig(lead.estado) : null;

  // Generar URL de WhatsApp
  const whatsappUrl = useMemo(() => {
    const telefonoLimpio = telefono.replace(/\D/g, '');
    const telefonoCompleto = telefonoLimpio.length === 10 ? `52${telefonoLimpio}` : telefonoLimpio;
    return `https://wa.me/${telefonoCompleto}`;
  }, [telefono]);

  // Seleccionar plantilla
  const handleSelectPlantilla = useCallback((plantilla: PlantillaMensaje) => {
    setSelectedPlantilla(plantilla);
    const mensaje = personalizarPlantilla(plantilla.mensaje, {
      nombre: nombreContacto || lead?.nombre || 'paciente',
    });
    setMensajePersonalizado(mensaje);
    setShowPlantillas(false);
  }, [nombreContacto, lead]);

  // Enviar mensaje
  const handleEnviarMensaje = useCallback(async () => {
    if (!mensajePersonalizado.trim()) return;
    
    setEnviando(true);
    try {
      const url = `${whatsappUrl}?text=${encodeURIComponent(mensajePersonalizado)}`;
      window.open(url, '_blank');
      
      if (lead) {
        await enviarMensajeWhatsApp(mensajePersonalizado, selectedPlantilla?.id);
        await refetchLead();
      }
      
      setSelectedPlantilla(null);
      setMensajePersonalizado('');
    } finally {
      setEnviando(false);
    }
  }, [mensajePersonalizado, whatsappUrl, lead, enviarMensajeWhatsApp, selectedPlantilla, refetchLead]);

  // Copiar mensaje
  const handleCopiar = useCallback(async () => {
    if (!mensajePersonalizado.trim()) return;
    await navigator.clipboard.writeText(mensajePersonalizado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }, [mensajePersonalizado]);

  // Cambiar estado
  const handleCambiarEstado = useCallback(async (nuevoEstado: LeadEstado) => {
    if (!lead) return;
    await cambiarEstado(nuevoEstado);
    await refetchLead();
    setCambioExitoso(nuevoEstado);
    setTimeout(() => setCambioExitoso(null), 2000);
  }, [lead, cambiarEstado, refetchLead]);

  const isLoading = loadingLead || loadingActions;

  // Clases base según si es móvil o desktop
  const containerClass = isMobile 
    ? "flex flex-col bg-white dark:bg-slate-900 rounded-t-2xl max-h-[85vh]"
    : "flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className={`shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between ${isMobile ? 'pt-2' : ''}`}>
        {isMobile && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
        )}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Acciones</h3>
            <p className="text-[10px] text-slate-500">{nombreContacto || 'Contacto'}</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-4'} space-y-3`}>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* ===== ACCIÓN PRINCIPAL: WhatsApp ===== */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 
                       hover:from-emerald-600 hover:to-emerald-700 rounded-xl transition-all shadow-lg shadow-emerald-500/20
                       active:scale-[0.98]"
            >
              <Phone className="w-5 h-5 text-white" />
              <span className="text-sm font-semibold text-white flex-1">Abrir WhatsApp</span>
              <ExternalLink className="w-4 h-4 text-white/70" />
            </a>

            {/* ===== ESTADO DEL LEAD ===== */}
            {lead && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Estado actual</span>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1
                    ${lead.estado === 'convertido' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 
                      lead.estado === 'interesado' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' : 
                      'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'}`}
                  >
                    {etapaConfig?.icon} {etapaConfig?.nombre || lead.estado}
                  </div>
                </div>
                
                {/* Botones de cambio de estado */}
                <div className="grid grid-cols-2 gap-2">
                  {ESTADOS_CONFIG.filter(e => e.estado !== lead.estado).slice(0, 4).map(({ estado, icon, label, color }) => (
                    <button
                      key={estado}
                      onClick={() => handleCambiarEstado(estado)}
                      disabled={cambioExitoso !== null}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg
                               bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                               hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm
                               active:scale-[0.98] transition-all disabled:opacity-50
                               ${cambioExitoso === estado ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-500/20' : ''}`}
                    >
                      <span className={color}>{icon}</span>
                      <span>{cambioExitoso === estado ? '¡Listo!' : label}</span>
                    </button>
                  ))}
                </div>

                {/* Recomendación */}
                {recomendacion && recomendacion.prioridad !== 'no_contactar' && (
                  <div className={`mt-3 p-2.5 rounded-lg text-xs ${
                    recomendacion.prioridad === 'alta' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300' :
                    recomendacion.prioridad === 'media' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' :
                    'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                  }`}>
                    💡 {recomendacion.razon}
                  </div>
                )}
              </div>
            )}

            {/* ===== MENSAJES RÁPIDOS ===== */}
            <div className="space-y-2">
              <button
                onClick={() => setShowPlantillas(!showPlantillas)}
                className="flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-slate-800 
                         border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 
                         dark:hover:border-slate-600 transition-all"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {selectedPlantilla ? selectedPlantilla.nombre : 'Mensaje rápido'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showPlantillas ? 'rotate-180' : ''}`} />
              </button>

              {/* Lista de plantillas */}
              {showPlantillas && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl 
                              overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {plantillas.slice(0, 5).map((plantilla, idx) => (
                    <button
                      key={plantilla.id}
                      onClick={() => handleSelectPlantilla(plantilla)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 
                                transition-colors ${idx !== 0 ? 'border-t border-slate-100 dark:border-slate-700' : ''}`}
                    >
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{plantilla.nombre}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{plantilla.descripcion}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Editor de mensaje */}
              {selectedPlantilla && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <textarea
                    value={mensajePersonalizado}
                    onChange={(e) => setMensajePersonalizado(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 
                             dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 
                             focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                    placeholder="Escribe tu mensaje..."
                  />
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleEnviarMensaje}
                      disabled={enviando || !mensajePersonalizado.trim()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                               bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold 
                               rounded-xl transition-all active:scale-[0.98]
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Enviar
                    </button>
                    <button
                      onClick={handleCopiar}
                      disabled={!mensajePersonalizado.trim()}
                      className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 
                               dark:hover:bg-slate-700 rounded-xl transition-colors
                               disabled:opacity-50"
                      title="Copiar"
                    >
                      {copiado ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                    </button>
                    <button
                      onClick={() => { setSelectedPlantilla(null); setMensajePersonalizado(''); }}
                      className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 
                               dark:hover:bg-slate-700 rounded-xl transition-colors"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ===== ACCIONES SECUNDARIAS ===== */}
            {lead && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={`/leads?search=${telefono}`}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 
                           hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-xs font-medium
                           text-slate-600 dark:text-slate-300"
                >
                  <User className="w-4 h-4" />
                  Ver perfil
                </a>
                <a
                  href={`/citas/nueva?telefono=${telefono}`}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 
                           hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-xs font-medium
                           text-slate-600 dark:text-slate-300"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar cita
                </a>
              </div>
            )}

            {/* Info si no hay lead */}
            {!lead && (
              <div className="text-center py-4">
                <User className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Contacto no registrado como lead</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer con último contacto */}
      {lead && lead.ultimaInteraccion && (
        <div className="shrink-0 px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Clock className="w-3 h-3" />
            <span>Último contacto: {new Date(lead.ultimaInteraccion).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConversationActionsPanel;
