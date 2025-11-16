'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { STATE_COLORS, formatDate } from '@/app/lib/crm-data';
import type { Paciente } from '@/types/pacientes';
import { usePacientes } from '@/hooks/usePacientes';
import { ContentLoader, TableContentSkeleton } from '@/app/components/common/ContentLoader';
import { typography, spacing, cards, inputs, badges } from '@/app/lib/design-system';

export const dynamic = 'force-dynamic';

export default function PacientesPage() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  // ✅ Datos reales de Supabase
  const { pacientes, loading, error, refetch } = usePacientes();

  // Handler para navegar al perfil del paciente
  const handlePacienteClick = (pacienteId: string) => {
    router.push(`/pacientes/${pacienteId}`);
  };

  // ✅ OPTIMIZACIÓN: Prefetch en hover para navegación instantánea
  const handlePacienteHover = (pacienteId: string) => {
    router.prefetch(`/pacientes/${pacienteId}`);
  };

  const filteredPacientes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return pacientes;
    return pacientes.filter((paciente) =>
      [paciente.nombre, paciente.telefono, paciente.email ?? ''].some((field) =>
        field.toLowerCase().includes(term),
      ),
    );
  }, [search, pacientes]);

  const totalPacientes = filteredPacientes.length;
  const activos = filteredPacientes.filter((paciente) => paciente.estado === 'Activo').length;
  const inactivos = filteredPacientes.filter((paciente) => paciente.estado === 'Inactivo').length;

  return (
    <PageShell
      accent
      eyebrow="Pacientes"
      title="Carpeta clínica activa"
      description="Historial de consultas, datos de contacto y estado general de cada paciente."
      headerSlot={
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className={typography.label}>Buscar</CardTitle>
            <CardDescription className={typography.metadataSmall}>
              Nombre, teléfono o correo electrónico
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-0 sm:flex-row sm:items-center">
            <span className="text-white/40 text-xl">🔍</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, teléfono o correo"
              className={`${inputs.search} sm:border-none sm:bg-transparent sm:px-0 sm:py-0`}
            />
          </CardContent>
        </Card>
      }
    >
      <section className="grid gap-3 grid-cols-1 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className={typography.cardTitleSmall}>Pacientes filtrados</CardTitle>
            <CardDescription className={typography.cardDescription}>Resultados tras aplicar búsqueda</CardDescription>
          </CardHeader>
          <CardContent className="flex items-baseline justify-between gap-2 pt-0">
            <p className={typography.metricLarge}>{totalPacientes}</p>
            <span className={typography.labelSmall}>Total</span>
          </CardContent>
        </Card>
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className={typography.cardTitleSmall}>Activos</CardTitle>
            <CardDescription className={typography.cardDescription}>En seguimiento médico</CardDescription>
          </CardHeader>
          <CardContent className="flex items-baseline justify-between gap-2 pt-0">
            <p className={typography.metricLarge}>{activos}</p>
            <Badge label="activos" variant="outline" className={`hidden sm:flex ${badges.sizeSmall}`} />
          </CardContent>
        </Card>
        <Card className={cards.base}>
          <CardHeader className={spacing.cardHeader}>
            <CardTitle className={typography.cardTitleSmall}>Inactivos</CardTitle>
            <CardDescription className={typography.cardDescription}>Sin consultas recientes</CardDescription>
          </CardHeader>
          <CardContent className="flex items-baseline justify-between gap-2 pt-0">
            <p className={typography.metricLarge}>{inactivos}</p>
            <Badge label="inactivos" variant="outline" className={`hidden sm:flex ${badges.sizeSmall}`} />
          </CardContent>
        </Card>
      </section>

      <Card className={`${cards.base} min-h-[600px]`}>
        <CardHeader className={spacing.cardHeader}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className={typography.cardTitle}>
                Listado de pacientes
              </CardTitle>
              <CardDescription className={typography.cardDescription}>
                {error 
                  ? `Error: ${error.message}` 
                  : 'Información de contacto y estado clínico'
                }
              </CardDescription>
            </div>
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="rounded-lg bg-blue-600/20 px-3 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/30 disabled:opacity-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              ↻
            </button>
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden pt-0">
          <ContentLoader
            loading={loading}
            error={error}
            onRetry={refetch}
            isEmpty={filteredPacientes.length === 0}
            minHeight="min-h-[500px]"
            skeleton={<TableContentSkeleton rows={8} />}
            emptyState={
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <p className="text-4xl sm:text-5xl">👥</p>
                <p className={typography.body}>
                  {search ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                </p>
              </div>
            }
          >
            <DataTable
              headers={[
                { key: 'nombre', label: 'Nombre' },
                { key: 'contacto', label: 'Contacto' },
                { key: 'estado', label: 'Estado' },
                { key: 'consultas', label: 'Consultas', align: 'right' },
                { key: 'ultimaConsulta', label: 'Última consulta' },
              ]}
              rows={filteredPacientes.map((paciente: Paciente) => ({
                id: paciente.id,
                nombre: (
                  <div className="flex flex-col gap-1">
                    <span className={`${typography.body} font-medium`}>{paciente.nombre}</span>
                    <span className={typography.metadataSmall}>ID: {paciente.id}</span>
                  </div>
                ),
                contacto: (
                  <div className="space-y-1">
                    <p className={typography.bodySecondary}>{paciente.telefono}</p>
                    <p className={typography.metadata}>{paciente.email}</p>
                  </div>
                ),
                estado: <Badge label={paciente.estado} tone={STATE_COLORS[paciente.estado]} />,
                consultas: <span className="font-medium text-white">{paciente.totalConsultas}</span>,
                ultimaConsulta: (
                  <span>
                    {paciente.ultimaConsulta ? formatDate(paciente.ultimaConsulta) : 'Sin consulta previa'}
                  </span>
                ),
              }))}
              empty={search ? 'Sin coincidencias para el criterio aplicado.' : 'No hay pacientes registrados aún.'}
              mobileConfig={{
                primary: 'nombre',
                secondary: 'contacto',
                metadata: ['estado', 'ultimaConsulta']
              }}
              onRowClick={(rowId) => handlePacienteClick(rowId)}
              onRowHover={(rowId) => handlePacienteHover(rowId)}
            />
          </ContentLoader>
        </CardContent>
      </Card>
    </PageShell>
  );
}
