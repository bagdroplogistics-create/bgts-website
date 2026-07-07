import { NextRequest, NextResponse } from 'next/server'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'

// POST /api/dispatch/mvd/outreach — log an outreach action
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mvd_booking_id, agent_id, agent_name, agent_mobile, method, message_sent } = body

    if (!agent_mobile || !method) {
      return NextResponse.json(
        { data: null, error: 'agent_mobile and method are required' },
        { status: 400 },
      )
    }

    const sb = getBgtsAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb as any)
      .from('mvd_outreach')
      .insert({
        mvd_booking_id: mvd_booking_id || null,
        agent_id:       agent_id       || null,
        agent_name:     agent_name     || null,
        agent_mobile:   String(agent_mobile),
        method:         String(method),
        message_sent:   message_sent   || null,
        status:         'SENT',
        sent_at:        new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ data: null, error: String(e) }, { status: 500 })
  }
}

// GET /api/dispatch/mvd/outreach?booking_id=xxx — fetch activity for a booking
export async function GET(req: NextRequest) {
  try {
    const bookingId = req.nextUrl.searchParams.get('booking_id')
    const sb = getBgtsAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (sb as any)
      .from('mvd_outreach')
      .select('*')
      .order('sent_at', { ascending: false })
      .range(0, 199)

    if (bookingId) query = query.eq('mvd_booking_id', bookingId)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data: data ?? [], error: null })
  } catch (e) {
    return NextResponse.json({ data: null, error: String(e) }, { status: 500 })
  }
}
