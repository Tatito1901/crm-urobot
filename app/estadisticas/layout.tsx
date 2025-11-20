'use client';

/**
 * Layout simplificado para Estadísticas
 * Sin sidebar duplicado, usa navegación por tabs
 */

export default function EstadisticasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout mínimo - toda la navegación está en tabs dentro de page.tsx
  return <>{children}</>;
}
