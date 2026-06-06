# Arquitectura del Sistema — SalesFlow

**Proyecto:** SalesFlow · Sistema de gestión de ventas e inventario para licorera  
**Curso:** IF2003 Programación Web · Grupo 603  
**Versión:** 2.0 — Full-stack implementado (frontend + backend + persistencia)  
**Autores:** David Santiago Valencia · Esteban Ramírez · Santiago Vélez

---

## 1. Estilo arquitectónico general

**Estilo adoptado:** Cliente-Servidor con API REST (aplicación multipágina + API).

El sistema está implementado como una **MPA (Multi-Page Application)** de cuatro vistas HTML que consumen una **API REST** servida por Node.js + Express. El mismo servidor Express sirve los archivos estáticos del frontend y expone los endpoints `/api/*`, todo en `http://localhost:3000` (mismo origen).

- El navegador (cliente) envía peticiones HTTP a `/api/*` con `fetch()`.
- El servidor procesa, **lee/escribe archivos JSON** y devuelve JSON.
- El frontend actualiza el DOM con los datos recibidos sin recargar la página completa.

| Estilo | Aplica en SalesFlow | Razón |
|---|---|---|
| MPA | ✅ Sí | Cuatro HTML independientes, navegación nativa del navegador |
| Cliente-Servidor REST | ✅ Sí (implementado) | Frontend llama a `/api/*` con `fetch()` en JSON |
| SPA | ❌ No | No hay router de cliente ni hidratación dinámica |
| Monolito | Parcial | Un solo proceso Express sirve frontend estático + API, pero con capas internas separadas |

---

## 2. Patrón arquitectónico principal

**Patrón adoptado:** MVC — Model-View-Controller, aplicado en el backend con Node.js + Express.js.

El patrón MVC divide el sistema en tres responsabilidades que mapean directamente a la estructura de carpetas:

| Capa | Archivos | Responsabilidad |
|---|---|---|
| **Model** (servicios de datos) | `backend/src/services/productos.js` · `clientes.js` · `ventas.js` | Lectura/escritura de los archivos JSON (`leer()` / `guardar()`) |
| **View** | `frontend/index.html` · `clientes.html` · `ventas.html` · `productos.html` + `frontend/public/` | Presentación, formularios, interacciones DOM |
| **Controller** | `backend/src/controllers/productos.js` · `clientes.js` · `ventas.js` · `stats.js` | Lógica de negocio, validaciones, orquestación entre Model y View |

> Nota: la capa de acceso a datos se nombra `services/` (en lugar de `models/`) porque su responsabilidad es leer y escribir los archivos JSON, no mapear tablas de una base de datos.

### Por qué MVC y no otras alternativas

- **Clean Architecture / Hexagonal:** agregan capas (ports, adapters, use-cases) innecesarias para un sistema CRUD de esta escala y un equipo de tres personas.
- **MVVM:** requiere un framework reactivo (Vue, Angular) que no está en el stack elegido.
- **N-Layer genérico:** MVC es su implementación concreta más simple; Express lo soporta de forma nativa con `Router`.

### Mapeo a rutas REST

Las rutas de Express actúan como punto de entrada y delegan al controlador correspondiente:

```
routes/productos.js  →  productosController.obtenerTodos / buscar / obtenerPorId / crear / actualizar / actualizarStock / eliminar
routes/clientes.js   →  clientesController.obtenerTodos / obtenerPorCedula / crear
routes/ventas.js     →  ventasController.obtenerTodos / obtenerPorId / crear
routes/stats.js      →  statsController.obtener
```

---

## 3. Separación de responsabilidades

### 3.1 Frontend (Vista)

El frontend es responsable única y exclusivamente de la presentación y la experiencia del usuario. **No contiene lógica de negocio ni acceso a datos.**

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Dashboard con estadísticas del día (ventas, ingresos, stock, clientes) |
| `clientes.html` | Formulario de registro y búsqueda de cliente por cédula |
| `ventas.html` | Formulario POS con carrito de compra; cálculo de total en tiempo real |
| `productos.html` | Catálogo con búsqueda y filtros (modo Ver); tabla CRUD de inventario (modo Gestionar) |
| `public/css/styles.css` | Diseño visual, tipografía (Outfit + DM Sans), sistema responsive, tokens de color |
| `public/js/api.js` | Capa de consumo de la API: wrapper `fetch` y funciones por recurso |
| `public/js/ui.js` | Toasts (notificaciones), formato COP y estados (cargando, vacío, error) |
| `public/js/app.js` | Navegación: toggle móvil y enlace activo |
| `public/js/dashboard.js` · `productos.js` · `clientes.js` · `ventas.js` | Lógica de cada vista: render, eventos, llamadas a la API |

