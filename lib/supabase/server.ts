/**
 * ============================================================
 * SUPABASE SERVER CLIENT - USER CONTEXT
 * ============================================================
 * Este cliente respeta Row Level Security (RLS) y el contexto del usuario
 * 
 * ÚSALO PARA:
 * - Server Components que necesiten datos del usuario autenticado
 * - Server Actions que procesen acciones del usuario
 * - Operaciones que deben respetar permisos de RLS
 * 
 * Si necesitas bypasear RLS, usa @/lib/supabase/admin en su lugar
 * ============================================================
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Crea un cliente de Supabase para Server Components
 * Mantiene el contexto de autenticación del usuario y respeta RLS
 */
export const createClient = async () => {
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
