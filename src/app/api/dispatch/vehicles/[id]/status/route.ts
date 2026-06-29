import { NextRequest, NextResponse } from 'next/server'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'
import type { VehicleStatus } from '@/types/dispatch'

const VALID_STATUSES: VehicleStatus[] = [
  'AVAILABLE', 'ON_TRIP', 'MAINTENANCE', 'COMPLIANCE_HOLD'
]

// PATCH /api/dispatch/vehicles/[id]/status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getBgtsAdminClient() as any

  let body: { status_now: VehicleStatus }
  try { body = await req.json() }
  catch { return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 }) }

  if (!VALID_STATUSES.includes(body.status_now)) {
    return NextResponse.json({ data: null, error: 'Invalid status' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('vehicles' as any)
    .update({ status_now: body.status_now })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, error: null })
}
