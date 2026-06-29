import { NextRequest, NextResponse } from 'next/server'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'

// GET /api/dispatch/rates
// Returns global settings + fixed + variable costs for all vehicles
export async function GET() {
  try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getBgtsAdminClient() as any

  const [
    { data: settings,  error: e1 },
    { data: fixed,     error: e2 },
    { data: variable,  error: e3 },
    { data: vehicles,  error: e4 },
  ] = await Promise.all([
    supabase.from('global_settings' as any).select('*').single(),
    supabase.from('fixed_costs' as any).select('*'),
    supabase.from('variable_costs' as any).select('*'),
    supabase.from('vehicles').select('id, reg_no, class, make_model').order('reg_no'),
  ])

  const error = e1?.message ?? e2?.message ?? e3?.message ?? e4?.message
  if (error) {
    return NextResponse.json({ data: null, error }, { status: 500 })
  }

  return NextResponse.json({
    data: { settings, fixed, variable, vehicles },
    error: null,
  })
  } catch (e) {
    return NextResponse.json({ data: null, error: e instanceof Error ? e.message : 'Server error' }, { status: 500 })
  }
}
// POST /api/dispatch/rates
// Upserts global settings + per-vehicle costs
export async function POST(req: NextRequest) {
  const supabase = getBgtsAdminClient()

  let body: {
    settings?:  Record<string, number>
    fixed?:     Record<string, unknown>[]
    variable?:  Record<string, unknown>[]
  }
  try { body = await req.json() }
  catch { return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 }) }

  const errors: string[] = []

  // 1. Upsert global settings
  if (body.settings) {
    const { error } = await (supabase as any).from('global_settings')
      .update(body.settings)
      .gte('id', '00000000-0000-0000-0000-000000000000') // update the single row
    if (error) errors.push('settings: ' + error.message)
  }

  // 2. Upsert fixed costs
  if (body.fixed?.length) {
    const { error } = await (supabase as any).from('fixed_costs')
      .upsert(body.fixed as never[], { onConflict: 'vehicle_id' })
    if (error) errors.push('fixed_costs: ' + error.message)
  }

  // 3. Upsert variable costs
  if (body.variable?.length) {
    const { error } = await (supabase as any).from('variable_costs')
      .upsert(body.variable as never[], { onConflict: 'vehicle_id' })
    if (error) errors.push('variable_costs: ' + error.message)
  }

  if (errors.length) {
    return NextResponse.json({ data: null, error: errors.join(' | ') }, { status: 500 })
  }

  return NextResponse.json({ data: { saved: true }, error: null })
}
