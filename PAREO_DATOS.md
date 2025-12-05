# Pareo de Datos: Base de Datos vs Plataforma

Este documento certifica la congruencia entre la **Base de Datos (Fuente de la Verdad)** y la **Interfaz de Usuario** del CRM Urobot.

**Fecha de Verificación:** 05 de Diciembre 2025
**Estado Global:** ✅ 100% Sincronizado

---

## 1. Leads (`/leads`)

| Campo BD (`leads`) | Propiedad Frontend (`Lead`) | Visualización UI | Congruencia |
| :--- | :--- | :--- | :---: |
| `telefono_whatsapp` | `telefono` | Formato internacional | ✅ |
| `estado` | `estado` | Badge de color (Ver tabla abajo) | ✅ |
| `fuente_lead` | `fuente` | Icono (FB, IG, Google) | ✅ |
| `nombre_completo` | `nombreCompleto` | Título principal | ✅ |
| `fecha_primer_contacto`| `primerContacto` | "Hace X días" | ✅ |
| `total_interacciones` | `totalInteracciones` | Temperatura (Frio/Tibio/Caliente) | ✅ |

### Estados de Lead (Fuente de Verdad)
La plataforma respeta estrictamente estos estados definidos en BD:
- 🔵 **Nuevo**: Recién creado
- 🟠 **Contactado**: Se envió respuesta
- 🟣 **Interesado**: Responde positivamente
- 💖 **Calificado**: Potencial paciente
- 🟢 **Convertido**: **YA ES PACIENTE** (tiene `paciente_id`)
- ⚪ **No_Interesado**: Descartado
- 🔴 **Perdido**: Sin respuesta prolongada

---

## 2. Consultas (`/consultas`)

| Campo BD (`consultas`) | Propiedad Frontend (`Consulta`) | Visualización UI | Congruencia |
| :--- | :--- | :--- | :---: |
| `fecha_hora_inicio` | `fechaHoraInicio` | Fecha y Hora local | ✅ |
| `estado_cita` | `estadoCita` | Badge de Estado | ✅ |
| `sede` | `sede` | Polanco / Satélite | ✅ |
| `tipo_cita` | `tipoCita` | Primera Vez / Seguimiento | ✅ |
| `estado_confirmacion` | `estadoConfirmacion` | Indicador de Confirmación | ✅ |
| `confirmado_paciente` | `confirmadoPaciente` | ✅ Check verde si es true | ✅ |

### Estados de Cita
- 🟦 **Programada**: Cita futura normal
- 🟩 **Confirmada**: Paciente confirmó asistencia
- 🟧 **Pendiente**: Requiere acción
- 🟥 **Cancelada**: No ocurrirá
- ✅ **Completada**: Ocurrió exitosamente

---

## 3. Pacientes (`/pacientes`)

| Campo BD (`pacientes`) | Propiedad Frontend (`Paciente`) | Visualización UI | Congruencia |
| :--- | :--- | :--- | :---: |
| `nombre_completo` | `nombreCompleto` | Nombre principal | ✅ |
| `telefono` | `telefono` | Contacto principal | ✅ |
| `estado` | `estado` | Activo / Inactivo | ✅ |
| `created_at` | `createdAt` | Fecha registro | ✅ |
| `notas` | `notas` | Historial clínico breve | ✅ |

---

## 4. Conversaciones (`/conversaciones`)

| Campo BD (`conversaciones`) | Propiedad Frontend (`Mensaje`) | Visualización UI | Congruencia |
| :--- | :--- | :--- | :---: |
| `mensaje` | `contenido` | Burbuja de texto | ✅ |
| `rol` | `rol` | Derecha (Usuario) / Izq (Asistente) | ✅ |
| `created_at` | `createdAt` | Hora en burbuja | ✅ |
| `tipo_mensaje` | `tipoMensaje` | Icono de tipo (Audio/Foto) | ✅ |
| `media_url` | `mediaUrl` | Preview de imagen/audio | ✅ |

### Lógica de Identificación de Contacto
La plataforma cruza 3 tablas para identificar al usuario:
1. **Es Paciente** si: Tiene citas válidas O es un lead convertido. -> Muestra Avatar Verde/Azul.
2. **Es Lead** si: Está en tabla `leads` pero no tiene citas. -> Muestra Avatar Naranja.
3. **Desconocido** si: Solo hay mensajes sin registro previo. -> Muestra Avatar Gris.

---

## Acciones Correctivas Realizadas
Para garantizar este pareo, se realizaron las siguientes intervenciones en el código:

1. **Sincronización de Tipos TypeScript**: Se crearon interfaces (`types/chat.ts`, `types/leads.ts`) que replican exactamente las columnas de la BD.
2. **Eliminación de Cálculos Manuales**: Se migraron métricas de dashboard a funciones de Base de Datos (`get_dashboard_stats` RPC) para evitar errores de cálculo en el navegador.
3. **Validación de Enums**: Se forzó el uso de los valores exactos de la BD ('Nuevo', 'Programada') en los selectores de la UI.
