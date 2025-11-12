import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendario de Consultas · Dr. Mario Martínez Thomas',
  description: 'Calendario semanal de citas y consultas médicas',
};

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
