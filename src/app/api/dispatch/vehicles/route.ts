import { NextRequest, NextResponse } from 'next/server'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'

// GET /api/dispatch/vehicles
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getBgtsAdminClient() as any
    const { data, error } = await supabase
      .from('vehicles' as any)
      .select('*')
      .order('reg_no', { ascending: true })
    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    return NextResponse.json({ data: data ?? [], error: null })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}

// POST /api/dispatch/vehicles
export async function POST(req: NextRequest) {
  try {
    const supabase = getBgtsAdminClient()

    let body: Record<string, unknown>
    try { body = await req.json() }
    catch { return NextResponse.json({ data: null, error: 'Invalid request body' }, { status: 400 }) }

    const { reg_no, class: vClass, make_model, ownership, payload_kg, length_ft, width_ft, height_ft } = body

    if (!reg_no || !make_model) {
      return NextResponse.json({ data: null, error: 'reg_no and make_model are required' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).from('vehicles').insert({
        reg_no    : String(reg_no).toUpperCase().trim(),
        class     : String(vClass ?? 'MGV') as never,
        make_model: String(make_model),
        ownership : String(ownership ?? 'OWNED') as never,
        payload_kg: Number(payload_kg ?? 0),
        length_ft : length_ft ? Number(length_ft) : null,
        width_ft  : width_ft  ? Number(width_ft)  : null,
        height_ft : height_ft ? Number(height_ft) : null,
        status_now: 'AVAILABLE',
      })
      .select()
      .single()

    if (error) {
      const msg = error.code === '23505'
        ? `Vehicle ${String(reg_no)} already exists`
        : error.message
      return NextResponse.json({ data: null, error: msg }, { status: 400 })
    }

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ data: null, error: msg }, { status: 500 })
  }
}
