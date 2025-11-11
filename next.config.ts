import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilitar Strict Mode para mejor detección de problemas
  reactStrictMode: true,

  // Optimizaciones del compilador
  compiler: {
    // Remover console.log en producción
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Optimizaciones experimentales
  experimental: {
    // Tree-shaking optimizado para paquetes grandes
    optimizePackageImports: [
      '@schedule-x/calendar',
      '@schedule-x/react',
      '@supabase/supabase-js',
    ],
  },

  // Configuración de imágenes (si se usan next/image)
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
