import { NextResponse } from 'next/server'

// GET /api/dispatch/health
// Returns env var presence + Supabase connectivity check
export async function GET() {
  const url  = process.env.NEXT_PUBLIC_BGTS_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_BGTS_SUPABASE_ANON_KEY
  const svc  = process.env.BGTS_SUPABASE_SERVICE_ROLE_KEY

  const missing: string[] = []
  if (!url)  missing.push('NEXT_PUBLIC_BGTS_SUPABASE_URL')
  if (!anon) missing.push('NEXT_PUBLIC_BGTS_SUPABASE_ANON_KEY')
  if (!svc)  missing.push('BGTS_SUPABASE_SERVICE_ROLE_KEY')

  if (missing.length > 0) {
    return NextResponse.json({
      ok: false,
      error: 'Missing env vars',
      missing,
    }, { status: 500 })
  }

  // Try a simple Supabase ping
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(url!, svc!)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (sb as any).from('vehicles').select('id').limit(1)
    if (error) {
      return NextResponse.json({ ok: false, error: error.message, missing: [] }, { status: 500 })
    }
    return NextResponse.json({
      ok: true,
      url: url!.replace(/^(https:\/\/[^.]+).*/, '$1...'),
      anonKeyPrefix: anon!.slice(0, 20) + '...',
      svcKeyPrefix : svc!.slice(0, 20) + '...',
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Unknown error', missing: [] }, { status: 500 })
  }
}
