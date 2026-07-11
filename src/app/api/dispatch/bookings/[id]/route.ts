import { NextRequest, NextResponse } from 'next/server'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'object' && e !== null) {
    const obj = e as Record<string, unknown>
    if (typeof obj.message === 'string') return obj.message
    if (typeof obj.details === 'string') return obj.details
    return JSON.stringify(e)
  }
  return String(e)
}

// PUT /api/dispatch/bookings/[id] — update editable fields
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body   = await req.json()
    const sb     = getBgtsAdminClient()

    const allowed = [
      'trip_date','client_name','company_name','confirmed_broker','phone','email',
      'from_loc','to_loc','distance_km','material','pcs_boxes',
      'weight_kg','vehicle_id','trip_type','margin_pct','rate_total','notes',
      'driver_name','driver_phone','driver_license',
    ]
    const updates: Record<string, unknown> = {}
    for (const k of allowed) {
      if (body[k] !== undefined) updates[k] = body[k]
    }
    // vehicle_id: empty string '' is not a valid UUID — convert to null (market vehicle bookings)
    if (updates.vehicle_id === '' || updates.vehicle_id === undefined) {
      updates.vehicle_id = null
    }
    updates.updated_at = new Date().toISOString()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb as any)
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select('*, vehicle:vehicles(id, reg_no, class, make_model, payload_kg, status_now)')
      .single()

    if (error) return NextResponse.json({ data: null, error: errMsg(error) }, { status: 500 })
    return NextResponse.json({ data, error: null })
  } catch (e) {
    return NextResponse.json({ data: null, error: errMsg(e) }, { status: 500 })
  }
}

// DELETE /api/dispatch/bookings/[id] — hard delete
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sb     = getBgtsAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb as any).from('bookings').delete().eq('id', id)
    if (error) return NextResponse.json({ success: false, error: errMsg(error) }, { status: 500 })
    return NextResponse.json({ success: true, error: null })
  } catch (e) {
    return NextResponse.json({ success: false, error: errMsg(e) }, { status: 500 })
  }
}
