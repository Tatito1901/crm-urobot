import { memo } from 'react'
import { MedicalCrossIcon } from './AuthIcons'
import { AuthClient } from './AuthClient'

// Componente decorativo para el lado derecho con estética médica
const BrandingSection = memo(() => (
  <div className="relative hidden h-full flex-col bg-[#060a14] p-10 text-white dark:border-r border-white/[0.04] lg:flex overflow-hidden">
    {/* Refined grid pattern */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
    
    {/* Atmospheric glows */}
    <div className="absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-teal-500/[0.06] blur-[120px]" />
    <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-cyan-500/[0.04] blur-[100px]" />
    
    <div className="relative z-20 flex items-center justify-between w-full">
      <div className="flex items-center text-lg font-medium tracking-tight gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/15 to-cyan-500/15 ring-1 ring-white/10 shadow-[0_0_20px_rgba(20,184,166,0.15)]">
          <MedicalCrossIcon />
        </div>
        <div>
          <span className="font-bold text-white font-jakarta text-base">Urobot</span>
          <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-semibold">CRM Clínico</p>
        </div>
      </div>
    </div>
    
    <div className="relative z-20 mt-auto mb-12">
      <blockquote className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">
            {/* Shine top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent" />
            
            <p className="text-lg font-medium leading-relaxed text-white/80 tracking-wide font-jakarta">
            &ldquo;Gestión integral optimizada para la práctica urológica moderna. 
            Control total de pacientes, agenda y seguimiento en una sola plataforma.&rdquo;
            </p>
            <footer className="mt-6 flex items-center gap-4 border-t border-white/[0.06] pt-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500/15 to-cyan-500/15 flex items-center justify-center text-xs font-bold text-teal-300 ring-1 ring-white/10">
                    UR
                </div>
                <div>
                    <div className="text-sm font-bold text-white font-jakarta">Sistema Clínico Inteligente</div>
                    <div className="text-[10px] text-teal-300/50 font-mono tracking-wider">v2.4.0 stable</div>
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
      <div className="relative w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-[#04070e] p-4 sm:p-8 overflow-hidden">
        
        {/* Atmospheric glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-teal-500/[0.04] via-transparent to-transparent" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Glass card */}
        <div className="relative mx-auto flex w-full max-w-[440px] flex-col justify-center space-y-6 sm:space-y-8 p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/50 dark:border-white/[0.06] bg-white/95 dark:bg-white/[0.03] backdrop-blur-sm sm:backdrop-blur-xl shadow-xl dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]">
          
          {/* Teal shine top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />
          
          {/* Header */}
          <div className="flex flex-col space-y-3 text-center">
            <div className="mx-auto mb-2 flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 text-teal-500 dark:text-teal-400 lg:hidden ring-1 ring-teal-500/20">
              <MedicalCrossIcon />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white font-jakarta">
              Portal Urobot
            </h1>
            <p className="text-sm font-medium text-muted-foreground">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          {/* Formulario Cliente */}
          <AuthClient />
        </div>
      </div>
    </div>
  )
}
