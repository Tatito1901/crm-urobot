import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav, Sidebar, MobileSidebar } from "./components/common/Sidebar";
import '@js-temporal/polyfill'; // <-- AÑADE ESTA LÍNEA AQUÍ


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM · Dr. Mario Martínez Thomas",
  description: "Panel operativo para agentes asistidos por IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#03060f] text-white`}
      >
        <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_#101c3b,_#02040a_70%)]">
          <MobileSidebar />
          <Sidebar />
          <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
            <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">{children}</main>
            <BottomNav />
          </div>
        </div>
      </body>
    </html>
  );
}
