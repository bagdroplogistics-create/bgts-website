'use client'
import { useState, useEffect, useCallback } from 'react'
import type { GlobalSettings, FixedCost, VariableCost, Vehicle } from '@/types/dispatch'

export interface RatesData {
  settings: GlobalSettings | null
  fixed:    FixedCost[]
  variable: VariableCost[]
  vehicles: Pick<Vehicle, 'id' | 'reg_no' | 'class' | 'make_model'>[]
}

export function useRates() {
  const [rates,   setRates]   = useState<RatesData>({ settings: null, fixed: [], variable: [], vehicles: [] })
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res  = await window.fetch('/api/dispatch/rates')
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setRates(json.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load rates')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const saveRates = useCallback(async (payload: Partial<{
    settings: Record<string, number>
    fixed:    Record<string, unknown>[]
    variable: Record<string, unknown>[]
  }>) => {
    const res  = await window.fetch('/api/dispatch/rates', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error)
    await fetch()
  }, [fetch])

  return { rates, loading, error, saveRates, refresh: fetch }
}
