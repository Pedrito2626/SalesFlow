# SalesFlow — Diagramas de Arquitectura y Diseño

> Persistencia del sistema: **archivos JSON** gestionados por el backend (capa `services/`). No se usa base de datos relacional.

---

## D01. Diagrama de Casos de Uso

```mermaid
graph TB
    subgraph Sistema["Sistema SalesFlow"]
        UC1["Registrar cliente"]
        UC2["Buscar cliente por cédula"]
        UC3["Crear venta"]
        UC4["Agregar producto al carrito"]
        UC5["Ver catálogo de productos"]
        UC6["Buscar producto por nombre"]
        UC7["Filtrar productos por categoría"]
        UC8["Agregar producto al inventario"]
        UC9["Editar producto"]
        UC10["Eliminar producto"]
        UC11["Actualizar stock"]
        UC12["Ver dashboard / estadísticas"]
    end

    Vendedor(["👤 Vendedor"])
    Admin(["🔧 Administrador"])

    Vendedor --> UC1
    Vendedor --> UC2
    Vendedor --> UC3
    UC3 --> UC4
    Vendedor --> UC5
    Vendedor --> UC6
    Vendedor --> UC7
    Vendedor --> UC12

    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
```

---

## D02. Diagrama de Flujo de Usuario / Navegación

```mermaid
flowchart TD
    START([Abrir navegador]) --> INDEX[index.html\nDashboard / Inicio]

    INDEX --> NAV_C[Ir a Clientes]
    INDEX --> NAV_V[Ir a Nueva Venta]
    INDEX --> NAV_P[Ir a Productos]

    %% Módulo Clientes
    NAV_C --> CLIENTES[clientes.html]
    CLIENTES --> FORM_C[Formulario Registrar Cliente]
    FORM_C --> VAL_C{¿Campos\nválidos?}
    VAL_C -- No --> ERR_C[Mensaje de error\nen campo]
    ERR_C --> FORM_C
    VAL_C -- Sí --> OK_C[✅ Cliente registrado\ntoast de confirmación]

    CLIENTES --> BUSCAR[Buscar por cédula]
    BUSCAR --> FOUND{¿Encontrado?}
    FOUND -- Sí --> SHOW_C[Mostrar datos del cliente]
    FOUND -- No --> NOT_FOUND[Sin resultados]

    %% Módulo Ventas
    NAV_V --> VENTAS[ventas.html]
    VENTAS --> FILL_V[Llenar datos del cliente]
    VENTAS --> SEL_P[Seleccionar producto + cantidad]
    SEL_P --> ADD_BTN[Click "+ Agregar al resumen"]
    ADD_BTN --> SUMMARY[Resumen actualizado\ntotal en tiempo real]
    SUMMARY --> MORE{¿Agregar\nmás productos?}
    MORE -- Sí --> SEL_P
    MORE -- No --> SUBMIT_V[Click "Registrar venta"]
    SUBMIT_V --> VAL_V{¿Carrito\nvacío?}
    VAL_V -- Sí --> ALERT_V[⚠️ Toast: agrega\nal menos un producto]
    ALERT_V --> SEL_P
    VAL_V -- No --> OK_V[✅ Venta registrada\nFormulario limpiado]

    %% Módulo Productos
    NAV_P --> PRODUCTOS[productos.html]
    PRODUCTOS --> TOGGLE{Modo de vista}
    TOGGLE -- Ver catálogo --> CATALOGO[Grilla de tarjetas]
    CATALOGO --> SEARCH_P[Buscar en tiempo real]
    CATALOGO --> FILTER_CAT[Filtrar por categoría]

    TOGGLE -- Gestionar --> GESTIONAR[Tabla CRUD]
    GESTIONAR --> BTN_NEW[Click "+ Nuevo producto"]
    BTN_NEW --> FORM_P[Formulario agregar producto]
    FORM_P --> VAL_P{¿Campos\nválidos?}
    VAL_P -- No --> ERR_P[Error en campo]
    ERR_P --> FORM_P
    VAL_P -- Sí --> OK_P[✅ Producto guardado]

    GESTIONAR --> EDIT_P[Click "Editar"]
    EDIT_P --> EDIT_FORM[Formulario edición]
    EDIT_FORM --> SAVE_P[Guardar cambios]

    GESTIONAR --> DEL_P[Click "Eliminar"]
    DEL_P --> CONFIRM_D{¿Confirmar?}
    CONFIRM_D -- Sí --> DELETED[Producto eliminado]
    CONFIRM_D -- No --> GESTIONAR
```

