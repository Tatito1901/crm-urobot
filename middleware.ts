import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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
  let supabaseResponse = NextResponse.next({
    request: req,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: req,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

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

  return supabaseResponse
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
