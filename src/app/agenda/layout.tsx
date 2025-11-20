/**
 * ============================================================
 * LAYOUT DE AGENDA - Sin sidebar para maximizar espacio
 * ============================================================
 * La agenda usa su propio layout fullscreen
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agenda | CRM Urobot',
  description: 'Calendario interactivo de consultas médicas',
};

export default function AgendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
