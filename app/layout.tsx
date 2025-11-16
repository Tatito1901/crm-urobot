import type { Metadata, Viewport } from 'next'
import { Geist, Roboto } from 'next/font/google'
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
})

const roboto = Roboto({
  weight: ['400', '500', '700'], // Reducido de 4 a 3 weights
  variable: '--font-roboto',
  subsets: ['latin'],
  display: 'swap',
  preload: false, // Solo preload de fuente principal
})

export const metadata: Metadata = {
  title: 'CRM · Dr. Mario Martínez Thomas',
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
    <html lang="es">
      <body className={`${geistSans.variable} ${roboto.variable} antialiased bg-[#03060f] text-white`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
