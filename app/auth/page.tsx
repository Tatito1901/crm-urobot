import { memo } from 'react'
import { ShieldIcon, SecurityBadgeIcon } from './AuthIcons'
import { AuthClient } from './AuthClient'

// Componente de fondo optimizado y memoizado
const BackgroundEffects = memo(() => (
  <div className="pointer-events-none absolute inset-0" aria-hidden="true">
    <div className="absolute left-1/4 top-20 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse will-change-transform" />
    <div className="absolute right-1/4 bottom-20 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse will-change-transform" style={{ animationDelay: '1s' }} />
    <div className="absolute left-1/2 top-1/2 h-48 w-48 sm:h-64 sm:w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-3xl" />
  </div>
))
BackgroundEffects.displayName = 'BackgroundEffects'

/**
 * Página de autenticación (Server Component)
 * 
 * Esta página es un Server Component puro que renderiza la estructura estática
 * y delega toda la lógica del cliente (formulario, estado, overlay) a AuthClient
 */
export default function AuthPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-white">
      {/* Efectos de fondo optimizados */}
      <BackgroundEffects />

      {/* Contenedor principal */}
      <div className="relative w-full max-w-md space-y-6 sm:space-y-8">
        {/* Logo y header */}
        <header className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform hover:scale-105">
            <ShieldIcon />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-blue-400/60 font-medium">
              CRM Urología
            </p>
            <h1 className="mt-2 sm:mt-3 text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Acceso al sistema
            </h1>
            <p className="mt-2 sm:mt-3 text-sm text-slate-400 max-w-sm mx-auto leading-relaxed px-4 sm:px-0">
              Plataforma integral para gestión de consultas, pacientes y leads médicos
            </p>
          </div>
        </header>

        {/* Card de login con Client Component */}
        <main className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
          <div className="p-6 sm:p-8 space-y-5 sm:space-y-6">
            {/* AuthClient maneja todo el estado y la lógica del cliente */}
            <AuthClient />
          </div>

          {/* Footer del card */}
          <footer className="border-t border-white/10 bg-white/[0.01] px-6 sm:px-8 py-4">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <SecurityBadgeIcon />
              <span className="text-center">Conexión segura • Cifrado de extremo a extremo</span>
            </div>
          </footer>
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-600">
          CRM Urología © 2025 • Desarrollado con Next.js y Supabase
        </footer>
      </div>
    </div>
  )
}
