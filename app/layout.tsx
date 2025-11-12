import type { Metadata } from 'next'
import { Geist, Geist_Mono, Roboto } from 'next/font/google'
import '@js-temporal/polyfill'
import './globals.css'
import { AppShell } from './components/common/AppShell'
import { Providers } from './providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CRM · Dr. Mario Martínez Thomas',
  description: 'Panel operativo para agentes asistidos por IA',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} antialiased bg-[#03060f] text-white`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
