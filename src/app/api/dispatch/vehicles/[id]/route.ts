import { NextRequest, NextResponse } from 'next/server'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'

// PATCH /api/dispatch/vehicles/[id]  — full vehicle update
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getBgtsAdminClient()

    let body: Record<string, unknown>
    try { body = await req.json() }
    catch { return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 }) }

    const { reg_no, class: vClass, make_model, ownership, payload_kg, length_ft, width_ft, height_ft, status_now } = body

    const updates: Record<string, unknown> = {}
    if (reg_no    !== undefined) updates.reg_no     = String(reg_no).toUpperCase().trim()
    if (vClass    !== undefined) updates.class      = String(vClass)
    if (make_model!== undefined) updates.make_model = String(make_model)
    if (ownership !== undefined) updates.ownership  = String(ownership)
    if (payload_kg!== undefined) updates.payload_kg = Number(payload_kg)
    if (length_ft !== undefined) updates.length_ft  = length_ft ? Number(length_ft) : null
    if (width_ft  !== undefined) updates.width_ft   = width_ft  ? Number(width_ft)  : null
    if (height_ft !== undefined) updates.height_ft  = height_ft ? Number(height_ft) : null
    if (status_now!== undefined) updates.status_now = String(status_now)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 400 })
    return NextResponse.json({ data, error: null })
  } catch (e) {
    return NextResponse.json({ data: null, error: e instanceof Error ? e.message : 'Server error' }, { status: 500 })
  }
}