---

## D03. Diagrama Entidad-Relación (Modelo de Datos)

> Modelo lógico. La persistencia real es en archivos JSON; el detalle de venta se guarda **embebido** dentro de cada venta (no como tabla independiente).

```mermaid
erDiagram
    CLIENTE {
        int id PK
        string nombre
        string cedula UK
        string telefono
        string correo
    }

    VENTA {
        int id PK
        string cliente_cedula
        string cliente_nombre
        string fecha
        int total
        string notas
    }

    DETALLE_VENTA {
        int producto_id
        int cantidad
        int precio_unitario
    }

    PRODUCTO {
        int id PK
        string nombre
        string categoria
        int precio
        int stock
        string descripcion
    }

    CLIENTE ||--o{ VENTA : "realiza (por cédula)"
    VENTA ||--|{ DETALLE_VENTA : "contiene (embebido)"
    PRODUCTO ||--o{ DETALLE_VENTA : "aparece en"
```

**Estructura JSON usada como persistencia** (archivos en `backend/data/`):

```json
{
  "clientes": [
    {
      "id": 1,
      "nombre": "Carlos Pérez",
      "cedula": "1234567890",
      "telefono": "3001234567",
      "correo": "carlos@mail.com"
    }
  ],
  "productos": [
    {
      "id": 1,
      "nombre": "Aguardiente Antioqueño 750ml",
      "categoria": "aguardiente",
      "precio": 28000,
      "stock": 42,
      "descripcion": "Sin azúcar, botella de 750ml."
    }
  ],
  "ventas": [
    {
      "id": 1,
      "cliente_cedula": "1234567890",
      "cliente_nombre": "Carlos Pérez",
      "fecha": "2026-06-06T15:30:00.000Z",
      "total": 59500,
      "notas": "Pagó con efectivo",
      "detalle": [
        { "producto_id": 1, "cantidad": 1, "precio_unitario": 28000 },
        { "producto_id": 2, "cantidad": 9, "precio_unitario": 3500 }
      ]
    }
  ]
}
```

---

## D04. Diagrama de Arquitectura / Contenedores

```mermaid
C4Context
    title Arquitectura SalesFlow

    Person(vendedor, "Vendedor", "Gestiona ventas y consulta clientes")
    Person(admin, "Administrador", "Gestiona inventario y catálogo")

    System_Boundary(salesflow, "SalesFlow") {
        Container(frontend, "Frontend", "HTML5 · CSS3 · JS Vanilla", "4 vistas que consumen la API con fetch()")
        Container(backend, "Backend", "Node.js · Express.js", "API REST MVC; sirve también el frontend estático en :3000")
        ContainerDb(db, "Persistencia", "Archivos JSON", "backend/data: productos.json, clientes.json, ventas.json")
    }

    Rel(vendedor, frontend, "Usa", "HTTP / navegador")
    Rel(admin, frontend, "Usa", "HTTP / navegador")
    Rel(frontend, backend, "Llama", "HTTP/JSON · /api/*")
    Rel(backend, db, "Lee / escribe", "fs (services/)")
```

---

## D05. Diagrama de Componentes / Capas

```mermaid
graph TB
    subgraph VIEW["🖥️ Capa Vista (Frontend)"]
        V1["index.html\nDashboard + stats"]
        V2["clientes.html\nRegistro + búsqueda"]
        V3["ventas.html\nFormulario POS + carrito"]
        V4["productos.html\nCatálogo + gestión CRUD"]
        CSS["public/css/styles.css\nEstilos globales (Outfit, DM Sans)"]
        JS["public/js/\napi.js · ui.js · app.js\ndashboard.js · productos.js · clientes.js · ventas.js"]
    end

    subgraph ROUTES["🔀 Rutas (Express)"]
        R1["routes/clientes.js\nGET /api/clientes · GET /api/clientes/:cedula · POST"]
        R2["routes/productos.js\nGET/POST · GET search · PUT/PATCH/DELETE /:id"]
        R3["routes/ventas.js\nGET · POST /api/ventas"]
        R4["routes/stats.js\nGET /api/stats"]
    end

    subgraph CTRL["⚙️ Capa Controlador (Backend)"]
        C1["controllers/clientes.js\nValidar, crear, buscar cliente"]
        C2["controllers/productos.js\nCRUD productos, stock, búsqueda"]
        C3["controllers/ventas.js\nValidar stock, registrar venta"]
        C4["controllers/stats.js\nIndicadores del día"]
    end

    subgraph MODEL["🗄️ Capa Servicios (archivos JSON)"]
        M1["services/clientes.js\nleer() / guardar()"]
        M2["services/productos.js\nleer() / guardar()"]
        M3["services/ventas.js\nleer() / guardar()"]
        DATA["backend/data/*.json"]
    end

    V1 & V2 & V3 & V4 -->|"fetch() HTTP/JSON"| ROUTES
    R1 --> C1
    R2 --> C2
    R3 --> C3
    R4 --> C4
    C1 --> M1
    C2 --> M2
    C3 --> M2
    C3 --> M3
    C4 --> M1 & M2 & M3
    M1 & M2 & M3 --> DATA
```

