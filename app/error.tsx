'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Home, ChevronDown, Activity, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

/**
 * ============================================================
 * ERROR PAGE - Estilo Corporativo
 * ============================================================
 * Diseño profesional, limpio y orientado a la confianza.
 */

const MENSAJES_SISTEMA = [
  { titulo: "Interrupción del Servicio", desc: "El sistema ha encontrado una excepción no controlada. Se ha generado un reporte automático." },
  { titulo: "Error de Procesamiento", desc: "No se pudo completar la solicitud actual debido a un problema de conexión o estabilidad." },
  { titulo: "Mantenimiento Preventivo", desc: "El sistema requiere una actualización de estado para garantizar la integridad de los datos." },
];

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  const [info, setInfo] = useState(MENSAJES_SISTEMA[0]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Seleccionar mensaje aleatorio
    setInfo(MENSAJES_SISTEMA[Math.floor(Math.random() * MENSAJES_SISTEMA.length)]);
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Atmospheric glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-[300px] w-[300px] rounded-full bg-teal-500/[0.04] blur-[100px]" aria-hidden />
      <div className="relative max-w-md w-full bg-white/[0.03] rounded-xl shadow-sm border border-white/[0.06] p-8 text-center shine-top">
        
        {/* Icono Corporativo */}
        <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-teal-500/20">
          <Activity className="w-8 h-8 text-teal-400" />
        </div>

        {/* Textos Principales */}
        <h1 className="text-xl font-bold text-foreground mb-3 font-jakarta">
          {info.titulo}
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          {info.desc}
        </p>

        {/* Botones de Acción */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                       bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium 
                       transition-colors shadow-sm shadow-teal-600/20"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar operación
          </button>
          
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                       bg-white/[0.04] text-slate-300 
                       border border-white/[0.08] rounded-lg font-medium 
                       hover:bg-white/[0.06] transition-colors"
          >
            <Home className="w-4 h-4" />
            Regresar al Dashboard
          </Link>
        </div>

        {/* Separador */}
        <div className="h-px bg-slate-800 my-8 w-full" />

        {/* Mensaje de Seguridad */}
        <div className="flex items-start gap-3 text-left mb-6">
          <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-slate-300">
              Datos protegidos
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              La integridad de su información no se ha visto comprometida por este evento.
            </p>
          </div>
        </div>

        {/* Detalles Técnicos */}
        <div className="text-left">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-teal-500 transition-colors"
          >
            {showDetails ? 'Ocultar diagnóstico' : 'Ver diagnóstico técnico'}
            <ChevronDown className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </button>
          
          {showDetails && (
            <div className="mt-3 bg-slate-950 border border-slate-800 rounded p-3 overflow-x-auto">
              <p className="font-mono text-[10px] text-red-500/80">
                {error.message || 'Excepción no identificada'}
              </p>
              {error.digest && (
                <p className="font-mono text-[10px] text-slate-400 mt-1">
                  Ref: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-[10px] text-slate-400 mt-8">
          UroBot CRM v2.0 • Soporte Técnico 24/7
        </p>
      </div>
    </div>
  );
}
