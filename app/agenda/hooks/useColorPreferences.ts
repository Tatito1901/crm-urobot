/**
 * ============================================================
 * HOOK: useColorPreferences - Gestión de colores por sede
 * ============================================================
 * Maneja colores personalizables para Polanco y Satélite
 * Persiste preferencias en localStorage
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Colores por defecto
const DEFAULT_COLORS = {
  POLANCO: '#3b82f6',  // Azul
  SATELITE: '#10b981', // Verde
};

interface ColorPreferences {
  // Colores por sede
  sedeColors: {
    POLANCO: string;
    SATELITE: string;
  };
  
  // Acciones
  setSedeColor: (sede: 'POLANCO' | 'SATELITE', color: string) => void;
  resetToDefaults: () => void;
}

/**
 * Store de Zustand para preferencias de color
 * Persiste automáticamente en localStorage
 */
export const useColorPreferences = create<ColorPreferences>()(
  persist(
    (set) => ({
      // Estado inicial
      sedeColors: DEFAULT_COLORS,
      
      // Cambiar color de sede
      setSedeColor: (sede, color) => {
        set((state) => ({
          sedeColors: {
            ...state.sedeColors,
            [sede]: color,
          },
        }));
      },
      
      // Resetear a valores por defecto
      resetToDefaults: () => {
        set({ sedeColors: DEFAULT_COLORS });
      },
    }),
    {
      name: 'agenda-colors',
    }
  )
);

/**
 * Hook simple para obtener el color de una cita por sede
 */
export function useAppointmentColor(sede: string): string {
  const { sedeColors } = useColorPreferences();
  return sedeColors[sede as 'POLANCO' | 'SATELITE'] || '#64748b';
}
