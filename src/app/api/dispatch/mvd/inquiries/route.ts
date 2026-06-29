import { NextRequest, NextResponse } from 'next/server'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'

// POST /api/dispatch/mvd/inquiries — log an inquiry message record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      from_city,
      to_city,
      vehicle_type,
      material_type,
      pickup_date,
      agent_ids,
      message_en,
      message_hi,
      message_gu,
    } = body

    if (!from_city || !to_city || !vehicle_type) {
      return NextResponse.json(
        { data: null, error: 'from_city, to_city and vehicle_type are required' },
        { status: 400 }
      )
    }

    const sb = getBgtsAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb as any).from('mvd_inquiries').insert({
      from_city,
      to_city,
      vehicle_type,
      material_type:  material_type  ?? null,
      pickup_date:    pickup_date    ?? null,
      agent_ids:      Array.isArray(agent_ids) ? agent_ids : [],
      message_en:     message_en     ?? null,
      message_hi:     message_hi     ?? null,
      message_gu:     message_gu     ?? null,
    }).select().single()

    if (error) throw error
    return NextResponse.json({ data, error: null })
  } catch (e) {
    return NextResponse.json({ data: null, error: String(e) }, { status: 500 })
  }
}

// GET /api/dispatch/mvd/inquiries — list recent inquiries
export async function GET() {
  try {
    const sb = getBgtsAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb as any)
      .from('mvd_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return NextResponse.json({ data, error: null })
  } catch (e) {
    return NextResponse.json({ data: null, error: String(e) }, { status: 500 })
  }
}
