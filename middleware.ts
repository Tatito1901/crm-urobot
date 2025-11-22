import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const BASE64_PREFIX = 'base64-'

const decodeSessionValue = (value: string | undefined): string | undefined => {
  if (!value || !value.startsWith(BASE64_PREFIX)) {
    return value
  }

  const base64Payload = value.slice(BASE64_PREFIX.length)

  try {
    return Buffer.from(base64Payload, 'base64').toString('utf8')
  } catch {
    return value
  }
}

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
    request: {
      headers: req.headers,
    },
  })
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) must be set.',
    )
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll().map(cookie => ({
            ...cookie,
            value: decodeSessionValue(cookie.value) ?? cookie.value,
          }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: req,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  )

  // IMPORTANT: Use getUser() instead of getSession() for security
  // getUser() validates the auth token with Supabase Auth server
  // getSession() can be spoofed as it only checks cookies
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = req.nextUrl
  const isAuthRoute = pathname.startsWith(AUTH_PREFIX)
  const isProtectedRoute =
    pathname === '/' || PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  // Redirect to auth if trying to access protected route without authentication
  if (isProtectedRoute && !user) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = AUTH_PREFIX
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to dashboard if already authenticated and trying to access auth pages
  if (isAuthRoute && user) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    redirectUrl.searchParams.delete('redirectedFrom')
    return NextResponse.redirect(redirectUrl)
  }

  // Security Headers
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  )
  // HSTS (solo efectivo en HTTPS, ignorado en localhost http)
  supabaseResponse.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

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
