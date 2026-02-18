import type { MetadataRoute } from 'next';

/**
 * Robots.txt generado dinámicamente por Next.js
 * CRM interno — bloqueamos indexación de motores de búsqueda
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
