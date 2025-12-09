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
  AlertCircle
} from 'lucide-react';
import { 
  getEtapaConfig, 
  getPlantillasParaEtapa, 
  personalizarPlantilla,
  type PlantillaMensaje
} from '@/app/lib/funnel-config';
import { useLeadActions } from '@/hooks/useLeadActions';
import type { Lead, LeadEstado } from '@/types/leads';

// ============================================================
// TIPOS
// ============================================================

interface LeadActionsModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

// Estados con configuración visual
const ESTADOS_CONFIG: { estado: LeadEstado; icon: React.ReactNode; label: string; color: string }[] = [
  { estado: 'Nuevo', icon: <Star className="w-4 h-4" />, label: 'Nuevo', color: 'bg-blue-500' },
  { estado: 'Contactado', icon: <MessageSquare className="w-4 h-4" />, label: 'Contactado', color: 'bg-cyan-500' },
  { estado: 'Interesado', icon: <Zap className="w-4 h-4" />, label: 'Interesado', color: 'bg-amber-500' },
  { estado: 'Calificado', icon: <Check className="w-4 h-4" />, label: 'Calificado', color: 'bg-emerald-500' },
  { estado: 'Convertido', icon: <User className="w-4 h-4" />, label: 'Paciente', color: 'bg-green-600' },
  { estado: 'No_Interesado', icon: <XCircle className="w-4 h-4" />, label: 'No interesado', color: 'bg-slate-400' },
  { estado: 'Perdido', icon: <X className="w-4 h-4" />, label: 'Perdido', color: 'bg-red-500' },
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
      nombre: lead.nombreCompleto || lead.nombre || 'paciente',
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

  // Cambiar estado
  const handleCambiarEstado = useCallback(async (nuevoEstado: LeadEstado) => {
    await cambiarEstado(nuevoEstado);
    setCambioExitoso(nuevoEstado);
    setTimeout(() => {
      setCambioExitoso(null);
      onRefresh?.();
      onClose();
    }, 1000);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md 
                     animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-5 pt-5 pb-4 border-b border-slate-200 dark:border-slate-700">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
            
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold
                ${lead.estado === 'Convertido' ? 'bg-emerald-500' : 
                  lead.estado === 'Interesado' ? 'bg-amber-500' : 
                  lead.estado === 'Calificado' ? 'bg-green-500' : 'bg-blue-500'}`}
              >
                {(lead.nombre || lead.telefono).slice(0, 2).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {lead.nombre || lead.nombreCompleto || 'Sin nombre'}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                    ${lead.estado === 'Convertido' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 
                      lead.estado === 'Interesado' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' : 
                      'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'}`}
                  >
                    {etapaConfig?.icon} {etapaConfig?.nombre || lead.estado}
                  </span>
                  <span className="text-xs text-slate-400">{lead.telefono}</span>
                </div>
              </div>
            </div>

            {/* Recomendación IA */}
            {recomendacion && recomendacion.prioridad !== 'no_contactar' && (
              <div className={`mt-3 p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                recomendacion.prioridad === 'alta' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300' :
                recomendacion.prioridad === 'media' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' :
                'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{recomendacion.razon}</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('mensaje')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative
                ${activeTab === 'mensaje' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Enviar mensaje
              </div>
              {activeTab === 'mensaje' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('estado')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative
                ${activeTab === 'estado' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Cambiar estado
              </div>
              {activeTab === 'estado' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          </div>

          {/* Contenido */}
          <div className="p-5 max-h-[50vh] overflow-y-auto">
            {activeTab === 'mensaje' ? (
              <div className="space-y-4">
                {/* Plantillas */}
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                    Plantillas rápidas
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {plantillas.slice(0, 4).map((plantilla) => (
                      <button
                        key={plantilla.id}
                        onClick={() => handleSelectPlantilla(plantilla)}
                        className={`p-3 text-left rounded-xl border transition-all
                          ${selectedPlantilla?.id === plantilla.id 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                      >
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                          {plantilla.nombre}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          {plantilla.descripcion}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor de mensaje */}
                {selectedPlantilla && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Mensaje personalizado
                    </label>
                    <textarea
                      value={mensaje}
                      onChange={(e) => setMensaje(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 
                               dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 
                               focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                      placeholder="Escribe tu mensaje..."
                    />
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleEnviar}
                        disabled={enviando || !mensaje.trim()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                                 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold 
                                 rounded-xl transition-all disabled:opacity-50"
                      >
                        {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Enviar por WhatsApp
                      </button>
                      <button
                        onClick={handleCopiar}
                        disabled={!mensaje.trim()}
                        className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 
                                 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        title="Copiar"
                      >
                        {copiado ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Acción directa si no hay plantilla seleccionada */}
                {!selectedPlantilla && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 
                             bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold 
                             rounded-xl transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    Abrir WhatsApp directo
                    <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
                  </a>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 mb-4">
                  Selecciona el nuevo estado del lead
                </p>
                
                {ESTADOS_CONFIG.filter(e => e.estado !== lead.estado).map(({ estado, icon, label, color }) => (
                  <button
                    key={estado}
                    onClick={() => handleCambiarEstado(estado)}
                    disabled={cambioExitoso !== null}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
                      ${cambioExitoso === estado 
                        ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-500/20 dark:border-emerald-500/50' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                      disabled:opacity-50`}
                  >
                    <div className={`w-8 h-8 rounded-full ${color} text-white flex items-center justify-center`}>
                      {icon}
                    </div>
                    <span className="flex-1 text-left text-sm font-medium text-slate-700 dark:text-slate-200">
                      {cambioExitoso === estado ? '✓ Actualizado' : label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer con info */}
          {historial && (
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {historial.diasSinRespuesta === 0 ? 'Activo hoy' :
                     historial.diasSinRespuesta === 999 ? 'Sin interacción' :
                     `${historial.diasSinRespuesta}d sin respuesta`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{historial.totalMensajesEnviados} enviados</span>
                  <span>{historial.totalMensajesRecibidos} recibidos</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default LeadActionsModal;
