'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Booking, BookingStage } from '@/types/dispatch'

interface Filters {
  stage?:     BookingStage | 'ALL'
  from_date?: string
  to_date?:   string
  vehicle_id?: string
}

export function useBookings(filters: Filters = {}) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.stage && filters.stage !== 'ALL') params.set('stage', filters.stage)
      if (filters.from_date)  params.set('from_date',  filters.from_date)
      if (filters.to_date)    params.set('to_date',    filters.to_date)
      if (filters.vehicle_id) params.set('vehicle_id', filters.vehicle_id)

      const res  = await window.fetch(`/api/dispatch/bookings?${params}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setBookings(json.data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [filters.stage, filters.from_date, filters.to_date, filters.vehicle_id])

  useEffect(() => { fetch() }, [fetch])

  const updateStage = useCallback(async (id: string, stage: BookingStage) => {
    const res  = await window.fetch(`/api/dispatch/bookings/${id}/stage`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ stage }),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, stage } : b))
    return json.data as Booking
  }, [])

  const createBooking = useCallback(async (data: Record<string, unknown>) => {
    const res  = await window.fetch('/api/dispatch/bookings', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error)
    setBookings(prev => [json.data, ...prev])
    return json.data as Booking
  }, [])

  return { bookings, loading, error, refresh: fetch, updateStage, createBooking }
}
