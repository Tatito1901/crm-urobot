'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Home, RefreshCw, Bot, Lightbulb, ArrowLeft } from 'lucide-react';

/**
 * ============================================================
 * PÁGINA 404 - UroBot Perdido
 * ============================================================
 * Página amigable cuando no se encuentra una ruta
 */

// Mensajes aleatorios del robot
const MENSAJES_ROBOT = [
  "¡Ups! Me perdí en el sistema...",
  "Error 404: Mi GPS interno falló",
  "Buscando página... No encontrada",
  "¿Seguro que escribiste bien la dirección?",
  "Esta página se fue de vacaciones",
  "Houston, tenemos un problema... de navegación",
];

const TIPS = [
  "Verifica que la URL esté correcta",
  "Usa el menú para navegar",
  "Vuelve al Dashboard",
];

export default function NotFound() {
  const [mensaje, setMensaje] = useState('');
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    // Seleccionar mensaje aleatorio
    setMensaje(MENSAJES_ROBOT[Math.floor(Math.random() * MENSAJES_ROBOT.length)]);
    
    // Efecto glitch periódico
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-full bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Atmospheric glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-[300px] w-[300px] rounded-full bg-teal-500/[0.04] blur-[100px]" aria-hidden />
      <div className="relative max-w-md w-full text-center space-y-8">
        
        {/* Robot ASCII Art animado */}
        <div className={`font-mono text-2xl sm:text-3xl leading-tight transition-all duration-100 ${glitch ? 'text-red-500 translate-x-1' : 'text-primary'}`}>
          <pre className="inline-block text-left">
{`    ┌───────┐
    │ ✖   ✖ │
    │   ▽   │
    └───┬───┘
   ┌────┴────┐
   │ UROBOT  │
   │  ERROR  │
   └────┬────┘
      ┌─┴─┐
     ─┘   └─`}
          </pre>
        </div>

        {/* Código de error */}
        <div className="space-y-2">
          <h1 className="text-7xl sm:text-8xl font-extrabold text-muted-foreground/20 font-jakarta">
            404
          </h1>
          <p className="text-lg sm:text-xl font-semibold text-foreground font-jakarta">
            Página no encontrada
          </p>
        </div>

        {/* Mensaje del robot */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-2 shine-top">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-mono">
            <Bot className="w-4 h-4 text-teal-400 shrink-0" />
            <span>UroBot dice:</span>
          </div>
          <p className="text-base font-medium text-foreground">
            "{mensaje}"
          </p>
        </div>

        {/* Tips */}
        <div className="text-left bg-teal-500/[0.06] border border-teal-500/20 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-400 mb-2">
            <Lightbulb className="w-3.5 h-3.5 shrink-0" />
            <span>Sugerencias:</span>
          </div>
          <ul className="text-sm text-teal-300 space-y-1">
            {TIPS.map((tip, i) => (
              <li key={i}>• {tip}</li>
            ))}
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 
                       bg-primary text-primary-foreground rounded-xl font-medium
                       hover:opacity-90 transition-all active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Ir al Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 
                       bg-muted text-foreground rounded-xl font-medium
                       hover:bg-muted/80 transition-all active:scale-95
                       border border-border cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver atrás
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          Si el problema persiste, contacta soporte técnico
        </p>
      </div>
    </div>
  );
}
