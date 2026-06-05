# Arquitectura del Sistema — SalesFlow

**Proyecto:** SalesFlow · Sistema de gestión de ventas e inventario para licorera  
**Curso:** IF2003 Programación Web · Grupo 603  
**Versión:** 1.0 — Primer avance (frontend implementado)  
**Autores:** David Santiago Valencia · Esteban Ramírez · Santiago Vélez

---

## 1. Estilo arquitectónico general

**Estilo adoptado:** Multi-Page Application (MPA) con transición planificada a arquitectura Cliente-Servidor REST.

El sistema opera actualmente como una MPA de frontend puro: cuatro páginas HTML independientes sin servidor de renderizado. Cada página es una vista autónoma enlazada mediante navegación nativa del navegador. No existe enrutamiento en el cliente ni virtual DOM.

Al incorporar el backend (Node.js + Express), el sistema adoptará el estilo **Cliente-Servidor con API REST**:

- El navegador (cliente) envía peticiones HTTP a `/api/*`.
- El servidor procesa, consulta MySQL y devuelve JSON.
- El frontend actualiza el DOM con los datos recibidos sin recargar la página completa.

| Estilo | Aplica en SalesFlow | Razón |
|---|---|---|
| MPA |  Estado actual | Cuatro HTML independientes, navegación nativa del navegador |
| Cliente-Servidor REST |  Planificado | Frontend llama a `/api/*` con `fetch()` en JSON |
| SPA |  No | No hay router de cliente ni hidratación dinámica |
| Monolito |  No | Frontend y backend son capas separadas en distintos servidores |

---

## 2. Patrón arquitectónico principal

**Patrón adoptado:** MVC — Model-View-Controller, aplicado en el backend planificado con Node.js + Express.js.

El patrón MVC divide el sistema en tres responsabilidades que mapean directamente a la estructura de carpetas del proyecto:

| Capa | Archivos | Responsabilidad |
|---|---|---|
| **Model** | `models/clienteModel.js` `models/productoModel.js` `models/ventaModel.js` `models/db.js` | Acceso a MySQL, consultas SQL, pool de conexiones |
| **View** | `index.html` `clientes.html` `ventas.html` `productos.html` `public/css/styles.css` `public/js/app.js` | Presentación al usuario, formularios, interacciones DOM |
| **Controller** | `controllers/clienteController.js` `controllers/productoController.js` `controllers/ventaController.js` | Lógica de negocio, validaciones, orquestación entre Model y View |

### Por qué MVC y no otras alternativas

- **Clean Architecture / Hexagonal:** agregan capas (ports, adapters, use-cases) innecesarias para un sistema CRUD de esta escala y equipo de tres personas.
- **MVVM:** requiere un framework reactivo (Vue, Angular) que no está en el stack elegido.
- **N-Layer genérico:** MVC es su implementación concreta más simple; Express lo soporta de forma nativa con `Router`.

### Mapeo a rutas REST

Las rutas de Express actúan como punto de entrada y delegan al controlador correspondiente:

