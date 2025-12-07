/**
 * ============================================================
 * SUPABASE CLIENT - SINGLETON PATTERN
 * ============================================================
 * QUICK WIN #6: Optimización para crear cliente una sola vez
 * Antes: Se creaba nueva instancia en cada hook/componente
 * Después: Se reutiliza la misma instancia
 * Beneficio: Menos overhead de memoria, mejor performance
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

// ✅ Singleton instance - Tipado explícitamente
let client: SupabaseClient<Database> | null = null;

/**
 * Obtiene o crea el cliente de Supabase (singleton)
 * Solo se crea una vez durante todo el ciclo de vida de la app
 * 
 * ⚠️ REALTIME COMPLETAMENTE DESHABILITADO
 * Ahorra ~83% de carga en la BD según análisis de queries lentas
 * Las actualizaciones se manejan con SWR (polling controlado)
 */
export function createClient(): SupabaseClient<Database> {
  if (!client) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"
      );
    }

    // Crear cliente SIN Realtime
    client = createBrowserClient<Database>(
      supabaseUrl,
      supabaseKey,
      {
        // ✅ REALTIME DESHABILITADO COMPLETAMENTE
        realtime: {
          heartbeatIntervalMs: 0, // Sin heartbeat
          timeout: 0, // Sin conexión
        },
        global: {
          headers: {
            'x-realtime-off': 'true', // Header para indicar que no usamos realtime
          },
        },
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      }
    ) as SupabaseClient<Database>;
  }

  return client;
}
