import { NextRequest, NextResponse } from 'next/server'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'
import type { BookingStage } from '@/types/dispatch'

const VALID_STAGES: BookingStage[] = [
  'BOOKED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'INVOICED', 'CANCELLED'
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

  // If delivered/cancelled — free up the vehicle
  if (body.stage === 'DELIVERED' || body.stage === 'CANCELLED') {
    await supabase
      .from('vehicles' as any)
      .update({ status_now: 'AVAILABLE' })
      .eq('id', data.vehicle_id)
  }

  // If dispatched — mark vehicle ON_TRIP
  if (body.stage === 'DISPATCHED' || body.stage === 'IN_TRANSIT') {
    await supabase
      .from('vehicles' as any)
      .update({ status_now: 'ON_TRIP' })
      .eq('id', data.vehicle_id)
  }

  return NextResponse.json({ data, error: null })
}
