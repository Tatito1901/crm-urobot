# ⚡ Guía rápida - shadcn/ui en CRM UROBOT

## 🎯 Componentes más usados

### 1. **Button** - Botones con variantes

```tsx
import { Button } from '@/components/ui/button'

// ✅ Básico
<Button>Click me</Button>

// 🎨 Variantes de color
<Button variant="primary">Guardar</Button>
<Button variant="destructive">Eliminar</Button>
<Button variant="success">Confirmar</Button>
<Button variant="warning">Advertencia</Button>
<Button variant="outline">Cancelar</Button>
<Button variant="ghost">Texto</Button>
<Button variant="link">Ver más →</Button>

// 📏 Tamaños
<Button size="xs">XS</Button>
<Button size="sm">SM</Button>
<Button size="default">Default</Button>
<Button size="lg">LG</Button>
<Button size="xl">XL</Button>

// 🔘 Iconos
<Button size="icon-sm">
  <IconPlus className="w-4 h-4" />
</Button>

// 🔗 Como Link de Next.js
<Button asChild variant="primary">
  <Link href="/leads">Ir a Leads</Link>
</Button>

// ⏸️ Disabled
<Button disabled>Procesando...</Button>
```

---

### 2. **Tooltip** - Ayuda contextual

```tsx
import { InfoTooltip, HelpIcon, WrapTooltip } from '@/app/components/common/InfoTooltip'

// ❓ Icono de ayuda (más común)
<div className="flex items-center gap-2">
  <span>Lead</span>
  <HelpIcon content="Una persona interesada en agendar consulta" />
</div>

// 🎁 Envolver elemento
<WrapTooltip content="Haz clic para ver detalles">
  <Button>Ver más</Button>
</WrapTooltip>

// 📍 Posiciones
<HelpIcon content="Arriba" side="top" />
<HelpIcon content="Abajo" side="bottom" />
<HelpIcon content="Izquierda" side="left" />
<HelpIcon content="Derecha" side="right" />

// 📝 Contenido enriquecido
<HelpIcon 
  content={
    <div className="space-y-2">
      <p className="font-semibold">Título</p>
      <p className="text-white/70">Descripción detallada aquí</p>
      <ul className="list-disc pl-4 space-y-1">
        <li>Punto 1</li>
        <li>Punto 2</li>
      </ul>
    </div>
  } 
/>
```

---

### 3. **Badge** - Estados y categorías

```tsx
import { Badge } from '@/app/components/crm/ui'

// 🏷️ Básico (usa wrapper CRM para compatibilidad)
<Badge label="Nuevo" />
<Badge label="En proceso" tone="bg-blue-500/10 text-blue-300" />

// 🎨 O usa directo de shadcn
import { Badge } from '@/components/ui/badge'

<Badge variant="default">Default</Badge>
<Badge variant="success">Activo</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="purple">VIP</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="ghost">Ghost</Badge>

// 🔥 Con tooltip
<WrapTooltip content="Lead muy activo">
  <Badge variant="warning">🔥 Alta prioridad</Badge>
</WrapTooltip>
```

---

### 4. **Table** - Tablas responsivas

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>
        <div className="flex items-center gap-2">
          <span>Nombre</span>
          <HelpIcon content="Nombre completo del paciente" />
        </div>
      </TableHead>
      <TableHead>Estado</TableHead>
      <TableHead>Fecha</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.nombre}</TableCell>
        <TableCell>
          <Badge label={item.estado} />
        </TableCell>
        <TableCell>{item.fecha}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

### 5. **Card** - Contenedores

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>Estadísticas</CardTitle>
        <CardDescription>
          Resumen de la semana
        </CardDescription>
      </div>
      <HelpIcon content="Datos actualizados cada hora" />
    </div>
  </CardHeader>
  
  <CardContent>
    {/* Tu contenido aquí */}
  </CardContent>
  
  <CardFooter className="justify-between">
    <Button variant="outline">Cancelar</Button>
    <Button variant="primary">Guardar</Button>
  </CardFooter>
</Card>
```

---

## 🎨 Combinaciones comunes

### **Botones con estado de carga**
```tsx
const [loading, setLoading] = useState(false)

