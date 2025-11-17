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
      'lucide-react',
      'date-fns',
    ],
    
    // Optimizar fonts para carga más rápida
    optimizeServerReact: true,
  },

  // Configuración de imágenes (si se usan next/image)
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
      {
        // Cache estático agresivo para assets
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Configuración de compresión y chunking
  webpack: (config, { isServer }) => {
    // Optimizar chunks para mejor carga en móviles
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Chunk de framework (React, Next.js)
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Chunk de librerías grandes
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module: any) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )?.[1];
                return `npm.${packageName?.replace('@', '')}`;
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            // Chunk de componentes comunes
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
          },
        },
      };
    }
    
    return config;
  },

  // Configuración de producción
  poweredByHeader: false,
  compress: true,
  
  // Optimizar generación de páginas estáticas
  productionBrowserSourceMaps: false,
};

export default nextConfig;
