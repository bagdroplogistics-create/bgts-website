import { NextRequest, NextResponse } from 'next/server'

const ADMIN_USER = process.env.BGTS_ADMIN_USER ?? 'bgts_admin'
const ADMIN_PASS = process.env.BGTS_ADMIN_PASS ?? 'BGTS@1950'
const SESSION_TOKEN = 'bgts_admin_session'
const COOKIE_NAME   = 'bgts_admin_token'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, SESSION_TOKEN, {
    httpOnly : true,
    secure   : process.env.NODE_ENV === 'production',
    sameSite : 'lax',
    path     : '/',
    maxAge   : 60 * 60 * 8, // 8 hours
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(COOKIE_NAME)
  return res
}
