import { NextRequest, NextResponse } from 'next/server'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'

// GET /api/dispatch/inquiries?category=&status=&limit=100
export async function GET(req: NextRequest) {
  try {
    const supabase = getBgtsAdminClient()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const status   = searchParams.get('status')
    const limit    = Number(searchParams.get('limit') ?? 200)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = (supabase as any)
      .from('website_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (category) q = q.eq('category', category)
    if (status)   q = q.eq('status', status)

    const { data, error } = await q
    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    return NextResponse.json({ data: data ?? [], error: null })
  } catch (e) {
    return NextResponse.json({ data: null, error: e instanceof Error ? e.message : 'Server error' }, { status: 500 })
  }
}

// PATCH /api/dispatch/inquiries  — update status of one inquiry
export async function PATCH(req: NextRequest) {
  try {
    const supabase = getBgtsAdminClient()
    const { id, status } = await req.json()
    if (!id || !status) return NextResponse.json({ data: null, error: 'id and status required' }, { status: 400 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('website_inquiries')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ data: null, error: error.message }, { status: 400 })
    return NextResponse.json({ data, error: null })
  } catch (e) {
    return NextResponse.json({ data: null, error: e instanceof Error ? e.message : 'Server error' }, { status: 500 })
  }
}