```
routes/clientes.js   →  clienteController.registrar / buscarPorCedula
routes/productos.js  →  productoController.crear / listar / actualizar / eliminar
routes/ventas.js     →  ventaController.registrar
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
| `public/js/app.js` | Nav mobile toggle, lógica del carrito (`cartItems`, `updateSummary`), búsqueda en tiempo real, filtro por categoría |

### 3.2 Backend — Controladores y Rutas

El backend concentra toda la lógica de negocio y actúa como intermediario entre el frontend y la base de datos. **No genera HTML.**

- **`routes/`:** define los endpoints REST y delega en el controlador. No contiene lógica propia.
- **`clienteController`:** valida cédula (solo dígitos, 6–12 caracteres), verifica unicidad antes de insertar, crea o busca clientes.
- **`productoController`:** valida precio > 0, stock ≥ 0, nombre ≥ 3 caracteres; ejecuta operaciones CRUD sobre el catálogo.
- **`ventaController`:** verifica que el carrito tenga al menos un producto, comprueba stock disponible por ítem, persiste la venta y descuenta el stock en una transacción atómica.

### 3.3 Mecanismo de persistencia (Modelo)

La capa de modelo es la **única que conoce MySQL**. Si se migra a PostgreSQL o a un ORM como Sequelize, solo se modifican los archivos de esta capa.

- **`db.js`:** crea el pool de conexiones con `mysql2`. Expone una función `query()` reutilizable por todos los modelos.
- **`clienteModel`:** `INSERT` y `SELECT` por cédula sobre la tabla `clientes`.
- **`productoModel`:** `INSERT`, `SELECT`, `UPDATE` (incluyendo `PATCH` de stock), `DELETE` sobre `productos`.
- **`ventaModel`:** `INSERT` en `ventas`, `INSERT` en `detalle_venta` por cada ítem, `UPDATE` de stock — todo dentro de una transacción SQL.

### Tabla resumen de permisos por capa

| Módulo | ¿Puede leer BD? | ¿Puede escribir BD? | ¿Conoce el DOM? | ¿Contiene lógica de negocio? |
|---|:---:|:---:|:---:|:---:|
| View (HTML/JS) | No | No | Sí | No |
| Routes (Express) | No | No | No | No |
| Controller | No (delega) | No (delega) | No | **Sí** |
| Model | **Sí** | **Sí** | No | No |

---

## 4. Flujo de datos

### 4.1 Registrar una venta (flujo completo)

1. El usuario llena cédula y nombre del cliente en `ventas.html`.
2. Selecciona un producto del `<select>` y una cantidad; hace clic en **"+ Agregar al resumen"**.
3. `app.js` ejecuta `cartItems.push({id, name, price, qty})` y llama a `updateSummary()`, que recalcula el total y actualiza el DOM en tiempo real.
4. El usuario repite los pasos 2–3 para cada producto deseado.
5. Hace clic en **"Registrar venta"**. `app.js` intercepta el `submit` y verifica `cartItems.length > 0`; si el carrito está vacío muestra un `alert` y detiene el flujo.
6. `fetch()` envía `POST /api/ventas` con el objeto `{ cliente, items[] }`.
7. Express llama a `ventaController.registrar(req.body)`.
8. El controlador itera por cada ítem llamando a `productoModel.verificarStock()`; si algún stock es insuficiente responde `422` con el producto afectado.
9. Si todo el stock es válido, llama a `ventaModel.crearVenta()`, que ejecuta tres sentencias SQL dentro de una transacción: `INSERT ventas`, `INSERT detalle_venta` (por ítem), `UPDATE productos SET stock = stock - cantidad`.
10. El modelo devuelve el `ventaId`; el controlador responde `201 Created { id }`.
11. `app.js` recibe la respuesta, muestra el alert de confirmación, limpia `cartItems` y ejecuta `ventaForm.reset()`.

### 4.2 Diagrama textual del recorrido

```
Usuario (navegador)
  │── acción (clic, submit) ──────────────────────────────►
                                            app.js (DOM, cart logic)
                                              │── fetch(POST /api/ventas, JSON) ──►
                                                              Express Router
                                                                │── req.body ──►
                                                                    ventaController
                                                                      │── productoModel.verificarStock() ──► MySQL: SELECT stock
                                                                      │── ventaModel.crearVenta()         ──► MySQL: INSERT + UPDATE (transacción)
                                                                      │◄── 201 { id } ──────────────────────────────────────────────
                                              │◄── fetch().then() ───────────────
  │◄── actualiza DOM / alert ───────────────
Usuario (ve confirmación visual)
```

### 4.3 Flujo de búsqueda de cliente por cédula

```
Usuario escribe cédula → clic "Buscar"
  → fetch(GET /api/clientes/:cedula)
    → clienteController.buscarPorCedula()
      → clienteModel.findByCedula()
        → MySQL: SELECT * FROM clientes WHERE cedula = ?
      ← fila del cliente  →  200 OK { cliente }   → renderiza tarjeta con datos
      ← vacío             →  404 Not Found          → muestra "Sin resultados"
