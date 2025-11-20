/**
 * ============================================================
 * THEME PROVIDER - Proveedor de temas para toda la app
 * ============================================================
 * Usa next-themes para soporte SSR perfecto
 */

'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      storageKey="urobot-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
