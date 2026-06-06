# SalesFlow

Sistema web full-stack de gestión de ventas e inventario para una licorera. Permite registrar clientes, procesar ventas con control de stock y administrar el catálogo de productos desde un punto de venta unificado, sin papel ni hojas de cálculo.

---

## Descripción

**Problema:** una licorera lleva su inventario y ventas de forma manual; consultar disponibilidad, precios o el historial de un cliente es lento y propenso a errores (vender sin stock, precios mal puestos, clientes duplicados).

**Solución:** una aplicación web que centraliza productos, clientes y ventas sobre una API REST con persistencia real, con validaciones que evitan esos errores. **Valor:** el personal de mostrador y el administrador trabajan sobre los mismos datos en tiempo real, con stock que se descuenta automáticamente en cada venta.

---

## Prototipo navegable (mockups)

Diseñado en Figma antes de implementar:
- 🔗 [Dashboard / Inicio](https://www.figma.com/make/Au6RAlIK0UnUKk4CDEVuDX/Dashboard-para-SalesFlow?p=f&fullscreen=1)
- 🔗 [Productos / catálogo](https://www.figma.com/make/yKnN4nBh2nSNQ2KMWp5g0Y/Minimalist-sidebar-component--Community-?p=f&fullscreen=1&preview-route=%2Fproductos)

Relación entre el prototipo y la implementación: ver [`docs/mockups/mockups.md`](docs/mockups/mockups.md).

---

## Integrantes

| Nombre | Rol principal | Responsabilidades |
|--------|---------------|-------------------|
| *(completar)* | Backend | API REST, controladores, servicios |
| *(completar)* | Frontend | Vistas, consumo de API, estados de interfaz |
| *(completar)* | Documentación | SRS, diagramas, arquitectura |
| *(completar)* | QA / Datos | Pruebas, datos seed, persistencia |

---

## Stack tecnológico

| Capa | Tecnología | Justificación breve |
|------|------------|---------------------|
| Frontend | HTML5 semántico · CSS3 (Flexbox/Grid) · **JavaScript vanilla** | El alcance (3 entidades, CRUD) no requiere un framework pesado; control total y cero build |
| Backend | **Node.js + Express.js** | Rapidez para API REST y coherencia con lo visto en clase |
| Persistencia | **Archivo JSON** gestionado por el backend | Persistencia real y simple de demostrar; permitida por la rúbrica |
| Tipografía | Outfit (títulos) · DM Sans (cuerpo) — Google Fonts | Jerarquía visual y legibilidad |
| Herramientas | pnpm · nodemon | Gestor de paquetes rápido · recarga automática en desarrollo |

---

## Arquitectura

- **Estilo:** Cliente-Servidor (aplicación multipágina + API REST)
- **Patrón:** MVC (rutas → controladores → servicios → datos)
- **Comunicación:** HTTP · respuestas en JSON · Fetch API

```
Navegador (frontend/)  →  index · clientes · ventas · productos + public/js/*.js
        ↕  HTTP · JSON · Fetch API  (/api/*)
Servidor (backend/)    →  routes/ → controllers/ → services/
        ↕  lectura/escritura
Persistencia           →  backend/data/{productos,clientes,ventas}.json
```

El mismo servidor Express sirve el frontend estático y la API en `http://localhost:3000`.
Detalle completo en [`docs/arquitectura.md`](docs/arquitectura.md).

---

## Funcionalidades principales

- **Productos:** catálogo (cards) + gestión CRUD (tabla), búsqueda, filtro por categoría y ajuste de stock.
- **Clientes:** registro con cédula única y búsqueda por cédula.
- **Ventas:** carrito con varios productos, control de stock por ítem, total automático y descuento de inventario.
- **Dashboard:** indicadores del día (ventas, ingresos, stock total, clientes).
- **UX:** validación en frontend y backend, notificaciones (toasts) y estados de cargando / vacío / error / éxito.

---

## Cómo ejecutar localmente

**Requisitos:** Node.js v20+ y [pnpm](https://pnpm.io/installation).

```bash
# 1. Clonar el repositorio
git clone https://github.com/Pedrito2626/SalesFlow.git
cd SalesFlow

# 2. Instalar dependencias del backend
cd backend
pnpm install

# 3. Iniciar el servidor (sirve API + frontend)
pnpm dev        # desarrollo, con recarga automática (nodemon)
# o
pnpm start      # producción

# 4. Abrir en el navegador
#    http://localhost:3000
```

> Variables de entorno: copia `backend/.env.example` a `backend/.env` si deseas cambiar el puerto (`PORT`). No es obligatorio; por defecto usa el 3000.

---

## Endpoints principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/productos` · `/api/productos/search?q=` · `/api/productos/:id` | Listar / buscar / consultar |
| POST · PUT · PATCH · DELETE | `/api/productos` · `/api/productos/:id` · `/api/productos/:id/stock` | Crear / actualizar / ajustar stock / eliminar |
| GET · POST | `/api/clientes` · `/api/clientes/:cedula` | Listar / buscar por cédula / registrar |
| GET · POST | `/api/ventas` · `/api/ventas/:id` | Listar / consultar / registrar venta |
| GET | `/api/stats` | Indicadores del día |

Tabla detallada con entradas y respuestas en [`docs/SRS.md`](docs/SRS.md).

---

## Documentación

- [`docs/SRS.md`](docs/SRS.md) — requisitos (RF/RNF), reglas de negocio, modelo de datos, trazabilidad.
- [`docs/arquitectura.md`](docs/arquitectura.md) — decisiones técnicas y justificación del stack.
- [`docs/analisis.md`](docs/analisis.md) — análisis del sistema (actores, datos, restricciones).
- [`docs/diagramas/diagramas.md`](docs/diagramas/diagramas.md) — diagramas D01–D08.
- [`docs/mockups/mockups.md`](docs/mockups/mockups.md) — prototipo y relación mockup↔código.
- [`docs/uso-ia.md`](docs/uso-ia.md) — registro de uso de IA.

---

## Estructura del proyecto

```
SalesFlow/
├── backend/
│   ├── src/
│   │   ├── index.js · app.js
│   │   ├── routes/        # endpoints por recurso
│   │   ├── controllers/   # lógica de negocio y validación
│   │   ├── services/      # lectura/escritura de los JSON
│   │   └── middleware/    # manejo centralizado de errores
│   ├── data/              # productos.json · clientes.json · ventas.json
│   └── package.json
├── frontend/
│   ├── index.html · clientes.html · ventas.html · productos.html
│   └── public/
│       ├── css/styles.css
│       └── js/  api.js · ui.js · app.js · dashboard.js · productos.js · clientes.js · ventas.js
├── docs/
├── .gitignore · .env.example
└── README.md
```