### 3.2 Backend — Controladores y Rutas

El backend concentra toda la lógica de negocio y actúa como intermediario entre el frontend y la persistencia. **No genera HTML.**

- **`routes/`:** define los endpoints REST y delega en el controlador. No contiene lógica propia.
- **`controllers/clientes.js`:** valida cédula (solo dígitos, 6–12 caracteres), verifica unicidad antes de insertar, crea o busca clientes por cédula.
- **`controllers/productos.js`:** valida precio > 0, stock ≥ 0, nombre ≥ 3 caracteres, categoría dentro del enum; ejecuta el CRUD del catálogo (incluido `PATCH` de stock y búsqueda).
- **`controllers/ventas.js`:** verifica que el carrito tenga al menos un producto, comprueba el stock disponible por ítem, calcula el total, persiste la venta con su detalle y descuenta el stock.
- **`controllers/stats.js`:** agrega los indicadores del día a partir de los tres JSON.
- **`middleware/errorHandler.js`:** manejo centralizado de errores no controlados (respuesta `500`).

### 3.3 Mecanismo de persistencia (Modelo)

La capa de servicios es la **única que conoce cómo se guardan los datos** (archivos JSON). Si en el futuro se migra a una base de datos (MySQL, PostgreSQL) o a un ORM, solo se modifican estos archivos; controladores y vistas no cambian.

- **`services/productos.js`**, **`clientes.js`**, **`ventas.js`:** cada uno expone `leer()` (lee y parsea su JSON con `fs.readFileSync`) y `guardar(datos)` (serializa y escribe con `fs.writeFileSync`).
- Los datos viven en `backend/data/productos.json`, `clientes.json` y `ventas.json`.
- La relación venta→detalle→producto se modela con un arreglo `detalle[]` **embebido** dentro de cada venta (`{ producto_id, cantidad, precio_unitario }`).

### Tabla resumen de permisos por capa

| Módulo | ¿Lee datos? | ¿Escribe datos? | ¿Conoce el DOM? | ¿Contiene lógica de negocio? |
|---|:---:|:---:|:---:|:---:|
| View (HTML/JS) | No | No | Sí | No |
| Routes (Express) | No | No | No | No |
| Controller | No (delega) | No (delega) | No | **Sí** |
| Service (Model) | **Sí** | **Sí** | No | No |

---

## 4. Flujo de datos

### 4.1 Registrar una venta (flujo completo)

1. El usuario llena cédula y nombre del cliente en `ventas.html`.
2. Selecciona un producto del `<select>` (poblado desde `GET /api/productos`) y una cantidad; hace clic en **"+ Agregar al resumen"**.
3. `ventas.js` valida el stock disponible, agrega el ítem al carrito (`cart`) y llama a `updateSummary()`, que recalcula el total y actualiza el DOM en tiempo real.
4. El usuario repite los pasos 2–3 para cada producto deseado.
5. Hace clic en **"Registrar venta"**. `ventas.js` intercepta el `submit`, valida los datos del cliente (HTML5) y verifica que el carrito no esté vacío; si lo está, muestra un toast de error y detiene el flujo.
6. `fetch()` envía `POST /api/ventas` con `{ cedula, nombre_cliente, items[], notas }`.
7. Express llama a `ventasController.crear(req.body)`.
8. El controlador valida cliente y carrito; itera por cada ítem comprobando existencia y stock; si algún stock es insuficiente responde `400` con el producto afectado.
9. Si todo es válido, descuenta el stock de cada producto (`servicios.guardar`), calcula `total` y `precio_unitario` por ítem, y persiste la venta con su `detalle[]` en `ventas.json`.
10. El controlador responde `201 Created` con la venta creada.
11. `ventas.js` recibe la respuesta, muestra un toast con el total, limpia el carrito y recarga el `<select>` para reflejar el stock actualizado.

### 4.2 Diagrama textual del recorrido

```
Usuario (navegador)
  │── acción (clic, submit) ──────────────────────────────►
                                            ventas.js (DOM, carrito)
                                              │── fetch(POST /api/ventas, JSON) ──►
                                                              Express Router
                                                                │── req.body ──►
                                                                    ventasController
                                                                      │── valida stock por ítem ──► services.productos.leer()  (productos.json)
                                                                      │── descuenta stock + crea venta ──► services.guardar()  (productos.json + ventas.json)
                                                                      │◄── 201 { venta } ──────────────────────────────────────────
                                              │◄── fetch().then() ───────────────
  │◄── toast + recarga stock ───────────────
Usuario (ve confirmación visual)
```

