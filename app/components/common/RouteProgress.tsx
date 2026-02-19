'use client';

/**
 * ============================================================
 * ROUTE PROGRESS — Indicador visual de navegación entre rutas
 * ============================================================
 * Muestra una barra de progreso animada en la parte superior
 * cuando el usuario navega entre páginas. Usa usePathname para
 * detectar cambios de ruta sin dependencias externas.
 */

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function RouteProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevPathRef = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Si la ruta cambió, completar el progreso
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;

      // Limpiar timers anteriores
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);

      // Completar barra
      setProgress(100);

      // Ocultar después de la animación
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }
  }, [pathname]);

  // Interceptar clicks en links para iniciar el progreso
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href === pathname) return;

      // Iniciar progreso
      setVisible(true);
      setProgress(15);

      // Simular progreso incremental
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return prev;
          }
          return prev + Math.random() * 12;
        });
      }, 200);
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 pointer-events-none" aria-hidden>
      <div
        className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(45,212,191,0.4)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
