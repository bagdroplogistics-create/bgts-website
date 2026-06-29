import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = '/bgtsadmin1950/dashboard'
const LOGIN     = '/bgtsadmin1950'
const TOKEN     = 'bgts_admin_token'
const SESSION   = 'bgts_admin_session'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!pathname.startsWith(PROTECTED)) return NextResponse.next()

  const cookie = req.cookies.get(TOKEN)?.value
  if (cookie === SESSION) return NextResponse.next()

  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = LOGIN
  return NextResponse.redirect(loginUrl)
}

export const config = { matcher: ['/bgtsadmin1950/dashboard/:path*'] }
