import { memo } from 'react'

/**
 * Iconos optimizados para la página de autenticación
 * Memoizados para evitar re-renders innecesarios
 */

// Icono de Cruz Médica Minimalista
export const MedicalCrossIcon = memo(() => (
  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
))
MedicalCrossIcon.displayName = 'MedicalCrossIcon'

export const AlertIcon = memo(() => (
  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
))
AlertIcon.displayName = 'AlertIcon'