<Button 
  variant="primary" 
  disabled={loading}
  onClick={async () => {
    setLoading(true)
    await saveData()
    setLoading(false)
  }}
>
  {loading ? 'Guardando...' : 'Guardar'}
</Button>
```

### **Badge con contador**
```tsx
<Badge variant="info">
  Nuevos <span className="ml-1 font-bold">{count}</span>
</Badge>
```

### **Tabla con acciones**
```tsx
<TableRow>
  <TableCell>{item.nombre}</TableCell>
  <TableCell className="text-right">
    <div className="flex gap-2 justify-end">
      <Button size="icon-sm" variant="ghost">
        <IconEdit className="w-4 h-4" />
      </Button>
      <Button size="icon-sm" variant="destructive">
        <IconTrash className="w-4 h-4" />
      </Button>
    </div>
  </TableCell>
</TableRow>
```

### **Card clickeable**
```tsx
<Card 
  className="cursor-pointer hover:border-sky-500/50 transition-all"
  onClick={() => router.push(`/leads/${id}`)}
>
  <CardContent>
    <div className="flex items-center justify-between">
      <span>{nombre}</span>
      <Badge variant="success">Activo</Badge>
    </div>
  </CardContent>
</Card>
```

---

## 🎯 Tips y trucos

### **1. Combinar variantes con className**
```tsx
<Button 
  variant="primary" 
  className="w-full md:w-auto"
>
  Responsive button
</Button>
```

### **2. Tooltip con delay personalizado**
```tsx
<InfoTooltip 
  content="Aparece rápido" 
  delayDuration={100}
>
  <span>Hover me</span>
</InfoTooltip>
```

### **3. Badge con gradiente**
```tsx
<Badge 
  variant="default"
  className="bg-gradient-to-r from-sky-500/20 to-purple-500/20"
>
  Premium
</Badge>
```

### **4. Button group**
```tsx
<div className="flex gap-2">
  <Button variant="outline">Día</Button>
  <Button variant="primary">Semana</Button>
  <Button variant="outline">Mes</Button>
</div>
```

### **5. Table con hover personalizado**
```tsx
<TableRow className="hover:bg-sky-500/5 cursor-pointer">
  {/* ... */}
</TableRow>
```

---

## 🚨 Errores comunes

### ❌ **No usar TooltipProvider**
```tsx
// MAL
<Tooltip>...</Tooltip>  // Error: falta provider

// BIEN
// Ya está en /app/providers.tsx ✅
```

### ❌ **No usar asChild con Link**
```tsx
// MAL
<Button onClick={() => router.push('/leads')}>...</Button>

// BIEN
<Button asChild>
  <Link href="/leads">...</Link>
</Button>
```

### ❌ **Olvidar imports**
```tsx
// MAL
import { Button } from 'shadcn'  // ❌

// BIEN
import { Button } from '@/components/ui/button'  // ✅
```

---

## 📱 Responsividad

### **Botones responsive**
```tsx
<Button 
  size="sm" 
  className="md:size-default w-full md:w-auto"
>
  Responsive
</Button>
```

### **Ocultar en mobile**
```tsx
<Button className="hidden md:inline-flex">
  Desktop only
</Button>

<Button className="md:hidden">
  Mobile only
</Button>
```

### **Stack en mobile**
```tsx
<div className="flex flex-col md:flex-row gap-2">
  <Button>Cancelar</Button>
  <Button variant="primary">Guardar</Button>
</div>
```

---

## 🎓 Recursos útiles

- **shadcn docs**: https://ui.shadcn.com
- **Radix UI**: https://radix-ui.com
- **Ejemplos**: Busca en `/app/leads/page.tsx` para ver uso real

---

## ✨ Checklist de migración

Cuando migres un componente custom:

- [ ] Instalar componente: `npx shadcn@latest add [component]`
- [ ] Personalizar estilos oscuros si es necesario
- [ ] Crear wrapper si necesitas props custom
- [ ] Actualizar imports en archivos que lo usen
- [ ] Verificar que funcione en mobile
- [ ] Probar accesibilidad (Tab, Enter, Escape)
- [ ] Documentar en este archivo si es algo nuevo

---

¡Listo! Ahora tienes todo para usar shadcn/ui en tu CRM 🚀
