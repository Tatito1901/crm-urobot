/**
 * ============================================================
 * HOOK: useMutation
 * ============================================================
 * Wrapper sobre SWR para mutaciones con:
 * - Invalidación automática por dominio (leads, consultas, etc.)
 * - Estado de loading/error/success
 * - Rollback on error (opcional)
 * - Toast de feedback (opcional)
 * 
 * Inspirado en TanStack Query useMutation pero sin cambiar de librería.
 * 
 * @example
 * const { trigger, isMutating } = useMutation({
 *   mutationFn: (data) => supabase.from('leads').update(data).eq('id', id),
 *   invalidates: ['leads'],
 *   onSuccess: () => toast.success('Lead actualizado'),
 * })
 */

import { useCallback, useRef, useState } from 'react'
import { invalidateDomain, invalidateDomains } from '@/lib/swr-config'

type CacheDomain = 'leads' | 'pacientes' | 'consultas' | 'conversaciones' | 'dashboard' | 'urobot'

interface MutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>
  invalidates?: CacheDomain[]
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>
  onError?: (error: Error, variables: TVariables) => void
  onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void
}

interface MutationResult<TData, TVariables> {
  trigger: (variables: TVariables) => Promise<TData | null>
  isMutating: boolean
  error: Error | null
  data: TData | null
  reset: () => void
}

export function useMutation<TData = unknown, TVariables = void>(
  options: MutationOptions<TData, TVariables>
): MutationResult<TData, TVariables> {
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<TData | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const trigger = useCallback(async (variables: TVariables): Promise<TData | null> => {
    const opts = optionsRef.current
    setIsMutating(true)
    setError(null)

    let result: TData | null = null
    let mutationError: Error | null = null

    try {
      result = await opts.mutationFn(variables)
      setData(result)

      // Invalidar dominios relacionados
      if (opts.invalidates && opts.invalidates.length > 0) {
        await invalidateDomains(opts.invalidates)
      }

      // Callback de éxito
      if (opts.onSuccess) {
        await opts.onSuccess(result, variables)
      }
    } catch (err) {
      mutationError = err instanceof Error ? err : new Error(String(err))
      setError(mutationError)

      if (opts.onError) {
        opts.onError(mutationError, variables)
      }
    } finally {
      setIsMutating(false)

      if (opts.onSettled) {
        opts.onSettled(result, mutationError, variables)
      }
    }

    return result
  }, [])

  const reset = useCallback(() => {
    setIsMutating(false)
    setError(null)
    setData(null)
  }, [])

  return { trigger, isMutating, error, data, reset }
}

/**
 * Versión simplificada para mutaciones que no necesitan variables.
 * 
 * @example
 * const { trigger, isMutating } = useSimpleMutation(
 *   () => supabase.rpc('cleanup_leads'),
 *   ['leads']
 * )
 */
export function useSimpleMutation<TData = unknown>(
  mutationFn: () => Promise<TData>,
  invalidates?: CacheDomain[],
  onSuccess?: (data: TData) => void
): { trigger: () => Promise<TData | null>; isMutating: boolean; error: Error | null } {
  const { trigger, isMutating, error } = useMutation<TData, void>({
    mutationFn,
    invalidates,
    onSuccess: onSuccess ? (data) => onSuccess(data) : undefined,
  })

  return {
    trigger: () => trigger(),
    isMutating,
    error,
  }
}
