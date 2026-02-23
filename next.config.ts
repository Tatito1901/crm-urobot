import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Habilitar Strict Mode para mejor detección de problemas
  reactStrictMode: true,

  // Optimizaciones del compilador SWC
  compiler: {
    // Remover console.log en producción
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Optimizaciones experimentales
  experimental: {
    // ✅ Tree-shaking optimizado para paquetes grandes (funciona con Turbopack)
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'recharts',
      'swr',
      'zustand',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-tooltip',
    ],
    // ✅ Client-side router cache: evita refetch al navegar entre páginas
    staleTimes: {
      dynamic: 300,  // 5 min para páginas dinámicas
      static: 600,   // 10 min para páginas estáticas
    },
    // ✅ Scroll restoration nativa del navegador
    scrollRestoration: true,
  },

  // ✅ Turbopack config (reemplaza webpack para dev)
  turbopack: {
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },

  // Configuración de imágenes optimizada
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000, // 1 año
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  // Headers de optimización para rendimiento
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // ✅ Cache agresivo para chunks JS/CSS
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // Configuración de producción
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  // ✅ Logging reducido en producción
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

export default withAnalyzer(nextConfig);
