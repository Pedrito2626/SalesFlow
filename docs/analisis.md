# Análisis del sistema — SalesFlow

**Proyecto:** SalesFlow · Sistema de gestión de ventas e inventario para licorera  
**Curso:** IF2003 Programación Web · Grupo 603  
**Autor:** [Tu nombre completo]

---

## Las 4 preguntas del análisis de sistema

### 1. ¿Quién usa el sistema?

El sistema tiene dos tipos de usuarios:

| Rol | Descripción | Acciones principales |
|-----|-------------|----------------------|
| **Vendedor** | Empleado de mostrador de la licorera | Registra clientes nuevos, consulta clientes por cédula, crea ventas seleccionando productos del catálogo con sus cantidades |
| **Administrador** | Encargado del negocio | Agrega, edita y elimina productos del catálogo, actualiza stock, consulta el estado del inventario |

No hay roles intermedios en este avance. La diferenciación entre roles se refleja en el modo de vista de `productos.html`: el vendedor usa el modo **"Ver catálogo"** (tarjetas) y el administrador usa el modo **"Gestionar"** (tabla CRUD con formulario).

---

### 2. ¿Qué necesita hacer?

#### Módulo de clientes — `clientes.html`
- Registrar un cliente nuevo con nombre, cédula, teléfono y correo electrónico
- Buscar un cliente existente por número de cédula y mostrar sus datos (nombre, cédula, teléfono, correo)

#### Módulo de ventas — `ventas.html`
- Ingresar la cédula y nombre del cliente titular de la venta
- Seleccionar productos del catálogo (Aguardiente Antioqueño, Poker Lata, Gato Negro Cabernet, Ron Viejo de Caldas, Old Parr 12 años, Club Colombia Negra, Champaña Chandon, Nectar Rojo) y especificar cantidades
- Calcular el total de la venta en tiempo real a medida que se agregan productos al resumen
- Registrar la venta con notas adicionales opcionales

#### Módulo de catálogo — `productos.html` (modo "Ver catálogo")
- Consultar todos los productos disponibles en formato de tarjetas visuales con iniciales de categoría (AG, CE, VI, RO, WH, OT)
- Buscar productos por nombre en tiempo real mediante el campo de búsqueda
- Filtrar productos por categoría: aguardiente, cerveza, vino, ron, whisky, otros

#### Módulo de inventario — `productos.html` (modo "Gestionar")
- Agregar un producto nuevo con nombre, categoría, precio (COP), stock inicial y descripción opcional
- Editar los datos de un producto existente
- Eliminar un producto del catálogo
- Visualizar el estado del stock con indicadores: **OK** (stock normal) o **Stock bajo** (stock crítico)

---

### 3. ¿Qué datos maneja?

| Entidad | Atributo | Tipo | Obligatorio | Restricciones |
|---------|----------|------|-------------|---------------|
| **Cliente** | id | INT (PK) | Sí | Autoincremental |
| | nombre | VARCHAR(100) | Sí | Mínimo 3 caracteres (`minlength="3"`) |
| | cedula | VARCHAR(20) | Sí | Único, solo dígitos, 6–12 caracteres (`pattern="[0-9]{6,12}"`) |
| | telefono | VARCHAR(15) | No | Formato numérico (`type="tel"`) |
| | correo | VARCHAR(100) | No | Formato email válido (`type="email"`) |
| **Producto** | id | INT (PK) | Sí | Autoincremental |
| | nombre | VARCHAR(100) | Sí | Mínimo 3 caracteres |
| | categoria | VARCHAR(50) | Sí | Enum: aguardiente, cerveza, vino, ron, whisky, otros |
| | precio | DECIMAL(10,2) | Sí | Mayor que 0, paso de 100 COP (`min="1" step="100"`) |
| | stock | INT | Sí | Mayor o igual a 0 (`min="0"`) |
| | descripcion | TEXT | No | Máximo 500 caracteres (`maxlength="500"`) |
| **Venta** | id | INT (PK) | Sí | Autoincremental |
| | cliente_cedula | VARCHAR(20) | Sí | Cédula del cliente titular |
| | cliente_nombre | VARCHAR(100) | Sí | Nombre del cliente titular |
| | fecha | DATETIME | Sí | Asignada automáticamente |
| | total | DECIMAL(10,2) | Sí | Calculado en tiempo real desde `app.js` (`updateSummary()`) |
| | notas | TEXT | No | Máximo 500 caracteres |
| **DetalleVenta** | id | INT (PK) | Sí | Autoincremental |
| | venta_id | INT (FK) | Sí | Referencia a Venta |
| | producto_id | INT (FK) | Sí | Referencia a Producto (valores 1–8 según el select) |
| | cantidad | INT | Sí | Mayor que 0 |
| | precio_unitario | DECIMAL(10,2) | Sí | Precio al momento de la venta (extraído de `data-price`) |

---

### 4. ¿Qué restricciones existen?

| Restricción | Descripción |
|-------------|-------------|
| **Cédula única** | No pueden existir dos clientes con el mismo número de cédula |
| **Cédula solo dígitos** | El campo cédula valida el patrón `[0-9]{6,12}` mediante HTML5 nativo |
| **Venta con al menos un producto** | El formulario de venta (`venta-form`) rechaza el envío si `cartItems` está vacío, mostrando alerta al usuario |
| **Stock suficiente** | Una venta no puede procesarse si la cantidad supera el stock disponible del producto |
| **Stock no negativo** | El stock no puede quedar por debajo de 0 tras procesar una venta |
| **Precio positivo** | El precio de un producto debe ser mayor a $0 (`min="1"`) |
| **Precio histórico** | El `precio_unitario` en DetalleVenta se toma del atributo `data-price` del `<option>` al momento de la venta; cambios futuros en el producto no lo afectan |
| **Categorías definidas** | Las categorías están limitadas a: aguardiente, cerveza, vino, ron, whisky, otros (definidas en los `<select>` de `productos.html` y `cat-filter`) |
| **Nombre mínimo** | Tanto el nombre del cliente como el del producto requieren mínimo 3 caracteres |

