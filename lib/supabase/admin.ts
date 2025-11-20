/**
 * ============================================================
 * SUPABASE ADMIN CLIENT - SERVICE ROLE
 * ============================================================
 * ⚠️  ADVERTENCIA: Este cliente bypasea Row Level Security (RLS)
 * 
 * ÚSALO SOLO PARA:
 * - Operaciones administrativas del servidor
 * - Webhooks que requieren permisos elevados
 * - Tareas automatizadas (cron jobs)
 * - Migraciones de datos
 * 
 * ❌ NUNCA usar en:
 * - Componentes del cliente
 * - Código que se ejecute en el browser
 * - Funciones que procesen input del usuario directamente
 * ============================================================
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. " +
    "This key is required for admin operations."
  );
}

/**
 * Cliente de Supabase con privilegios de administrador
 * 
 * ⚠️  IMPORTANTE: Este cliente bypasea todas las políticas RLS
 * Solo debe usarse en código del servidor (API Routes, Server Actions, etc.)
 * 
 * @example
 * // ✅ Correcto: En un API Route
 * import { createAdminClient } from "@/lib/supabase/admin";
 * 
 * export async function POST(request: Request) {
 *   const supabase = createAdminClient();
 *   // Operaciones administrativas aquí
 * }
 * 
 * @example
 * // ❌ Incorrecto: En un componente del cliente
 * "use client"
 * import { createAdminClient } from "@/lib/supabase/admin"; // ¡NO HACER ESTO!
 */
export function createAdminClient() {
  return createClient<Database>(
    supabaseUrl!,
    supabaseServiceRoleKey!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

/**
 * Ejecuta una operación administrativa con manejo de errores
 * 
 * @example
 * const result = await executeAdminOperation(async (client) => {
 *   return await client.from('leads').select('*');
 * });
 */
export async function executeAdminOperation<T>(
  operation: (client: ReturnType<typeof createAdminClient>) => Promise<T>
): Promise<T> {
  const client = createAdminClient();
  
  try {
    return await operation(client);
  } catch (error) {
    console.error("[Admin Operation Error]:", error);
    throw error;
  }
}