### 4.3 Flujo de búsqueda de cliente por cédula

```
Usuario escribe cédula → clic "Buscar"
  → fetch(GET /api/clientes/:cedula)
    → clientesController.obtenerPorCedula()
      → services.clientes.leer()  →  busca por cédula en clientes.json
      ← cliente encontrado  →  200 OK { cliente }   → renderiza tarjeta con datos
      ← no encontrado       →  404 Not Found          → muestra "Sin resultados"
```

---

## 5. Decisiones técnicas clave

### 5.1 Stack tecnológico

| Capa | Tecnología elegida | Alternativas evaluadas | Razón de la elección |
|---|---|---|---|
| Frontend | HTML5 + CSS3 + JS Vanilla | React, Vue, Angular | Sin dependencias de build; aprendizaje directo del DOM; suficiente para las 4 vistas del alcance |
| Tipografía | Outfit + DM Sans (Google Fonts) | Inter, Roboto, fuentes del sistema | Combinación moderna y legible; carga libre vía CDN sin build step |
| Backend | Node.js + Express.js | Django, Laravel, Spring | JavaScript compartido entre capas; ecosistema npm; coherencia con lo visto en clase |
| Persistencia | **Archivo JSON** gestionado por el backend | MySQL, PostgreSQL, MongoDB | Persistencia real sin servidor de BD que instalar; simple de demostrar; permitida por la rúbrica |
| Gestor de paquetes | pnpm | npm, yarn | Instalación rápida y eficiente en disco |
| Despliegue | Local (`pnpm dev`) | Render, Railway, Vercel | Alcance académico: ejecución local documentada y reproducible |

### 5.2 Estructura de carpetas

La estructura separa frontend y backend, y dentro del backend refleja el patrón MVC:

```
SalesFlow/
├── backend/
│   ├── src/
│   │   ├── index.js               ← punto de entrada (arranca el servidor)
│   │   ├── app.js                 ← Express: middleware, estáticos, rutas, 404, errores
│   │   ├── routes/                ← Controller: endpoints (productos, clientes, ventas, stats)
│   │   ├── controllers/           ← Controller: lógica de negocio y validación
│   │   ├── services/              ← Model: lectura/escritura de los JSON
│   │   └── middleware/            ← errorHandler (manejo centralizado de errores)
│   ├── data/                      ← persistencia: productos.json · clientes.json · ventas.json
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html · clientes.html · ventas.html · productos.html   ← View
│   └── public/
│       ├── css/styles.css
│       └── js/  api.js · ui.js · app.js · dashboard.js · productos.js · clientes.js · ventas.js
├── docs/                          ← SRS, arquitectura, análisis, diagramas, mockups, uso-IA
├── README.md
└── .gitignore
```

### 5.3 Manejo de errores

| Capa | Tipo de error | Mecanismo |
|---|---|---|
| Frontend (HTML5) | Campos inválidos | Validación nativa con `required`, `pattern`, `minlength`, `min`; mensajes `.field__error` |
| Frontend (JS) | Carrito vacío / stock insuficiente al armar la venta | Guard explícito en `ventas.js` + toast de error |
| Backend — Controller | Datos de entrada inválidos | Validación antes de tocar el servicio; respuesta `400 Bad Request` con mensaje descriptivo |
| Backend — Controller | Stock insuficiente / carrito vacío | Verificación previa; respuesta `400` con el producto afectado |
| Backend — Controller | Recurso inexistente | Respuesta `404 Not Found` (producto, cliente o venta) |
| Backend — Express | Ruta de API no encontrada | Middleware `404` para `/api/*` |
| Backend — Express | Error interno no controlado | `middleware/errorHandler.js` global `(err, req, res, next)` → `500 Internal Server Error` |

### 5.4 Validaciones

Las validaciones se aplican en **dos capas** para garantizar integridad independientemente del cliente:

**Capa frontend — primera línea de defensa:**

| Campo | Regla HTML5 | Mensaje de error |
|---|---|---|
| Cédula | `pattern="[0-9]{6,12}"` | Solo dígitos, 6–12 caracteres |
| Nombre (cliente/producto) | `minlength="3"` | Mínimo 3 caracteres |
| Precio | `min="1"` `step="100"` | Mayor a $0, múltiplos de 100 COP |
| Stock | `min="0"` | No puede ser negativo |
| Notas / descripción | `maxlength="500"` | Máximo 500 caracteres |
| Cantidad en venta | `min="1"` | Mayor a 0 |

