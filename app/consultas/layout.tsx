import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consultas',
  description: 'Historial y gestión de consultas médicas',
};

export default function ConsultasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
