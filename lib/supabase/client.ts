
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Singleton instance para evitar múltiples clientes
let supabaseInstance: SupabaseClient | null = null;

/**
 * Obtiene la instancia singleton del cliente Supabase
 * ✅ OPTIMIZACIÓN: Evita crear múltiples instancias del cliente
 * ✅ BENEFICIO: Reduce uso de memoria y garantiza consistencia
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(supabaseUrl!, supabaseKey!);
  }
  return supabaseInstance;
}

// Mantener compatibilidad con código existente
export const createClient = getSupabaseClient;
