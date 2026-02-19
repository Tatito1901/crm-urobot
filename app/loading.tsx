/**
 * ============================================================
 * LOADING STATE - Root/Home — Premium branded loader
 * ============================================================
 */

export default function RootLoading() {
  return (
    <div className="min-h-full flex items-center justify-center bg-urobot relative overflow-hidden">
      {/* Atmospheric glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-teal-500/[0.06] blur-[120px]" aria-hidden />
      
      <div className="relative text-center space-y-5">
        {/* Pulse ring + inner dot */}
        <div className="relative mx-auto h-14 w-14">
          <div className="absolute inset-0 rounded-full border border-teal-400/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-2 rounded-full border border-teal-400/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2.5 w-2.5 rounded-full bg-teal-400 shadow-[0_0_12px_2px] shadow-teal-400/40" />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-white/80 font-jakarta tracking-tight">Urobot CRM</p>
          <p className="text-[11px] text-white/30 uppercase tracking-[0.25em]">Cargando sistema</p>
        </div>
      </div>
    </div>
  );
}
