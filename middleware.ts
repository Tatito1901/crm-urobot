import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

import type { Database } from '@/types/database'

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/leads',
  '/pacientes',
  '/consultas',
  '/confirmaciones',
  '/metricas',
  '/agenda',
]

const AUTH_PREFIX = '/auth'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl
  const isAuthRoute = pathname.startsWith(AUTH_PREFIX)
  const isProtectedRoute =
    pathname === '/' || PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (isProtectedRoute && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = AUTH_PREFIX
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthRoute && session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    redirectUrl.searchParams.delete('redirectedFrom')
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/leads/:path*',
    '/pacientes/:path*',
    '/consultas/:path*',
    '/confirmaciones/:path*',
    '/metricas/:path*',
    '/agenda/:path*',
    '/auth/:path*',
  ],
}
