import { NextRequest, NextResponse } from 'next/server'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'

// GET /api/dispatch/mvd/agents/mobile/[mobile] — lookup by mobile
export async function GET(_req: NextRequest, { params }: { params: Promise<{ mobile: string }> }) {
  try {
    const { mobile } = await params
    const sb = getBgtsAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb as any)
      .from('mvd_agents').select('*').eq('mobile', mobile).single()
    if (error && error.code === 'PGRST116') {
      return NextResponse.json({ data: null, error: 'No agent found with this mobile number.' }, { status: 404 })
    }
    if (error) throw error
    return NextResponse.json({ data, error: null })
  } catch (e) {
    return NextResponse.json({ data: null, error: String(e) }, { status: 500 })
  }
}

// PUT /api/dispatch/mvd/agents/mobile/[mobile] — update listing
export async function PUT(req: NextRequest, { params }: { params: Promise<{ mobile: string }> }) {
  try {
    const { mobile } = await params
    const body = await req.json()
    const sb = getBgtsAdminClient()

    const allowed = ['company_name','contact_person','city','state','fleet_type','vehicle_types','routes_covered']
    const updates: Record<string, unknown> = {}
    for (const k of allowed) {
      if (body[k] !== undefined) updates[k] = body[k]
    }
    updates.updated_at = new Date().toISOString()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb as any)
      .from('mvd_agents').update(updates).eq('mobile', mobile).select().single()
    if (error) throw error
    return NextResponse.json({ data, error: null })
  } catch (e) {
    return NextResponse.json({ data: null, error: String(e) }, { status: 500 })
  }
}
