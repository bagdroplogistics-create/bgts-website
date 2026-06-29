'use client'
import { useState, useCallback, useRef } from 'react'
import type { QuoteInput, QuoteBreakdown } from '@/types/dispatch'

export function useQuote() {
  const [breakdown, setBreakdown] = useState<QuoteBreakdown | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const calculate = useCallback((input: Partial<QuoteInput>) => {
    if (!input.vehicle_id || !input.distance_km || input.distance_km <= 0) {
      setBreakdown(null); return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true); setError(null)
      try {
        const res  = await window.fetch('/api/dispatch/quote', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })
        const json = await res.json()
        if (json.error) throw new Error(json.error)
        setBreakdown(json.data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Quote failed')
        setBreakdown(null)
      } finally { setLoading(false) }
    }, 400)
  }, [])

  const clear = useCallback(() => { setBreakdown(null); setError(null) }, [])

  return { breakdown, loading, error, calculate, clear }
}
