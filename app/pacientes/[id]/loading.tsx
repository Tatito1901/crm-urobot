/**
 * ============================================================
 * LOADING STATE - Perfil de Paciente
 * ============================================================
 */

export default function PacientePerfilLoading() {
  return (
    <div className="h-screen flex flex-col bg-urobot">
      {/* Header skeleton */}
      <div className="border-b border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
          <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar skeleton */}
        <div className="w-80 border-r border-white/10 bg-white/[0.02] p-6 space-y-6 overflow-auto">
          {/* Avatar skeleton */}
          <div className="flex flex-col items-center space-y-3">
            <div className="h-24 w-24 rounded-full bg-white/10 animate-pulse" />
            <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
          </div>

          {/* Datos skeleton */}
          <div className="space-y-4">
            <div className="h-5 w-28 bg-white/10 rounded animate-pulse" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                  <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Notas skeleton */}
          <div className="space-y-3">
            <div className="h-5 w-20 bg-white/10 rounded animate-pulse" />
            <div className="h-24 bg-white/10 rounded animate-pulse" />
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Tabs skeleton */}
          <div className="flex gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-white/10 rounded animate-pulse" />
            ))}
          </div>

          {/* Content skeleton */}
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
                    <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
                  </div>
                  <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
                  <div className="h-4 w-64 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
