# Mockups y prototipo — SalesFlow

**Curso:** IF2003 Programación Web · Grupo 603

El diseño de las pantallas se prototipó en **Figma** antes de implementar el frontend. Esta sección documenta el prototipo y su relación con el código final, conforme a la sección 9 de las especificaciones.

---

## 1. Enlaces al prototipo navegable

| Pantalla | Enlace Figma |
|----------|--------------|
| Dashboard / Inicio | https://www.figma.com/make/Au6RAlIK0UnUKk4CDEVuDX/Dashboard-para-SalesFlow?p=f&fullscreen=1 |
| Productos / catálogo | https://www.figma.com/make/yKnN4nBh2nSNQ2KMWp5g0Y/Minimalist-sidebar-component--Community-?p=f&fullscreen=1&preview-route=%2Fproductos |

> Para evidencia offline, se recomienda exportar capturas de cada pantalla a `docs/mockups/` (PNG) y enlazarlas aquí.

---

## 2. Pantallas del prototipo y su implementación

| Pantalla del prototipo | Implementada en | Estado |
|------------------------|-----------------|--------|
| Dashboard / Inicio | `frontend/index.html` + `dashboard.js` | ✅ Implementada (estadísticas en vivo desde `/api/stats`) |
| Catálogo de productos | `frontend/productos.html` (modo "Ver catálogo") | ✅ Implementada |
| Gestión de inventario (CRUD) | `frontend/productos.html` (modo "Gestionar") | ✅ Implementada |
| Registro / búsqueda de clientes | `frontend/clientes.html` | ✅ Implementada |
| Registro de venta (POS) | `frontend/ventas.html` | ✅ Implementada |

---

## 3. Cambios respecto al prototipo y su justificación (§9.2)

La implementación no es idéntica al prototipo. Las diferencias y su razón:

- **Navegación superior en vez de sidebar:** el prototipo exploró un componente de barra lateral, pero en la implementación se usó una **barra de navegación superior** por simplicidad, consistencia entre las cuatro vistas y mejor comportamiento responsive en móvil.
- **Estados de interfaz añadidos:** sobre el diseño base se agregaron estados que el prototipo no detallaba — **cargando, vacío, error y notificaciones (toasts)** — requeridos para una app conectada a un backend real.
- **Datos reales en lugar de estáticos:** el prototipo mostraba datos de ejemplo; la implementación los reemplaza por datos provenientes de la API (catálogo, stock, estadísticas).
- **Indicadores de stock:** se incorporaron badges "OK / Stock bajo" no presentes en el mockup, para reflejar la regla de negocio de inventario.

---

## 4. Pantallas fuera de alcance
No se implementaron pantallas de **autenticación/login** ni de **reportes históricos**, por estar fuera del alcance definido para esta entrega (ver `docs/SRS.md`, sección 1.2).

---

## 5. Principios UI/UX aplicados
- **Jerarquía visual:** tipografías Outfit (títulos) y DM Sans (cuerpo); encabezados y acentos diferenciados.
- **Consistencia:** mismos componentes (botones, tarjetas, formularios) y paleta en todas las vistas.
- **Retroalimentación:** toasts de éxito/error, loaders y confirmaciones antes de eliminar.
- **Accesibilidad básica:** `label` en formularios, roles ARIA en alertas, contraste alto sobre fondo oscuro.
- **Claridad de navegación:** barra superior fija con la vista activa resaltada.
