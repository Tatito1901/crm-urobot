/**
 * ============================================================
 * LOADING STATE - Root/Home
 * ============================================================
 */

export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-urobot">
      <div className="text-center space-y-4">
        <div className="h-12 w-12 mx-auto rounded-full bg-blue-500/20 border-2 border-blue-500/40" />
        <p className="text-sm text-white/60">Cargando...</p>
      </div>
    </div>
  );
}
