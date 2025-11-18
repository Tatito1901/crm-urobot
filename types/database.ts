/**
 * ============================================================
 * SUPABASE DATABASE TYPES
 * ============================================================
 * Fuente de verdad: Supabase
 * 
 * Este archivo re-exporta los tipos desde supabase.ts y
 * proporciona aliases para mantener compatibilidad con el código existente.
 * 
 * ⚠️ NO EDITAR MANUALMENTE
 * Para regenerar tipos desde Supabase, ejecuta:
 * npm run regenerate-types
 * ============================================================
 */

// Re-exportar solo tipos esenciales desde supabase.ts (fuente de verdad)
export type {
  Json,
  Database,
  Enums
} from './supabase';

// Importar Database para crear aliases simples
import type { Database } from './supabase';

/**
 * Helper type simplificado para tablas (Row)
 * Compatible con la sintaxis del proyecto: Tables<'tabla'>
 */
export type Tables<TableName extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][TableName] extends { Row: infer R } ? R : never;

/**
 * Helper types para Insert/Update usando tipos condicionales
 * Esto es necesario porque TypeScript no permite acceso directo a propiedades en tipos union
 */
export type Insertable<TableName extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][TableName] extends { Insert: infer I } ? I : never;

export type Updatable<TableName extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][TableName] extends { Update: infer U } ? U : never;

export type Views<ViewName extends keyof Database['public']['Views']> = 
  Database['public']['Views'][ViewName] extends { Row: infer R } ? R : never;
