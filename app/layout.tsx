import type { Metadata, Viewport } from 'next'
import { Geist, Plus_Jakarta_Sans } from 'next/font/google'
// ✅ OPTIMIZACIÓN: Temporal polyfill ahora se carga condicionalmente en componentes que lo necesitan
import './globals.css'
import { AppShell } from './components/common/AppShell'
import { Providers } from './providers'

// ✅ OPTIMIZACIÓN: Reducir a 2 fuentes esenciales con font-display: swap
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap', // Evita FOIT (Flash of Invisible Text)
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
  adjustFontFallback: true, // Reduce CLS (Cumulative Layout Shift)
})

const jakarta = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: {
    default: 'CRM · Urobot',
    template: '%s | Urobot',
  },
  description: 'Panel operativo para agentes asistidos por IA',
  manifest: '/manifest.json',
}

// ✅ Next.js 15: viewport y themeColor deben estar en export separado
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#03060f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Preconnect a Supabase para reducir latencia de API calls */}
        {/* NOTA: Google Fonts preconnect eliminado — next/font self-hosts las fuentes */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
          </>
        )}
      </head>
      <body className={`${geistSans.variable} ${jakarta.variable} antialiased bg-background text-foreground`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
