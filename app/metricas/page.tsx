/**
 * ============================================================
 * METRICAS PAGE - Redirect a Estadísticas
 * ============================================================
 * Esta página redirige automáticamente a /estadisticas
 * que contiene todas las métricas y estadísticas unificadas
 */

import { redirect } from 'next/navigation';

export default function MetricasPage() {
  redirect('/estadisticas');
}
