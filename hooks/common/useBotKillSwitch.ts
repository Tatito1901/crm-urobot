'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface KillSwitchState {
  enabled: boolean
  loading: boolean
  toggling: boolean
  updatedAt: string | null
  updatedBy: string | null
}

export function useBotKillSwitch() {
  const [state, setState] = useState<KillSwitchState>({
    enabled: false,
    loading: true,
    toggling: false,
    updatedAt: null,
    updatedBy: null,
  })

  const supabase = createClient()

  const fetchStatus = useCallback(async () => {
    const { data, error } = await supabase
      .from('bot_config')
      .select('value, updated_at, updated_by')
      .eq('key', 'kill_switch')
      .single()

    if (!error && data) {
      setState(prev => ({
        ...prev,
        enabled: data.value === true,
        loading: false,
        updatedAt: data.updated_at,
        updatedBy: data.updated_by,
      }))
    } else {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [supabase])

  useEffect(() => {
    fetchStatus()

    // Realtime subscription for live updates across tabs/users
    const channel = supabase
      .channel('bot_config_kill_switch')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bot_config', filter: 'key=eq.kill_switch' },
        (payload) => {
          setState(prev => ({
            ...prev,
            enabled: payload.new.value === true,
            updatedAt: payload.new.updated_at,
            updatedBy: payload.new.updated_by,
          }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchStatus, supabase])

  const toggle = useCallback(async () => {
    setState(prev => ({ ...prev, toggling: true }))

    const newValue = !state.enabled

    // Get current user email for audit
    const { data: { user } } = await supabase.auth.getUser()
    const userEmail = user?.email ?? 'unknown'

    const { error } = await supabase
      .from('bot_config')
      .update({
        value: newValue,
        updated_at: new Date().toISOString(),
        updated_by: userEmail,
      })
      .eq('key', 'kill_switch')

    if (!error) {
      setState(prev => ({
        ...prev,
        enabled: newValue,
        toggling: false,
        updatedAt: new Date().toISOString(),
        updatedBy: userEmail,
      }))
    } else {
      setState(prev => ({ ...prev, toggling: false }))
    }

    return { error }
  }, [state.enabled, supabase])

  return {
    enabled: state.enabled,
    loading: state.loading,
    toggling: state.toggling,
    updatedAt: state.updatedAt,
    updatedBy: state.updatedBy,
    toggle,
    refetch: fetchStatus,
  }
}
