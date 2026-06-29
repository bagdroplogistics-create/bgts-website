import { NextRequest, NextResponse } from 'next/server'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'
import type { BookingStage } from '@/types/dispatch'

const VALID_STAGES: BookingStage[] = [
  // New stages
  'BOOKING_RECEIVED', 'PAYMENT_PENDING', 'PAYMENT_RECEIVED', 'BOOKING_CONFIRMED',
  'VEHICLE_DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'INVOICE_RAISED', 'CANCELLED',
  // Legacy (keep accepting for existing data)
  'BOOKED', 'DISPATCHED', 'INVOICED',
]

// PATCH /api/dispatch/bookings/[id]/stage
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getBgtsAdminClient() as any

  let body: { stage: BookingStage }
  try { body = await req.json() }
  catch { return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 }) }

  if (!VALID_STAGES.includes(body.stage)) {
    return NextResponse.json({ data: null, error: 'Invalid stage' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('bookings' as any)
    .update({ stage: body.stage })
    .eq('id', id)
    .select('*, vehicle:vehicles(id, reg_no, make_model)')
    .single()

  if (error) {
    console.error('[bookings stage PATCH]', error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }

  // Free up vehicle when trip is complete or cancelled
  if (['DELIVERED','INVOICE_RAISED','CANCELLED','INVOICED'].includes(body.stage)) {
    await supabase
      .from('vehicles' as any)
      .update({ status_now: 'AVAILABLE' })
      .eq('id', data.vehicle_id)
  }

  // Mark vehicle ON_TRIP when dispatched or in transit
  if (['VEHICLE_DISPATCHED','IN_TRANSIT','DISPATCHED'].includes(body.stage)) {
    await supabase
      .from('vehicles' as any)
      .update({ status_now: 'ON_TRIP' })
      .eq('id', data.vehicle_id)
  }

  return NextResponse.json({ data, error: null })
}
