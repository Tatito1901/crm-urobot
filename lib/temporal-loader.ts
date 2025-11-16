/**
 * ============================================================
 * TEMPORAL POLYFILL LOADER
 * ============================================================
 * Carga condicional del polyfill de Temporal solo si no existe
 * soporte nativo en el navegador
 * 
 * Optimización: Reduce ~50KB del bundle inicial
 */

let polyfillLoaded = false;

// Type assertion para globalThis con Temporal
interface GlobalWithTemporal {
  Temporal?: typeof import('@js-temporal/polyfill').Temporal;
}

export async function ensureTemporalPolyfill() {
  // Si ya está cargado, no hacer nada
  if (polyfillLoaded) {
    return;
  }

  // Si el navegador tiene soporte nativo, no cargar polyfill
  if ('Temporal' in globalThis && (globalThis as GlobalWithTemporal).Temporal) {
    polyfillLoaded = true;
    return;
  }

  // Cargar polyfill de forma asíncrona
  try {
    await import('@js-temporal/polyfill');
    polyfillLoaded = true;
  } catch (error) {
    console.error('Error loading Temporal polyfill:', error);
    throw error;
  }
}