```

---

## 5. Decisiones técnicas clave

### 5.1 Stack tecnológico

| Capa | Tecnología elegida | Alternativas evaluadas | Razón de la elección |
|---|---|---|---|
| Frontend | HTML5 + CSS3 + JS Vanilla | React, Vue, Angular | Sin dependencias de build; aprendizaje directo del DOM; suficiente para las 4 vistas del MVP |
| Tipografía | Outfit + DM Sans (Google Fonts) | Inter, Roboto, fuentes del sistema | Combinación moderna y legible; carga libre vía CDN sin build step |
| Backend | Node.js + Express.js | Django, Laravel, Spring | JavaScript compartido entre capas; ecosistema npm; curva de aprendizaje baja para el equipo |
| Base de datos | MySQL 8.x | PostgreSQL, MongoDB, archivo JSON | Relacional y tipado fuerte; ideal para las relaciones venta–detalle–producto; amplio soporte en Railway |
| Hosting frontend | GitHub Pages | Netlify, Vercel | Gratuito, integrado al repositorio, sin configuración adicional |
| Hosting backend | Railway | Heroku, Render, Fly.io | Soporta Node.js y MySQL en el mismo proveedor; tier gratuito para MVPs |

### 5.2 Estructura de carpetas

La estructura refleja directamente el patrón MVC:

```
SalesFlow/
├── index.html              ← View: dashboard principal
├── clientes.html           ← View: registro y búsqueda de clientes
├── ventas.html             ← View: formulario POS + carrito
├── productos.html          ← View: catálogo + inventario CRUD (toggle)
├── public/
│   ├── css/styles.css      ← View: estilos globales (Outfit · DM Sans)
│   └── js/app.js           ← View: lógica del cliente (carrito, búsqueda, nav)
├── routes/                 ← Controller: puntos de entrada HTTP (Express Router)
│   ├── clientes.js
│   ├── productos.js
│   └── ventas.js
├── controllers/            ← Controller: lógica de negocio
│   ├── clienteController.js
│   ├── productoController.js
│   └── ventaController.js
├── models/                 ← Model: acceso a datos MySQL
│   ├── clienteModel.js
│   ├── productoModel.js
│   ├── ventaModel.js
│   └── db.js
├── database/               ← Scripts DDL y seed
│   ├── schema.sql
│   └── seed.sql
├── docs/                   ← Documentación del proyecto
│   ├── SRS.md
│   ├── arquitectura.md     ← este archivo
│   ├── analisis.md
│   └── diagramas/
├── README.md
├── .gitignore
└── .env.example
```

### 5.3 Manejo de errores

| Capa | Tipo de error | Mecanismo |
|---|---|---|
| Frontend (HTML5) | Campos inválidos | Validación nativa con `required`, `pattern`, `minlength`, `min`; clases `.field__error` visibles al intentar el submit |
| Frontend (JS) | Carrito vacío al registrar venta | Guard explícito: `if (cartItems.length === 0) { alert(...); return; }` |
| Backend — Controller | Datos de entrada inválidos | Validación antes de tocar el modelo; respuesta `400 Bad Request` con mensaje descriptivo |
| Backend — Controller | Stock insuficiente | Consulta previa al modelo; respuesta `422 Unprocessable Entity` con el producto afectado |
| Backend — Model | Fallo en transacción SQL | `try/catch` + `ROLLBACK` automático; error propagado al controlador |
| Backend — Express | Ruta no encontrada | Middleware 404 al final del stack de middlewares |
| Backend — Express | Error interno no controlado | Error handler global `(err, req, res, next)` con respuesta `500 Internal Server Error` |

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
- Cédula única verificada por `UNIQUE KEY` en MySQL y por consulta previa en `clienteController` antes de insertar.
- Stock suficiente verificado en `ventaController` antes de iniciar la transacción SQL.

### 5.5 Despliegue

| Entorno | Frontend | Backend | Base de datos |
|---|---|---|---|
| Local (desarrollo) | `python -m http.server 3000` | `node server.js` (puerto 3000) | MySQL local (XAMPP / Docker) |
| Producción | GitHub Pages (CDN global) | Railway (contenedor Node.js) | Railway MySQL add-on |

Variables de entorno requeridas en `.env` (nunca se suben al repositorio):

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=salesflow_user
DB_PASS=<secreto>
DB_NAME=salesflow
PORT=3000
NODE_ENV=production
```

