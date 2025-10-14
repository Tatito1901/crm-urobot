'use client';

import { useMemo, useState } from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
import { PageShell } from '@/app/components/crm/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { mockData, STATE_COLORS, formatDate, Paciente } from '@/app/lib/crm-data';

export default function PacientesPage() {
  const [search, setSearch] = useState('');

  const filteredPacientes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return mockData.pacientes;
    return mockData.pacientes.filter((paciente) =>
      [paciente.nombre, paciente.telefono, paciente.email ?? ''].some((field) =>
        field.toLowerCase().includes(term),
      ),
    );
  }, [search]);

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
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-[0.3em] text-white/60">Buscar</CardTitle>
            <CardDescription className="text-[0.68rem] text-white/40">
              Nombre, teléfono o correo electrónico
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-0 sm:flex-row sm:items-center">
            <span className="text-white/40">🔍</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, teléfono o correo"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-300/40 sm:border-none sm:bg-transparent sm:px-0 sm:py-0"
            />
          </CardContent>
        </Card>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Pacientes filtrados</CardTitle>
            <CardDescription>Resultados tras aplicar búsqueda</CardDescription>
          </CardHeader>
          <CardContent className="flex items-baseline justify-between gap-2 pt-0">
            <p className="text-3xl font-semibold text-white">{totalPacientes}</p>
            <span className="text-xs uppercase tracking-[0.2em] text-white/40">Total</span>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Activos</CardTitle>
            <CardDescription>En seguimiento médico</CardDescription>
          </CardHeader>
          <CardContent className="flex items-baseline justify-between gap-2 pt-0">
            <p className="text-3xl font-semibold text-white">{activos}</p>
            <Badge label="activos" variant="outline" className="hidden text-[0.6rem] sm:flex" />
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Inactivos</CardTitle>
            <CardDescription>Sin consultas recientes</CardDescription>
          </CardHeader>
          <CardContent className="flex items-baseline justify-between gap-2 pt-0">
            <p className="text-3xl font-semibold text-white">{inactivos}</p>
            <Badge label="inactivos" variant="outline" className="hidden text-[0.6rem] sm:flex" />
          </CardContent>
        </Card>
      </section>

      <Card className="bg-white/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Listado de pacientes</CardTitle>
          <CardDescription>Información de contacto y estado clínico</CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden pt-0">
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
                <div className="flex flex-col">
                  <span className="font-medium text-white">{paciente.nombre}</span>
                  <span className="text-xs text-white/40">ID: {paciente.id}</span>
                </div>
              ),
              contacto: (
                <div className="space-y-1 text-sm">
                  <p className="text-white/80">{paciente.telefono}</p>
                  <p className="text-white/40">{paciente.email}</p>
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
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
