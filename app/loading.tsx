/**
 * ============================================================
 * LOADING STATE - Root/Home
 * ============================================================
 */

export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-urobot">
      <div className="text-center space-y-4">
        {/* Logo o icono skeleton */}
        <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-blue-400 animate-pulse" />
        
        {/* Texto skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-48 mx-auto bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-64 mx-auto bg-white/10 rounded animate-pulse" />
        </div>

        {/* Loading spinner */}
        <div className="flex justify-center pt-4">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </div>
    </div>
  );
}
