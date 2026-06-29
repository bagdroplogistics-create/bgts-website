import { NextRequest, NextResponse } from 'next/server'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'

// GET /api/dispatch/mvd/agents — list all agents (optional ?status=NEW|VERIFIED)
export async function GET(req: NextRequest) {
  try {
    const sb = getBgtsAdminClient()
    const status = req.nextUrl.searchParams.get('status')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (sb as any).from('mvd_agents').select('*').order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data, error: null })
  } catch (e) {
    return NextResponse.json({ data: null, error: String(e) }, { status: 500 })
  }
}

// POST /api/dispatch/mvd/agents — register / upsert an agent (by mobile as unique key)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { company_name, contact_person, mobile, city, state, fleet_type, vehicle_types, routes_covered } = body

    if (!company_name || !mobile || !city) {
      return NextResponse.json({ data: null, error: 'company_name, mobile and city are required' }, { status: 400 })
    }

    const sb = getBgtsAdminClient()

    // Check if agent already exists with this mobile (upsert)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (sb as any)
      .from('mvd_agents').select('id').eq('mobile', mobile).single()

    const payload = {
      company_name:   company_name.trim(),
      contact_person: (contact_person ?? '').trim(),
      mobile:         mobile.trim(),
      city:           city.trim(),
      state:          (state ?? '').trim() || null,
      fleet_type:     fleet_type ?? 'BROKER',
      vehicle_types:  Array.isArray(vehicle_types) ? vehicle_types : [],
      routes_covered: Array.isArray(routes_covered) ? routes_covered : [],
      status:         'NEW',
      grade:          'C',
      reliability_score: 50,
      is_self_registered: true,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any
    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result = await (sb as any).from('mvd_agents')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('mobile', mobile)
        .select().single()
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result = await (sb as any).from('mvd_agents').insert(payload).select().single()
    }

    if (result.error) throw result.error
    return NextResponse.json({ data: result.data, error: null, isUpdate: !!existing })
  } catch (e) {
    return NextResponse.json({ data: null, error: String(e) }, { status: 500 })
  }
}
