/**
 * Layout para /conversaciones
 * Suspense boundary requerido porque page.tsx usa useSearchParams()
 * Sin esto, toda la página hace CSR bailout (pierde static rendering)
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import ConversacionesLoading from './loading';

export const metadata: Metadata = {
  title: 'Conversaciones',
  description: 'Historial de mensajes y conversaciones con contactos',
};

export default function ConversacionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<ConversacionesLoading />}>
      {children}
    </Suspense>
  );
}
