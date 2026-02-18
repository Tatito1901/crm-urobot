import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leads',
  description: 'Gestión de leads y embudo de conversión',
};

export default function LeadsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