---

## Patrón arquitectónico elegido: MVC

### Justificación técnica

El patrón **MVC (Model-View-Controller)** fue elegido para SalesFlow por las siguientes razones técnicas específicas al proyecto:

**1. Separación natural de las tres entidades del sistema**
SalesFlow gestiona clientes, productos y ventas — cada una con lógica propia. MVC permite asignar un controlador independiente a cada entidad (`clienteController.js`, `productoController.js`, `ventaController.js`), evitando que la lógica de una contamine a otra.

**2. Las vistas ya existen y son independientes del servidor**
Las cuatro vistas (`index.html`, `clientes.html`, `ventas.html`, `productos.html`) fueron construidas como HTML/CSS puro sin acoplamiento al backend. Esto es MVC por naturaleza: la capa View funciona de forma autónoma y se comunicará con los controladores únicamente a través de peticiones HTTP.

**3. Facilidad de sustitución del mecanismo de persistencia**
La persistencia actual es en **archivos JSON** y vive aislada en la capa de `services/`. Si en el futuro se cambia a una base de datos (MySQL, PostgreSQL, etc.), solo se modifican esos archivos de servicios; los controladores y las vistas no requieren ningún cambio, ya que no conocen cómo se guardan los datos.

**4. Compatibilidad directa con Express.js**
Node.js + Express implementa MVC de forma directa: las rutas (`routes/`) son el punto de entrada, los controladores (`controllers/`) contienen la lógica y validación, y los servicios (`services/`) manejan la lectura/escritura de los archivos JSON.

### Estructura de carpetas que refleja el patrón

```
salesflow/
├── frontend/                ← Capa View
│   ├── index.html           ← dashboard principal
│   ├── clientes.html        ← gestión de clientes
│   ├── ventas.html          ← formulario POS
│   ├── productos.html       ← catálogo + inventario (toggle)
│   └── public/
│       ├── css/styles.css   ← estilos globales (Outfit + DM Sans)
│       └── js/              ← lógica del cliente
│           ├── api.js       ← consumo de la API (Fetch)
│           ├── ui.js        ← toasts y estados de interfaz
│           ├── app.js       ← navegación
│           ├── dashboard.js · productos.js · clientes.js · ventas.js
├── backend/                 ← Capas Controller + Model (servicios)
│   ├── src/
│   │   ├── routes/          ← Controller: puntos de entrada HTTP
│   │   ├── controllers/     ← Controller: lógica de negocio y validación
│   │   ├── services/        ← Model: lectura/escritura de los JSON
│   │   └── middleware/      ← manejo centralizado de errores
│   └── data/                ← persistencia: productos.json · clientes.json · ventas.json
└── docs/
```

### Respuesta a 3 de las 7 preguntas del análisis de patrones

| Pregunta | Respuesta para SalesFlow |
|----------|--------------------------|
| ¿Cómo se divide el sistema? | En tres capas: **Model** (servicios que leen/escriben los archivos JSON), **View** (HTML/CSS/JS en el navegador) y **Controller** (lógica de negocio en Express.js) |
| ¿Dónde vive la lógica de negocio? | En `backend/src/controllers/`. Ejemplo: la validación de stock antes de procesar una venta vive en `controllers/ventas.js` |
| ¿Qué tan fácil es cambiar la persistencia? | Solo se modifican los archivos de `services/`. Los controladores y vistas no cambian |

---

## Mapeo de vistas a rutas

Cada vista del proyecto consume endpoints reales del backend mediante Fetch API. Este es el mapeo de acciones del frontend a la API REST implementada:

| Vista | Acción en el frontend | Método HTTP | Endpoint backend | Descripción |
|-------|-----------------------|-------------|------------------|-------------|
| `clientes.html` | Formulario "Registrar cliente" (`cliente-form`) | `POST` | `/api/clientes` | Crea un cliente nuevo con nombre, cédula, teléfono y correo |
| `clientes.html` | Botón "Buscar" (`buscarCliente()`) | `GET` | `/api/clientes/:cedula` | Busca un cliente por número de cédula |
| `ventas.html` | Carga inicial de la página | `GET` | `/api/productos` | Obtiene el catálogo de productos para poblar el `<select>` |
| `ventas.html` | Botón "Registrar venta" (`venta-form`) | `POST` | `/api/ventas` | Crea una venta con cliente, productos, cantidades y notas |
| `productos.html` | Modo "Ver catálogo" — carga inicial | `GET` | `/api/productos` | Lista todos los productos disponibles con precio y stock |
| `productos.html` | Modo "Gestionar" — formulario "Guardar producto" (`producto-form`) | `POST` | `/api/productos` | Crea un producto nuevo en el catálogo |
| `productos.html` | Modo "Gestionar" — botón "Editar" | `PUT` | `/api/productos/:id` | Actualiza nombre, categoría, precio o descripción de un producto |
| `productos.html` | Modo "Gestionar" — actualizar stock | `PATCH` | `/api/productos/:id/stock` | Actualiza únicamente la cantidad en stock de un producto |
| `productos.html` | Modo "Gestionar" — botón "Eliminar" | `DELETE` | `/api/productos/:id` | Elimina un producto del catálogo por su ID |
| `index.html` | Carga inicial del dashboard | `GET` | `/api/stats` | Obtiene los contadores del día (ventas, ingresos, stock, clientes) |