---

## 6. Trade-offs

### 6.1 HTML/CSS/JS Vanilla (sin framework frontend)

| | Detalle |
|---|---|
|  Ventaja | Cero dependencias de build; se abre directamente en el navegador con un servidor estático. |
|  Ventaja | Aprendizaje directo de los fundamentos del DOM, eventos y `fetch` API sin abstracciones intermedias. |
|  Desventaja | Escalabilidad limitada: agregar nuevas páginas requiere duplicar la barra de navegación en cada HTML. |
|  Desventaja | Estado global en memoria (`cartItems`) se pierde al recargar; sin mecanismo de persistencia local. |
|  Riesgo | Si el proyecto crece a más de 6 vistas, mantener archivos HTML separados sin componentes reutilizables se vuelve inmanejable. |
|  Mitigación | Migrar a React o Vue cuando el número de vistas supere las 6 o cuando se requiera estado compartido entre módulos. |

### 6.2 MVC con Node.js + Express

| | Detalle |
|---|---|
|  Ventaja | Separación clara de capas: cambiar la base de datos solo afecta la carpeta `models/`. |
|  Ventaja | Express es minimalista; el equipo tiene control total de la estructura sin magia de framework. |
|  Desventaja | Sin ORM: las consultas SQL están escritas a mano, lo que aumenta el riesgo de errores tipográficos en nombres de columnas. |
|  Desventaja | Sin autenticación en este avance: cualquier petición a la API es aceptada sin verificar identidad. |
|  Riesgo | SQL Injection si los parámetros del usuario se interpolan en strings SQL sin prepared statements. |
|  Mitigación | Usar siempre `mysql2` con consultas parametrizadas (`?, ?`). Agregar autenticación JWT con roles Vendedor/Administrador en el segundo avance. |

### 6.3 MySQL como mecanismo de persistencia

| | Detalle |
|---|---|
|  Ventaja | Integridad referencial nativa: `FOREIGN KEY` entre `ventas`, `detalle_venta` y `productos` evita registros huérfanos. |
|  Ventaja | ACID garantizado: la transacción de venta (`INSERT` + `UPDATE`) nunca queda a medias ante un fallo. |
|  Desventaja | Requiere configuración adicional respecto a un archivo JSON local; añade latencia de red en producción. |
|  Desventaja | Schema rígido: agregar un campo a una tabla requiere una migración SQL explícita. |
|  Riesgo | Railway MySQL en tier gratuito tiene límite de almacenamiento (~1 GB) y puede suspenderse por inactividad. |
|  Mitigación | Mantener `database/seed.sql` para restaurar el entorno rápidamente. Planificar migración a PlanetScale o Railway paid si el volumen crece. |

### 6.4 Ausencia de autenticación en el primer avance

| | Detalle |
|---|---|
|  Ventaja | Simplifica el MVP: no se necesita manejo de sesiones ni tokens para demostrar el flujo de negocio. |
|  Desventaja | Cualquier usuario puede registrar ventas, modificar productos o eliminar registros sin restricción. |
|  Riesgo | Si el prototipo se expone en internet (GitHub Pages + Railway), los endpoints de la API quedan completamente abiertos. |
|  Mitigación | Configurar CORS en Express para aceptar solo el dominio del frontend. Agregar JWT con roles en el segundo avance. |

### 6.5 Resumen ejecutivo

| Decisión | Beneficio principal | Costo principal | Riesgo crítico |
|---|---|---|---|
| JS Vanilla | Simplicidad y velocidad de prototipado | Escalabilidad limitada | Duplicación de código al crecer |
| MVC con Express | Separación clara de capas | SQL manual sin ORM | Inyección SQL sin prepared statements |
| MySQL | Integridad y transacciones ACID | Configuración y latencia adicional | Límites del tier gratuito en Railway |
| Sin autenticación | MVP más rápido | Seguridad inexistente | API abierta si se despliega en internet |
| GitHub Pages | Despliegue instantáneo y gratuito | Solo archivos estáticos | No soportará el backend Node.js |

---

*SalesFlow · IF2003 Programación Web · Grupo 603*
