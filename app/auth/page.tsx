import { memo } from 'react'
import { MedicalCrossIcon, ShieldIcon, LockIcon } from './AuthIcons'
import { AuthClient } from './AuthClient'

// Componente decorativo para el lado izquierdo con estética médica premium
const BrandingSection = memo(() => (
  <div className="relative hidden h-full flex-col bg-[#050a12] p-10 xl:p-14 text-white dark:border-r border-white/[0.04] lg:flex overflow-hidden">
    {/* Subtle dot pattern */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.03)_1px,_transparent_0)] bg-[size:24px_24px]" />
    
    {/* Atmospheric glows */}
    <div className="absolute -left-32 top-1/4 h-[600px] w-[600px] rounded-full bg-teal-500/[0.05] blur-[150px]" />
    <div className="absolute -bottom-32 right-0 h-[500px] w-[500px] rounded-full bg-cyan-600/[0.04] blur-[130px]" />
    <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-emerald-500/[0.03] blur-[100px]" />

    {/* Top bar - Logo */}
    <div className="relative z-20 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/15 to-cyan-500/15 ring-1 ring-white/[0.08] shadow-[0_0_24px_rgba(20,184,166,0.12)]">
        <MedicalCrossIcon />
      </div>
      <div>
        <span className="font-bold text-white font-jakarta text-[15px] tracking-tight">Urobot</span>
        <p className="text-[8px] uppercase tracking-[0.35em] text-white/25 font-semibold mt-0.5">CRM Clínico</p>
      </div>
    </div>
    
    {/* Center content - Doctor info */}
    <div className="relative z-20 flex-1 flex flex-col justify-center max-w-md">
      <div className="space-y-8">
        {/* Doctor avatar + name */}
        <div className="space-y-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/10 ring-1 ring-white/[0.08] text-2xl font-bold text-teal-300 font-jakarta shadow-[0_0_32px_rgba(20,184,166,0.15)]">
            MM
          </div>
          <div className="space-y-2">
            <h2 className="text-[28px] xl:text-[32px] font-extrabold text-white font-jakarta tracking-tight leading-[1.15]">
              Dr. Mario Martínez<br />
              <span className="text-white/60">Thomas</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="h-1 w-8 rounded-full bg-gradient-to-r from-teal-400 to-transparent" />
              <p className="text-[11px] uppercase tracking-[0.2em] text-teal-400/70 font-semibold">
                Urología
              </p>
            </div>
          </div>
        </div>

        {/* Quote card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.025] p-6 xl:p-7">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/20 to-transparent" />
          <p className="text-[15px] font-medium leading-relaxed text-white/60 font-jakarta">
            &ldquo;Gestión integral optimizada para la práctica urológica moderna. 
            Control total de pacientes, agenda y seguimiento clínico.&rdquo;
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2">
          {['Agenda Inteligente', 'Expedientes', 'Seguimiento', 'Métricas'].map((f) => (
            <span key={f} className="inline-flex items-center rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-white/40 tracking-wide">
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>

    {/* Bottom - Security badge */}
    <div className="relative z-20 flex items-center gap-2.5 text-white/20">
      <ShieldIcon className="w-4 h-4" />
      <span className="text-[10px] font-medium tracking-wider uppercase">Datos protegidos con encriptación end-to-end</span>
    </div>
  </div>
))
BrandingSection.displayName = 'BrandingSection'

export default function AuthPage() {
  return (
    <div className="relative min-h-[100dvh] flex-col items-center justify-center lg:grid lg:max-w-none lg:grid-cols-[1fr_1.1fr] lg:px-0">
      
      {/* Lado Izquierdo: Branding Médico (Visible en Desktop) */}
      <BrandingSection />

      {/* Lado Derecho: Formulario */}
      <div className="relative w-full min-h-[100dvh] lg:min-h-0 h-full flex items-center justify-center bg-slate-50 dark:bg-[#04070e] p-5 sm:p-8 overflow-hidden">
        
        {/* Atmospheric glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-teal-500/[0.03] blur-[120px] pointer-events-none" />

        {/* Form container */}
        <div className="relative z-10 mx-auto flex w-full max-w-[420px] flex-col justify-center">
          
          {/* Mobile-only header */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 text-teal-500 dark:text-teal-400 ring-1 ring-teal-500/15 mb-5">
              <MedicalCrossIcon />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-jakarta">
              Dr. Mario Martínez Thomas
            </h1>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium">Urología</p>
          </div>

          {/* Glass card */}
          <div className="relative p-6 sm:p-8 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] shadow-xl shadow-slate-200/50 dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            
            {/* Teal shine top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/5 h-[1px] bg-gradient-to-r from-transparent via-teal-400/30 to-transparent" />
            
            {/* Header */}
            <div className="flex flex-col space-y-2 mb-7">
              <h2 className="text-xl sm:text-[22px] font-bold tracking-tight text-slate-900 dark:text-white font-jakarta">
                Iniciar sesión
              </h2>
              <p className="text-[13px] text-slate-500 dark:text-white/40">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            {/* Formulario Cliente */}
            <AuthClient />
          </div>

          {/* Footer security note */}
          <div className="flex items-center justify-center gap-2 mt-6 text-slate-400 dark:text-white/20">
            <LockIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium tracking-wider uppercase">Conexión segura</span>
          </div>
        </div>
      </div>
    </div>
  )
}
