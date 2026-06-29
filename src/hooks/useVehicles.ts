'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Vehicle, VehicleStatus } from '@/types/dispatch'

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res  = await window.fetch('/api/dispatch/vehicles')
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setVehicles(json.data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load vehicles')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const addVehicle = useCallback(async (data: Record<string, unknown>) => {
    const res  = await window.fetch('/api/dispatch/vehicles', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error)
    setVehicles(prev => [...prev, json.data])
    return json.data as Vehicle
  }, [])

  const updateStatus = useCallback(async (id: string, status_now: VehicleStatus) => {
    const res  = await window.fetch(`/api/dispatch/vehicles/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status_now }),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error)
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, status_now } : v))
  }, [])

  const updateVehicle = useCallback(async (id: string, data: Record<string, unknown>) => {
    const res  = await window.fetch(`/api/dispatch/vehicles/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error)
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...json.data } : v))
    return json.data as Vehicle
  }, [])

  return { vehicles, loading, error, refresh: fetch, addVehicle, updateStatus, updateVehicle }
}
