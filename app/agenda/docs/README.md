# 📅 Documentación - Agenda Profesional

## 🎯 Índice Principal

Bienvenido a la documentación de la Agenda Profesional del CRM-UROBOT.

---

## 📚 Guías Principales

### 🚀 [Quick Start](../QUICK_START.md)
Guía rápida para empezar a usar la agenda.
- Configuración inicial
- Funcionalidades básicas
- Tips de productividad

### ✨ [Features Implementadas](../FEATURES_CONSOLIDADO.md)
Todas las características y mejoras implementadas:
- 🔥 Heatmap View
- 🎨 Colores Personalizables
- 💬 Tooltips Mejorados
- 📱 Responsive Design (estilo Google Calendar)
- 📏 Vista Compacta Sin Scroll
- 🌓 Next-Themes Integration
- Y más...

---

## 📖 Documentación Específica

### Diseño y UX
- [Simplificación UI](../SIMPLIFICACION_UI.md) - Mejoras de limpieza visual
- [Responsive Google Style](../RESPONSIVE_GOOGLE_STYLE.md) - Diseño adaptativo
- [Vista Compacta Sin Scroll](../VISTA_COMPACTA_SIN_SCROLL.md) - Optimización de espacio

### Features Individuales
- [Heatmap](../HEATMAP_IMPLEMENTADO.md) - Vista de densidad de citas
- [Colores](../COLORES_IMPLEMENTADO.md) - Sistema de colores personalizable
- [Tooltips y Modales](../MEJORAS_TOOLTIP_MODAL.md) - Mejoras de interacción
- [Edición de Citas](../MEJORAS_EDICION_CITAS.md) - Formularios optimizados
- [Visualización](../MEJORAS_VISUALIZACION.md) - Mejoras visuales generales

---

## 🗂️ Archivo Histórico

Documentos históricos de planeación y progreso:
- [📁 Ver Archive](./archive/) - Roadmaps, planes de sprint, y documentos de progreso

---

## 🏗️ Arquitectura

### Componentes Principales
```
📁 agenda/
├── 📁 components/
│   ├── calendar/      (HeaderBar, TimeGrid, DaysHeader, etc.)
│   ├── modals/        (Create, Edit, Details)
│   ├── shared/        (AppointmentCard, Tooltips, etc.)
│   ├── views/         (HeatmapView, ListView, etc.)
│   └── customization/ (ColorPicker, etc.)
├── 📁 hooks/          (useAgendaState, useColorPreferences, etc.)
├── 📁 lib/            (utils, positioning, constants)
├── 📁 services/       (appointments, patients)
└── 📁 docs/           (esta documentación)
```

### Stack Tecnológico
- **Framework**: Next.js 15 + React 19
- **Styling**: TailwindCSS 4 + shadcn/ui
- **State**: Zustand (global state)
- **Dates**: Temporal API (polyfill)
- **Icons**: Lucide React
- **Themes**: next-themes

---

## 📊 Estado del Proyecto

### ✅ Completado
- Sistema de calendario profesional
- Múltiples vistas (semana, día, mes, lista, heatmap)
- Gestión completa de citas (CRUD)
- Búsqueda y filtros avanzados
- Colores personalizables por sede
- Tooltips informativos
- Modales de creación/edición
- Responsive design (mobile-first)
- Dark/Light mode con next-themes
- Vista compacta sin scroll

### 🚧 En Progreso
- Integración con Supabase (backend)
- Sincronización con Google Calendar
- Recordatorios automáticos
- Exportación de reportes

### 📋 Próximas Mejoras
Ver [FEATURES_CONSOLIDADO.md](../FEATURES_CONSOLIDADO.md) para roadmap detallado

---

## 🤝 Contribuir

### Antes de Empezar
1. Lee el [Quick Start](../QUICK_START.md)
2. Familiarízate con la arquitectura
3. Revisa las [Features Implementadas](../FEATURES_CONSOLIDADO.md)

### Estándares de Código
- TypeScript estricto
- Componentes funcionales con hooks
- Tailwind para estilos (evitar CSS custom)
- Zustand para estado global
- Naming: camelCase para variables, PascalCase para componentes

---

## 📞 Soporte

¿Necesitas ayuda?
- Revisa la documentación específica arriba
- Consulta el código de componentes similares
- Revisa el [Quick Start](../QUICK_START.md)

---

**Última actualización**: Nov 19, 2025  
**Versión**: 2.0  
**Mantenido por**: Equipo CRM-UROBOT