---

## D06. Diagramas de Secuencia

### D06-A: Registrar una venta

```mermaid
sequenceDiagram
    actor Vendedor
    participant UI as ventas.html
    participant JS as ventas.js
    participant API as POST /api/ventas
    participant VC as controllers/ventas
    participant SP as services/productos
    participant SV as services/ventas
    participant DATA as data/*.json

    Vendedor->>UI: Llena cédula y nombre del cliente
    Vendedor->>UI: Selecciona producto + cantidad
    Vendedor->>UI: Click "+ Agregar al resumen"
    JS->>JS: cart.push({id, nombre, precio, cantidad})
    JS->>UI: updateSummary() — renderiza items y total

    Vendedor->>UI: Click "Registrar venta"
    UI->>JS: ventaForm.submit()
    JS->>JS: ¿cart.length === 0?
    alt Carrito vacío
        JS->>UI: toast("Agrega al menos un producto")
    else Carrito con items
        JS->>API: POST {cedula, nombre_cliente, items[], notas}
        API->>VC: crear(req.body)
        VC->>SP: leer() (productos.json)
        loop Por cada item
            VC->>VC: ¿stock suficiente?
            alt Stock insuficiente
                VC-->>API: 400 {error: "Stock insuficiente..."}
                API-->>JS: error
                JS-->>UI: toast de error
            end
        end
        VC->>SP: guardar() — descuenta stock
        VC->>SV: guardar() — agrega venta con detalle[]
        SP->>DATA: writeFileSync(productos.json)
        SV->>DATA: writeFileSync(ventas.json)
        VC-->>API: 201 Created {venta}
        API-->>JS: {success, data: venta}
        JS->>UI: toast("Venta registrada · Total $...")
        JS->>JS: cart = [] + form.reset()
        JS->>UI: recarga selector (stock actualizado)
    end
```

### D06-B: Agregar un producto nuevo al catálogo

```mermaid
sequenceDiagram
    actor Admin
    participant UI as productos.html
    participant JS as productos.js
    participant API as POST /api/productos
    participant PC as controllers/productos
    participant SP as services/productos
    participant DATA as data/productos.json

    Admin->>UI: Click "Gestionar" (toggle)
    UI->>UI: setMode('gestionar') — oculta catálogo, muestra tabla
    Admin->>UI: Click "+ Nuevo producto" → toggleFormNuevo()
    Admin->>UI: Llena nombre, categoría, precio, stock, descripción
    Admin->>UI: Click "Guardar producto"
    UI->>JS: producto-form.submit() + checkValidity()
    alt Formulario inválido
        JS->>UI: Muestra errores en campos (.field__error)
    else Formulario válido
        JS->>API: POST {nombre, categoria, precio, stock, descripcion}
        API->>PC: crear(req.body)
        PC->>PC: Validar precio>0, stock>=0, nombre>=3, categoría en enum
        alt Validación fallida
            PC-->>API: 400 {error: "..."}
            API-->>JS: error → toast
        else Datos válidos
            PC->>SP: leer() + push(nuevo) + guardar()
            SP->>DATA: writeFileSync(productos.json)
            PC-->>API: 201 Created {producto}
            API-->>JS: {success}
            JS->>UI: toast("Producto agregado") + recargar lista
        end
    end
```

### D06-C: Buscar cliente por cédula

