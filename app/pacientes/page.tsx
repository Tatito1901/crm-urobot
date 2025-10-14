'use client';

import { useMemo, useState } from 'react';
import { Badge, DataTable } from '@/app/components/crm/ui';
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#101c3b,_#02040a_70%)] text-white">
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-20 pt-10">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-200/60">Pacientes</p>
            <h1 className="text-3xl font-semibold text-white">Carpeta clínica activa</h1>
            <p className="text-sm text-white/60">
              Historial de consultas, datos de contacto y estado general de cada paciente.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/70 shadow-inner">
            <span className="text-white/40">🔍</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, teléfono o correo"
              className="w-64 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>
        </header>

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
      </div>
    </div>
  );
}
