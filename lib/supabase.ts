/**
 * ============================================================
 * SUPABASE CLIENT CONFIGURATION
 * ============================================================
 * Cliente principal de Supabase para el CRM
 * Usa credenciales de .env.local
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Validar que las variables de entorno existan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '⚠️ Falta configurar Supabase!\n' +
    'Crea el archivo .env.local con:\n' +
    '- NEXT_PUBLIC_SUPABASE_URL\n' +
    '- NEXT_PUBLIC_SUPABASE_ANON_KEY\n\n' +
    'Ver: env.local.template para ejemplo'
  )
}

/**
 * Cliente principal de Supabase
 * - Typesafe con Database types
 * - Configurado con auth auto-refresh
 * - Real-time habilitado
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Rate limiting para real-time
    },
  },
})

/**
 * Helper para verificar conexión a Supabase
 */
export async function testSupabaseConnection() {
  try {
    const { error } = await supabase.from('leads').select('count').limit(1)
    
    if (error) {
      console.error('❌ Error conectando a Supabase:', error.message)
      return false
    }
    
    console.log('✅ Supabase conectado correctamente')
    return true
  } catch (err) {
    console.error('❌ Error de conexión:', err)
    return false
  }
}

/**
 * Tipos de utilidad
 */
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type Insertable<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type Updatable<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']
