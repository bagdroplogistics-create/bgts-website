import { NextRequest, NextResponse } from 'next/server'
import { getBgtsAdminClient } from '@/lib/supabase-bgts'
import { calculateQuote } from '@/lib/quote'
import type { QuoteInput } from '@/types/dispatch'

// POST /api/dispatch/quote
// Body: QuoteInput — returns full QuoteBreakdown
export async function POST(req: NextRequest) {
  const supabase = getBgtsAdminClient()

  let input: QuoteInput
  try { input = await req.json() }
  catch { return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 }) }

  if (!input.vehicle_id || !input.distance_km) {
    return NextResponse.json(
      { data: null, error: 'vehicle_id and distance_km are required' },
      { status: 400 }
    )
  }

  const [
    { data: varCost,  error: e1 },
    { data: fixCost,  error: e2 },
    { data: settings, error: e3 },
  ] = await Promise.all([
    supabase.from('variable_costs').select('*').eq('vehicle_id', input.vehicle_id).single(),
    supabase.from('fixed_costs').select('*').eq('vehicle_id', input.vehicle_id).single(),
    supabase.from('global_settings').select('*').single(),
  ])

  if (e1 || e2 || e3 || !varCost || !fixCost || !settings) {
    return NextResponse.json(
      { data: null, error: 'Rate data not configured for this vehicle. Add costs in Rate Settings first.' },
      { status: 422 }
    )
  }

  const breakdown = calculateQuote(input, varCost, fixCost, settings)

  return NextResponse.json({ data: breakdown, error: null })
}
