# 🔗 Guía de Integración - Eventos en Calendario

## 📋 Fase 2: Integrar Consultas como Eventos

Esta guía te ayudará a integrar las consultas existentes de Supabase como eventos visuales en el calendario.

---

## 🎯 Objetivo

Mostrar las consultas del sistema actual (que ya están en `/agenda`) como eventos visuales en el nuevo calendario Material Design.

---

## 📦 Lo que Ya Tienes

### ✅ Sistema Actual de Consultas
```typescript
// Hook existente
import { useConsultas } from '@/hooks/useConsultas';

// Tipos existentes
import type { Consulta } from '@/types/consultas';

// Componentes existentes
import { AppointmentModal } from '@/app/agenda/components/AppointmentModal';
import { StatusBadge } from '@/app/agenda/components/StatusBadge';
```

### ✅ Calendario Funcional
- Grid de tiempo (11:00-21:30 cada 30min)
- Navegación semanal
- Mini-calendario
- Diseño Material Design

---

## 🚀 Plan de Integración (4-6 horas)

### Paso 1: Crear Componente EventCard (1 hora)

**Crear**: `app/agenda/components/calendar/EventCard.tsx`

```typescript
/**
 * EVENT CARD - Tarjeta de evento para el calendario
 */

'use client';

import React from 'react';
import type { Consulta } from '@/types/consultas';
import { formatShortTime, getStatusConfig } from '@/app/agenda/lib/agenda-utils';

interface EventCardProps {
  event: Consulta;
  startTime: string;
  endTime: string;
  onClick: () => void;
}

export const EventCard = React.memo(function EventCard({
  event,
  startTime,
  endTime,
  onClick
}: EventCardProps) {
  const statusConfig = getStatusConfig(event.estado.toLowerCase());

  return (
    <button
      onClick={onClick}
      className={`
        absolute left-1 right-1 rounded-md border-l-4 px-2 py-1
        text-left text-xs transition-all hover:shadow-lg hover:z-10
        ${statusConfig.bgClass} ${statusConfig.borderClass}
      `}
    >
      <div className="font-semibold text-gray-900 truncate">
        {event.paciente}
      </div>
      <div className="text-gray-700 text-[10px]">
        {startTime} - {endTime}
      </div>
      {event.motivoConsulta && (
        <div className="text-gray-600 text-[10px] truncate">
          {event.motivoConsulta}
        </div>
      )}
    </button>
  );
});
```

**Agregar a `agenda-utils.ts` si no existe**:

```typescript
export const STATUS_CONFIG = {
  programada: {
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-500',
  },
  confirmada: {
    bgClass: 'bg-green-50',
    borderClass: 'border-green-500',
  },
  reagendada: {
    bgClass: 'bg-yellow-50',
    borderClass: 'border-yellow-500',
  },
  cancelada: {
    bgClass: 'bg-gray-50',
    borderClass: 'border-gray-400',
  },
};
```

---

### Paso 2: Modificar TimeGrid para Renderizar Eventos (2 horas)

**Actualizar**: `app/agenda/components/calendar/TimeGrid.tsx`

