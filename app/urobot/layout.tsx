import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Urobot Monitor',
  description: 'Monitoreo y estadísticas del agente Urobot',
};

export default function UrobotLayout({ children }: { children: React.ReactNode }) {
  return children;
}
