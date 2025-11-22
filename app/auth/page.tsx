import { memo } from 'react'
import { MedicalCrossIcon } from './AuthIcons'
import { AuthClient } from './AuthClient'

// Componente decorativo para el lado derecho con estética médica
const BrandingSection = memo(() => (
  <div className="relative hidden h-full flex-col bg-slate-950 p-10 text-white dark:border-r lg:flex">
    <div className="absolute inset-0 bg-slate-950" />
    {/* Grid Pattern clínico */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
    
    {/* Efectos de luz ambiental animados */}
    <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px] animate-pulse duration-[4000ms]" />
    <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[100px] animate-pulse duration-[5000ms] delay-1000" />
    
    <div className="relative z-20 flex items-center justify-between w-full">
      <div className="flex items-center text-lg font-medium tracking-tight">
        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.2)] ring-1 ring-white/20">
          <MedicalCrossIcon />
        </div>
        <span className="font-semibold text-white">CRM Urobot</span>
      </div>
    </div>
    
    <div className="relative z-20 mt-auto mb-12">
      <blockquote className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
            {/* Brillo decorativo superior */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            
            <p className="text-lg font-medium leading-relaxed text-slate-100 tracking-wide">
            &ldquo;Gestión integral optimizada para la práctica urológica moderna. 
            Control total de pacientes, agenda y seguimiento en una sola plataforma.&rdquo;
            </p>
            <footer className="mt-6 flex items-center gap-4 border-t border-white/10 pt-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center text-xs font-bold text-emerald-300 border border-white/10 shadow-inner">
                    UR
                </div>
                <div>
                    <div className="text-sm font-bold text-white">Sistema Clínico Inteligente</div>
                    <div className="text-xs text-emerald-200/70 font-mono">v2.4.0 stable</div>
                </div>
            </footer>
        </div>
      </blockquote>
    </div>
  </div>
))
BrandingSection.displayName = 'BrandingSection'

export default function AuthPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center lg:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      
      {/* Lado Derecho: Branding Médico (Visible en Desktop) */}
      <BrandingSection />

      {/* Lado Izquierdo: Formulario */}
      <div className="relative w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-[#020202] p-4 sm:p-8 overflow-hidden">
        
        {/* Decoración de Fondo Sutil (Premium Feel) - Optimizado móvil: Menor opacidad */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent opacity-40 sm:opacity-100" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-300/20 dark:via-white/10 to-transparent" />

        {/* Tarjeta Optimizada: Menos blur y más opacidad en móvil para 60FPS */}
        <div className="relative mx-auto flex w-full max-w-[450px] flex-col justify-center space-y-6 sm:space-y-8 p-6 sm:p-12 rounded-2xl sm:rounded-3xl border border-slate-200/50 dark:border-white/[0.08] bg-white/95 dark:bg-zinc-900/80 sm:bg-white/80 sm:dark:bg-zinc-900/40 backdrop-blur-sm sm:backdrop-blur-2xl shadow-xl sm:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-none sm:dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]">
          
          {/* Resplandor Cenital Elegante */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent blur-[1px]" />
          
          {/* Header Móvil/Desktop */}
          <div className="flex flex-col space-y-3 text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-emerald-600 lg:hidden shadow-sm border border-slate-100">
              <MedicalCrossIcon />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Portal UROBOT
            </h1>
            <p className="text-base font-medium text-slate-600 dark:text-zinc-300">
              Ingresa credenciales para acceder a información del sistema de automatizaciones
            </p>
          </div>

          {/* Formulario Cliente */}
          <AuthClient />
          
          {/* Footer eliminado */}
        </div>
      </div>
    </div>
  )
}