```mermaid
sequenceDiagram
    actor Vendedor
    participant UI as clientes.html
    participant JS as clientes.js
    participant API as GET /api/clientes/:cedula
    participant CC as controllers/clientes
    participant SC as services/clientes
    participant DATA as data/clientes.json

    Vendedor->>UI: Escribe cédula y click "Buscar"
    UI->>JS: buscarCliente()
    JS->>API: GET /api/clientes/1234567890
    API->>CC: obtenerPorCedula("1234567890")
    CC->>SC: leer()
    SC->>DATA: readFileSync(clientes.json)
    DATA-->>SC: arreglo de clientes
    SC-->>CC: find(c => c.cedula === cedula)
    alt Cliente encontrado
        CC-->>API: 200 OK {cliente}
        API-->>JS: datos del cliente
        JS->>UI: Renderiza tarjeta (nombre, cédula, teléfono, correo)
    else No encontrado
        CC-->>API: 404 Not Found
        API-->>JS: {error: "Cliente no encontrado"}
        JS->>UI: Muestra "Sin resultados"
    end
```

---

## D07. Diagrama de Despliegue

```mermaid
graph TB
    subgraph CLIENT["🖥️ Navegador del usuario"]
        B["Chrome / Firefox / Edge\nVistas servidas desde el backend"]
    end

    subgraph SERVER["💻 Servidor local (Node.js)"]
        NODE["Express.js · puerto 3000\n• Sirve frontend estático (express.static)\n• Expone API REST /api/*"]
        DATA["📄 backend/data/\nproductos.json · clientes.json · ventas.json"]
        ENVV["📄 .env  →  PORT=3000"]
    end

    B -->|"HTTP/JSON · fetch()\nhttp://localhost:3000/api/*"| NODE
    B -->|"HTTP · archivos estáticos\nhttp://localhost:3000/"| NODE
    NODE -->|"lee / escribe (fs · services/)"| DATA
    NODE -.->|"lee variables"| ENVV
```

**Flujo de despliegue local:**
```
git clone https://github.com/Pedrito2626/SalesFlow.git
cd SalesFlow/backend
pnpm install
pnpm dev            # servidor en http://localhost:3000 (frontend + API)
```

> Despliegue público (p. ej. Render/Railway) queda como mejora futura; no forma parte del alcance de esta entrega.

---

## D08. Diagrama de Estructura de Carpetas

```mermaid
graph TD
    ROOT["📁 SalesFlow/"]

    ROOT --> BACKEND["📁 backend/"]
    BACKEND --> SRC["📁 src/"]
    SRC --> IDX["📄 index.js · app.js\nArranque + configuración Express"]
    SRC --> RT["📁 routes/\nEndpoints: productos · clientes · ventas · stats"]
    SRC --> CT["📁 controllers/\nLógica de negocio y validación"]
    SRC --> SV["📁 services/\nLectura/escritura de los JSON"]
    SRC --> MW["📁 middleware/\nerrorHandler.js"]
    BACKEND --> BDATA["📁 data/\nproductos.json · clientes.json · ventas.json"]
    BACKEND --> PKG["📄 package.json · .env.example"]

    ROOT --> FRONT["📁 frontend/"]
    FRONT --> HTML["📄 index · clientes · ventas · productos .html"]
    FRONT --> PUBLIC["📁 public/"]
    PUBLIC --> CSS["📁 css/styles.css"]
    PUBLIC --> JS["📁 js/\napi · ui · app · dashboard · productos · clientes · ventas"]

    ROOT --> DOCS["📁 docs/\nSRS · arquitectura · analisis · diagramas · mockups · uso-IA"]
    ROOT --> CFG["📄 README.md · .gitignore"]
```

**Resumen de responsabilidades por carpeta:**

| Carpeta | Responsabilidad |
|---|---|
| `backend/src/routes/` | Definición de endpoints REST con Express Router |
| `backend/src/controllers/` | Lógica de negocio: validaciones y orquestación |
| `backend/src/services/` | Lectura/escritura de los archivos JSON (capa Model) |
| `backend/src/middleware/` | Manejo centralizado de errores |
| `backend/data/` | Persistencia: archivos JSON |
| `frontend/` | Vistas HTML del frontend (las 4 páginas) |
| `frontend/public/css/` | Estilos globales compartidos por todas las vistas |
| `frontend/public/js/` | Consumo de API, navegación, render y estados de UI |
| `docs/` | SRS, arquitectura, análisis, diagramas, mockups y registro de IA |
```