**Capa backend — autoritativa (no bypasseable):**

- Las mismas reglas se replican en los controladores para rechazar peticiones directas a la API (Postman, curl, scripts).
- Cédula única verificada por consulta previa en `controllers/clientes.js` antes de insertar (`400` si ya existe).
- Categoría validada contra el enum permitido (aguardiente, cerveza, vino, ron, whisky, otros).
- Stock suficiente verificado en `controllers/ventas.js` antes de descontar inventario.

### 5.5 Despliegue

| Entorno | Frontend | Backend | Persistencia |
|---|---|---|---|
| Local (desarrollo) | servido por Express en `http://localhost:3000` | `pnpm dev` (nodemon) / `pnpm start` | archivos JSON en `backend/data/` |

El backend sirve el frontend estático y la API en el mismo puerto, evitando problemas de CORS en la demo.
Única variable de entorno (`backend/.env.example`):

```env
PORT=3000
NODE_ENV=development
```

> Despliegue público (Render/Railway) queda como mejora futura; no es parte del alcance de esta entrega.

---

## 6. Trade-offs

### 6.1 HTML/CSS/JS Vanilla (sin framework frontend)

| | Detalle |
|---|---|
| ✅ Ventaja | Cero dependencias de build; control total del DOM, eventos y `fetch`. |
| ✅ Ventaja | Aprendizaje directo de los fundamentos sin abstracciones intermedias; fácil de defender por todo el equipo. |
| ⚠️ Desventaja | Escalabilidad limitada: agregar páginas requiere duplicar la barra de navegación en cada HTML. |
| ⚠️ Desventaja | El estado del carrito (`cart`) vive en memoria y se pierde al recargar. |
| 🔺 Riesgo | Si el proyecto crece a más de 6 vistas, mantener HTML separados sin componentes se vuelve difícil. |
| 🛠 Mitigación | Migrar a React o Vue cuando el número de vistas supere las 6 o se requiera estado compartido. |

### 6.2 MVC con Node.js + Express

| | Detalle |
|---|---|
| ✅ Ventaja | Separación clara de capas: cambiar la persistencia solo afecta `services/`. |
| ✅ Ventaja | Express es minimalista; el equipo controla la estructura sin magia de framework. |
| ⚠️ Desventaja | Sin autenticación en esta entrega: cualquier petición a la API es aceptada. |
| 🔺 Riesgo | API abierta si se expusiera en internet. |
| 🛠 Mitigación | Mantener CORS controlado; agregar JWT con roles Vendedor/Administrador en una fase posterior. |

### 6.3 Archivo JSON como mecanismo de persistencia

| | Detalle |
|---|---|
| ✅ Ventaja | Cero configuración: no hay servidor de base de datos que instalar; ideal para la demo. |
| ✅ Ventaja | Los datos son legibles e inspeccionables directamente en `backend/data/`. |
| ⚠️ Desventaja | Sin transacciones ni integridad referencial nativa; la consistencia depende de la lógica del controlador. |
| ⚠️ Desventaja | **Concurrencia:** escrituras simultáneas podrían corromper o sobrescribir datos (se asume un usuario a la vez). |
| 🔺 Riesgo | Escalabilidad limitada con grandes volúmenes (se lee/escribe el archivo completo en cada operación). |
| 🛠 Mitigación | La capa `services/` aísla la persistencia: migrar a SQLite/MySQL/PostgreSQL solo requiere reescribir esos archivos. |

### 6.4 Ausencia de autenticación

| | Detalle |
|---|---|
| ✅ Ventaja | Simplifica el alcance: no se necesita manejo de sesiones ni tokens para demostrar el flujo de negocio. |
| ⚠️ Desventaja | Cualquier usuario puede registrar ventas, modificar productos o eliminar registros. |
| 🛠 Mitigación | Agregar JWT con roles (Vendedor/Administrador) en una fase posterior. |

### 6.5 Resumen ejecutivo

| Decisión | Beneficio principal | Costo principal | Riesgo crítico |
|---|---|---|---|
| JS Vanilla | Simplicidad y velocidad | Escalabilidad limitada | Duplicación de código al crecer |
| MVC con Express | Separación clara de capas | Sin autenticación en esta entrega | API abierta si se despliega |
| Persistencia JSON | Cero configuración, fácil demo | Sin ACID ni control de concurrencia | Corrupción ante escrituras simultáneas |
| Sin autenticación | Alcance más rápido | Seguridad básica | API abierta si se expone |

---

*SalesFlow · IF2003 Programación Web · Grupo 603*
