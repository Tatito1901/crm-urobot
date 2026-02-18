import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agenda',
  description: 'Calendario y gestión de citas médicas',
};

export default function AgendaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