```typescript
// Agregar imports
import { EventCard } from './EventCard';
import type { Consulta } from '@/types/consultas';
import { Temporal } from '@js-temporal/polyfill';

// Actualizar interface
interface TimeGridProps {
  weekStart: Date;
  startHour?: number;
  endHour?: number;
  consultas?: Consulta[];  // NUEVO
  onEventClick?: (consulta: Consulta) => void;  // NUEVO
}

// Dentro del componente, agregar función helper
const calculateEventPosition = (
  horaInicio: string,
  duracionMinutos: number,
  startHour: number
): { top: number; height: number } => {
  const [hora, minutos] = horaInicio.split(':').map(Number);
  const minutosDesdeInicio = ((hora - startHour) * 60) + minutos;

  return {
    top: (minutosDesdeInicio / 30) * 48,  // 48px por cada 30min
    height: (duracionMinutos / 30) * 48,
  };
};

// En el renderizado de cada columna de día, agregar:
{/* Dentro de cada día, después del grid de slots */}
<div className="absolute inset-0 pointer-events-none">
  <div className="relative h-full pointer-events-auto">
    {consultas
      ?.filter(c => {
        const consultaDate = new Date(c.fechaConsulta);
        return isSameDay(consultaDate, date);
      })
      .map(consulta => {
        const { top, height } = calculateEventPosition(
          consulta.horaConsulta,
          consulta.duracionMinutos ?? 45,
          startHour
        );

        return (
          <div
            key={consulta.uuid}
            style={{
              position: 'absolute',
              top: `${top}px`,
              height: `${height}px`,
              left: '0',
              right: '0',
            }}
          >
            <EventCard
              event={consulta}
              startTime={consulta.horaConsulta}
              endTime={calculateEndTime(
                consulta.horaConsulta,
                consulta.duracionMinutos ?? 45
              )}
              onClick={() => onEventClick?.(consulta)}
            />
          </div>
        );
      })}
  </div>
</div>
```

**Agregar helper para calcular hora de fin**:

```typescript
const calculateEndTime = (startTime: string, duration: number): string => {
  const [hora, minutos] = startTime.split(':').map(Number);
  const totalMinutos = hora * 60 + minutos + duration;
  const horaFin = Math.floor(totalMinutos / 60);
  const minutosFin = totalMinutos % 60;
  return `${String(horaFin).padStart(2, '0')}:${String(minutosFin).padStart(2, '0')}`;
};
```

---

### Paso 3: Conectar con Hook de Consultas (1 hora)

**Actualizar**: `app/agenda/calendar/page.tsx`

```typescript
import { useConsultas } from '@/hooks/useConsultas';
import { AppointmentModal } from '@/app/agenda/components/AppointmentModal';

export default function CalendarPage() {
  // ... estados existentes ...

  // NUEVO: Hook de consultas
  const { consultas, loading } = useConsultas();

  // NUEVO: Estado para modal
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // NUEVO: Handler para eventos
  const handleEventClick = useCallback((consulta: Consulta) => {
    setSelectedConsulta(consulta);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedConsulta(null), 300);
  }, []);

  // Filtrar consultas de la semana actual
  const weekConsultas = useMemo(() => {
    return consultas.filter(consulta => {
      const consultaDate = new Date(consulta.fechaConsulta);
      const weekEnd = addDays(currentWeekStart, 6);
      return consultaDate >= currentWeekStart && consultaDate <= weekEnd;
    });
  }, [consultas, currentWeekStart]);

  return (
    <div className="h-screen flex flex-col bg-white font-roboto">
      {/* ... resto del JSX ... */}

      {/* Actualizar TimeGrid */}
      <TimeGrid
        weekStart={currentWeekStart}
        startHour={11}
        endHour={21}
        consultas={weekConsultas}  // NUEVO
        onEventClick={handleEventClick}  // NUEVO
      />

      {/* NUEVO: Modal de detalles */}
      <AppointmentModal
        consulta={selectedConsulta}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
```

---

### Paso 4: Agregar Estados de Carga (30 min)

**En el TimeGrid**, agregar skeleton:

```typescript
{loading && (
  <div className="absolute inset-0 flex items-center justify-center bg-white/50">
    <div className="text-sm text-gray-500">
      Cargando consultas...
    </div>
  </div>
)}
```

**Si no hay eventos**:

```typescript
{!loading && weekConsultas.length === 0 && (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="text-center text-gray-400">
      <svg className="mx-auto h-12 w-12 mb-2" /* ... icono calendario ... */ />
      <p className="text-sm">Sin citas esta semana</p>
    </div>
  </div>
)}
```

---

### Paso 5: Manejar Colisiones de Eventos (30 min - opcional)

Si hay eventos superpuestos, agregar lógica para mostrarlos lado a lado:

