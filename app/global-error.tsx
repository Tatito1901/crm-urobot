'use client';

import { useEffect, useState } from 'react';

/**
 * ============================================================
 * GLOBAL ERROR - UroBot Caído
 * ============================================================
 * Captura errores críticos a nivel de root layout
 * NOTA: Este componente debe definir su propio <html> y <body>
 */

const MENSAJES_SISTEMA = [
  { titulo: "Interrupción del Servicio", desc: "El sistema ha encontrado una excepción no controlada. Se ha generado un reporte automático para el equipo técnico." },
  { titulo: "Error de Procesamiento", desc: "No se pudo completar la solicitud actual debido a un problema de conexión o estabilidad." },
  { titulo: "Mantenimiento Preventivo", desc: "El sistema requiere un reinicio para garantizar la integridad de los datos." },
];

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [info, setInfo] = useState(MENSAJES_SISTEMA[0]);
  const [countdown, setCountdown] = useState(15);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Seleccionar mensaje (rotación simple)
    setInfo(MENSAJES_SISTEMA[Math.floor(Math.random() * MENSAJES_SISTEMA.length)]);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    console.error('System Error:', error);
    return () => clearInterval(timer);
  }, [error]);

  return (
    <html lang="es">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          /* NOTA: @import de Google Fonts eliminado — bloquea renderizado.
             global-error.tsx no puede usar next/font, así que usamos system fonts. */
          
          body {
            margin: 0;
            padding: 0;
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            background: #f1f5f9; /* Slate 100 */
            color: #334155; /* Slate 700 */
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .container {
            width: 100%;
            max-width: 520px;
            padding: 2rem;
          }

          .card {
            background: #ffffff;
            border-radius: 12px;
            padding: 3rem 2.5rem;
            text-align: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #e2e8f0;
          }

          .icon-container {
            background: #eff6ff; /* Blue 50 */
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
          }

          h1 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #0f172a; /* Slate 900 */
            margin: 0 0 0.75rem;
          }

          p {
            color: #64748b; /* Slate 500 */
            font-size: 0.95rem;
            line-height: 1.6;
            margin: 0 0 2rem;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            text-decoration: none;
          }

          .btn-primary {
            background: #2563eb; /* Blue 600 */
            color: white;
          }

          .btn-primary:hover {
            background: #1d4ed8; /* Blue 700 */
          }

          .btn-secondary {
            background: white;
            color: #475569;
            border: 1px solid #cbd5e1;
            margin-top: 0.75rem;
          }

          .btn-secondary:hover {
            background: #f8fafc;
            border-color: #94a3b8;
          }

          .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 2rem 0;
            width: 100%;
          }

          .technical-info {
            text-align: left;
          }

          .toggle-btn {
            background: none;
            border: none;
            color: #64748b;
            font-size: 0.8rem;
            font-weight: 500;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .toggle-btn:hover {
            color: #2563eb;
          }

          .error-code {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 1rem;
            margin-top: 1rem;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 0.75rem;
            color: #ef4444; /* Red 500 */
            overflow-x: auto;
          }
          
          .footer {
            margin-top: 2rem;
            font-size: 0.75rem;
            color: #94a3b8;
          }
          
          /* Animación sutil del icono */
          @keyframes pulse-soft {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          .animate-pulse {
            animation: pulse-soft 3s infinite ease-in-out;
          }
        `}} />
      </head>
      <body>
        <div className="container">
          <div className="card">
            {/* Icono Profesional SVG */}
            <div className="icon-container">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V12" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16H12.01" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h1>{info.titulo}</h1>
            <p>{info.desc}</p>

            <button onClick={reset} className="btn btn-primary">
              Reintentar Conexión ({countdown}s)
            </button>
            
            <button onClick={() => window.location.href = '/dashboard'} className="btn btn-secondary">
              Regresar al Dashboard
            </button>

            <div className="divider" />

            <div className="technical-info">
              <button onClick={() => setShowDetails(!showDetails)} className="toggle-btn">
                {showDetails ? 'Ocultar diagnóstico técnico' : 'Ver diagnóstico técnico'}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{transform: showDetails ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s'}}>
                  <path d="M6 9L12 15L18 9" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {showDetails && (
                <div className="error-code">
                  <strong>Stack Trace:</strong><br/>
                  {error.message || 'Excepción no identificada'}
                  {error.digest && <div style={{marginTop: '0.5rem', color: '#64748b'}}>Ref ID: {error.digest}</div>}
                </div>
              )}
            </div>
            
            <div className="footer">
              UroBot CRM • Soporte Técnico Disponible 24/7
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