```typescript
// Detectar colisiones
const getEventColumns = (events: Consulta[]) => {
  const columns: Consulta[][] = [];

  events.forEach(event => {
    let placed = false;

    for (let col of columns) {
      const hasCollision = col.some(e => eventsOverlap(e, event));
      if (!hasCollision) {
        col.push(event);
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push([event]);
    }
  });

  return columns;
};

// Ajustar ancho y posición
const columnCount = columns.length;
const columnIndex = /* índice de la columna del evento */;

style={{
  left: `${(100 / columnCount) * columnIndex}%`,
  width: `${100 / columnCount}%`,
  // ... top y height ...
}}
```

---

## 🎨 Estilos de Eventos por Estado

Los colores deben coincidir con los existentes en tu app:

```typescript
// Usar los colores de app/agenda/lib/agenda-utils.ts
export const STATUS_CONFIG = {
  programada: {
    main: '#60a5fa',      // blue-400
    bg: 'bg-blue-50',
    border: 'border-blue-400',
  },
  confirmada: {
    main: '#34d399',      // green-400
    bg: 'bg-green-50',
    border: 'border-green-500',
  },
  reagendada: {
    main: '#fbbf24',      // yellow-400
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
  },
  cancelada: {
    main: '#9ca3af',      // gray-400
    bg: 'bg-gray-50',
    border: 'border-gray-400',
  },
};
```

---

## ✅ Checklist de Integración

### Antes de Empezar
- [ ] Hook `useConsultas` funcionando
- [ ] Tipos `Consulta` definidos
- [ ] `AppointmentModal` disponible

### Durante la Integración
- [ ] Crear `EventCard.tsx`
- [ ] Actualizar `TimeGrid.tsx` con props de eventos
- [ ] Agregar lógica de posicionamiento
- [ ] Conectar con `useConsultas` en page
- [ ] Agregar estado de modal
- [ ] Filtrar eventos por semana
- [ ] Probar con datos reales

### Después de Integrar
- [ ] Verificar colores por estado
- [ ] Probar click en evento → modal
- [ ] Verificar navegación entre semanas
- [ ] Probar con múltiples eventos
- [ ] Verificar eventos superpuestos
- [ ] Probar en diferentes resoluciones
- [ ] Verificar performance con muchos eventos

---

## 🐛 Problemas Comunes

### Eventos no se muestran
**Solución**: Verificar que `fechaConsulta` esté en formato correcto (YYYY-MM-DD)

### Eventos mal posicionados
**Solución**: Verificar que `horaConsulta` esté en formato HH:mm:ss

### Eventos se superponen mal
**Solución**: Implementar lógica de columnas (Paso 5)

### Modal no se abre
**Solución**: Verificar que `AppointmentModal` esté importado correctamente

---

## 📊 Testing

### Casos de Prueba

1. **Sin eventos**: Debe mostrar mensaje "Sin citas"
2. **1 evento**: Debe verse claramente en el grid
3. **Múltiples eventos**: Deben distribuirse correctamente
4. **Eventos superpuestos**: Deben mostrarse lado a lado
5. **Eventos de diferentes estados**: Colores correctos
6. **Navegación**: Eventos deben cambiar con la semana
7. **Click**: Modal debe abrirse con detalles
8. **Loading**: Skeleton debe mostrarse mientras carga

---

## 🚀 Resultado Esperado

Después de esta integración:

✅ Eventos visuales en el grid
✅ Colores por estado
✅ Click → modal con detalles completos
✅ Navegación semanal funcional
✅ Performance optimizada con React.memo

---

## 📞 Soporte

Si encuentras problemas durante la integración:

1. Verifica los tipos en TypeScript
2. Revisa la consola del navegador
3. Prueba con datos mock primero
4. Incrementa gradualmente la complejidad

---

**Próxima fase después de esto**: Drag & drop para reagendar

**Estimación total**: 4-6 horas de desarrollo + testing
