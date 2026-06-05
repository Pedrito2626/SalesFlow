# SalesFlow — Diagramas de Arquitectura y Diseño

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
    VAL_C -- Sí --> OK_C[✅ Cliente registrado\nalert de confirmación]

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
    VAL_V -- Sí --> ALERT_V[⚠️ Alerta: agrega\nal menos un producto]
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

```mermaid
erDiagram
    CLIENTE {
        int id PK
        varchar nombre
        varchar cedula UK
        varchar telefono
        varchar correo
    }

    VENTA {
        int id PK
        varchar cliente_cedula FK
        varchar cliente_nombre
        datetime fecha
        decimal total
        text notas
    }

    DETALLE_VENTA {
        int id PK
        int venta_id FK
        int producto_id FK
        int cantidad
        decimal precio_unitario
    }

    PRODUCTO {
        int id PK
        varchar nombre
        varchar categoria
        decimal precio
        int stock
        text descripcion
    }

    CLIENTE ||--o{ VENTA : "realiza"
    VENTA ||--|{ DETALLE_VENTA : "contiene"
    PRODUCTO ||--o{ DETALLE_VENTA : "aparece en"
```

**Estructura JSON esperada (si se usa persistencia JSON en lugar de MySQL):**

```json
{
  "clientes": [
    {
      "id": 1,
      "nombre": "Carlos Pérez",
      "cedula": "1023456789",
      "telefono": "3001234567",
      "correo": "carlos@email.com"
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
      "cliente_cedula": "1023456789",
      "cliente_nombre": "Carlos Pérez",
      "fecha": "2026-06-05T15:30:00",
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
        Container(frontend, "Frontend", "HTML5 · CSS3 · JS Vanilla", "4 vistas estáticas: index, clientes, ventas, productos")
        Container(backend, "Backend (planeado)", "Node.js · Express.js", "API REST MVC en puerto 3000")
        ContainerDb(db, "Base de datos (planeada)", "MySQL", "Tablas: clientes, productos, ventas, detalle_venta")
    }

    Rel(vendedor, frontend, "Usa", "HTTP / navegador")
    Rel(admin, frontend, "Usa", "HTTP / navegador")
    Rel(frontend, backend, "Llama", "HTTP/JSON · /api/*")
    Rel(backend, db, "Consulta", "SQL · mysql2")
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
        JS["public/js/app.js\nNav toggle · carrito · búsqueda · filtros"]
    end

    subgraph CTRL["⚙️ Capa Controlador (Backend planeado)"]
        C1["clienteController.js\nValidar, crear, buscar cliente"]
        C2["productoController.js\nCRUD productos, stock"]
        C3["ventaController.js\nValidar stock, registrar venta"]
    end

    subgraph ROUTES["🔀 Rutas (Express)"]
        R1["routes/clientes.js\nPOST /api/clientes\nGET  /api/clientes/:cedula"]
        R2["routes/productos.js\nGET/POST /api/productos\nPUT/PATCH/DELETE /api/productos/:id"]
        R3["routes/ventas.js\nPOST /api/ventas"]
    end

    subgraph MODEL["🗄️ Capa Modelo (MySQL)"]
        M1["clienteModel.js"]
        M2["productoModel.js"]
        M3["ventaModel.js"]
        DB["db.js — pool de conexión MySQL"]
    end

    V2 & V3 & V4 -->|"fetch() HTTP/JSON"| ROUTES
    R1 --> C1
    R2 --> C2
    R3 --> C3
    C1 --> M1
    C2 --> M2
    C3 --> M2
    C3 --> M3
    M1 & M2 & M3 --> DB
```

---

## D06. Diagramas de Secuencia

### D06-A: Registrar una venta

```mermaid
sequenceDiagram
    actor Vendedor
    participant UI as ventas.html
    participant JS as app.js
    participant API as POST /api/ventas
    participant VC as ventaController
    participant PM as productoModel
    participant VM as ventaModel
    participant DB as MySQL

    Vendedor->>UI: Llena cédula y nombre del cliente
    Vendedor->>UI: Selecciona producto + cantidad
    Vendedor->>UI: Click "+ Agregar al resumen"
    UI->>JS: addBtn.click()
    JS->>JS: cartItems.push({id, name, price, qty})
    JS->>UI: updateSummary() — renderiza items y total

    Vendedor->>UI: Click "Registrar venta"
    UI->>JS: ventaForm.submit()
    JS->>JS: ¿cartItems.length === 0?
    alt Carrito vacío
        JS->>UI: alert("Agrega al menos un producto")
    else Carrito con items
        JS->>API: POST /api/ventas {cliente, items[]}
        API->>VC: registrarVenta(req.body)
        loop Por cada item
            VC->>PM: verificarStock(producto_id, cantidad)
            PM->>DB: SELECT stock FROM productos WHERE id=?
            DB-->>PM: stock actual
            alt Stock insuficiente
                PM-->>VC: Error: stock insuficiente
                VC-->>API: 400 Bad Request
                API-->>JS: {error: "Stock insuficiente"}
                JS-->>UI: Mostrar error al usuario
            end
        end
        VC->>VM: crearVenta(datos)
        VM->>DB: INSERT INTO ventas ...
        VM->>DB: INSERT INTO detalle_venta ...
        VM->>DB: UPDATE productos SET stock = stock - cantidad
        DB-->>VM: OK
        VM-->>VC: ventaId
        VC-->>API: 201 Created {id: ventaId}
        API-->>JS: {success: true}
        JS->>UI: alert("Venta registrada correctamente")
        JS->>JS: cartItems = [] + ventaForm.reset()
        JS->>UI: updateSummary() — limpia resumen
    end
```

### D06-B: Agregar un producto nuevo al catálogo

```mermaid
sequenceDiagram
    actor Admin
    participant UI as productos.html
    participant API as POST /api/productos
    participant PC as productoController
    participant PM as productoModel
    participant DB as MySQL

    Admin->>UI: Click "Gestionar" (toggle)
    UI->>UI: setMode('gestionar') — oculta catálogo, muestra tabla
    Admin->>UI: Click "+ Nuevo producto"
    UI->>UI: toggleFormNuevo() — muestra formulario

    Admin->>UI: Llena nombre, categoría, precio, stock, descripción
    Admin->>UI: Click "Guardar producto"
    UI->>UI: producto-form.submit()
    UI->>UI: checkValidity()
    alt Formulario inválido
        UI->>UI: Muestra errores en campos (.field__error)
    else Formulario válido
        UI->>API: POST /api/productos {nombre, categoria, precio, stock, descripcion}
        API->>PC: crearProducto(req.body)
        PC->>PC: Validar precio > 0, stock >= 0, nombre.length >= 3
        alt Validación fallida
            PC-->>API: 400 {error: "Datos inválidos"}
            API-->>UI: Error mostrado al usuario
        else Datos válidos
            PC->>PM: insertar(producto)
            PM->>DB: INSERT INTO productos ...
            DB-->>PM: insertId
            PM-->>PC: producto creado
            PC-->>API: 201 Created {producto}
            API-->>UI: {success: true, id: newId}
            UI->>UI: alert("Producto agregado correctamente")
            UI->>UI: form.reset() + toggleFormNuevo()
            UI->>UI: Agrega fila a la tabla
        end
    end
```

### D06-C: Buscar cliente por cédula

```mermaid
sequenceDiagram
    actor Vendedor
    participant UI as clientes.html
    participant API as GET /api/clientes/:cedula
    participant CC as clienteController
    participant CM as clienteModel
    participant DB as MySQL

    Vendedor->>UI: Escribe cédula en campo de búsqueda
    Vendedor->>UI: Click "Buscar"
    UI->>API: GET /api/clientes/1023456789
    API->>CC: buscarPorCedula("1023456789")
    CC->>CM: findByCedula(cedula)
    CM->>DB: SELECT * FROM clientes WHERE cedula = ?
    DB-->>CM: fila del cliente o vacío
    alt Cliente encontrado
        CM-->>CC: {id, nombre, cedula, telefono, correo}
        CC-->>API: 200 OK {cliente}
        API-->>UI: datos del cliente
        UI->>UI: Renderiza tarjeta con nombre, cédula, teléfono, correo
    else No encontrado
        CM-->>CC: null
        CC-->>API: 404 Not Found
        API-->>UI: {error: "Cliente no encontrado"}
        UI->>UI: Muestra mensaje "Sin resultados"
    end
```

---

## D07. Diagrama de Despliegue

```mermaid
graph TB
    subgraph CLIENT["🖥️ Navegador del usuario"]
        B["Chrome / Firefox / Safari\nindex.html · clientes.html\nventas.html · productos.html\npublic/css/styles.css\npublic/js/app.js"]
    end

    subgraph HOSTING_FE["☁️ GitHub Pages (Frontend)"]
        GH["Repositorio: github.com/Pedrito2626/SalesFlow\nBranch: main\nURL: https://pedrito2626.github.io/SalesFlow"]
    end

    subgraph HOSTING_BE["🚂 Railway (Backend — planeado)"]
        NODE["Node.js v20+\nExpress.js\nPuerto: 3000\nPROCESS.ENV: DB_HOST, DB_USER, DB_PASS, DB_NAME"]
    end

    subgraph DB_SERVER["🗄️ MySQL (planeado)"]
        MYSQL["MySQL 8.x\nBase de datos: salesflow\nTablas: clientes, productos, ventas, detalle_venta"]
    end

    subgraph ENV["📄 Variables de entorno (.env)"]
        ENVARS["DB_HOST=localhost\nDB_PORT=3306\nDB_USER=salesflow_user\nDB_PASS=*****\nDB_NAME=salesflow\nPORT=3000"]
    end

    B -->|"HTTPS · GitHub Pages CDN"| GH
    B -->|"HTTP/JSON · fetch()\nhttps://salesflow.railway.app/api/*"| NODE
    NODE -->|"SQL · mysql2 driver\nlocalhost:3306"| MYSQL
    NODE -.->|"Lee variables"| ENVARS
```

**Flujo de despliegue local:**
```
git clone https://github.com/Pedrito2626/SalesFlow.git
cd SalesFlow
python -m http.server 3000     # frontend en http://localhost:3000
# (futuro) npm install && node server.js   # backend en http://localhost:3000/api
```

---

## D08. Diagrama de Estructura de Carpetas

```mermaid
graph TD
    ROOT["📁 SalesFlow/"]

    ROOT --> INDEX["📄 index.html\nDashboard principal · stats del día"]
    ROOT --> CLIENTES_H["📄 clientes.html\nVista de registro y búsqueda de clientes"]
    ROOT --> VENTAS_H["📄 ventas.html\nFormulario POS + carrito de venta"]
    ROOT --> PROD_H["📄 productos.html\nCatálogo (ver) + inventario CRUD (gestionar)"]
    ROOT --> README["📄 README.md\nDescripción, stack, instrucciones de ejecución"]
    ROOT --> GITIGNORE["📄 .gitignore"]
    ROOT --> ENV_EX["📄 .env.example\nPlantilla de variables de entorno"]

    ROOT --> PUBLIC["📁 public/\nAssets estáticos del frontend"]
    PUBLIC --> CSS_DIR["📁 css/"]
    CSS_DIR --> STYLES["📄 styles.css\nEstilos globales: tipografía, layout,\ncomponentes, responsive (Outfit · DM Sans)"]
    PUBLIC --> JS_DIR["📁 js/"]
    JS_DIR --> APPJS["📄 app.js\nNav mobile · carrito (cartItems, updateSummary)\nbúsqueda en tiempo real · filtro por categoría"]

    ROOT --> DOCS["📁 docs/\nDocumentación del proyecto"]
    DOCS --> ANALISIS["📄 analisis.md\nAnálisis del sistema: actores, datos,\nrestricciones, patrón MVC, mapeo de rutas"]
    DOCS --> DIAG["🖼️ Diagrama - copia.jpeg\nDiagrama de referencia visual"]

    ROOT --> CONTROLLERS["📁 controllers/ (planeado)\nLógica de negocio — capa Controller"]
    CONTROLLERS --> CC["📄 clienteController.js"]
    CONTROLLERS --> PC["📄 productoController.js"]
    CONTROLLERS --> VC["📄 ventaController.js"]

    ROOT --> ROUTES["📁 routes/ (planeado)\nPuntos de entrada HTTP — Express Router"]
    ROUTES --> RC["📄 clientes.js\nPOST /api/clientes · GET /api/clientes/:cedula"]
    ROUTES --> RP["📄 productos.js\nGET·POST·PUT·PATCH·DELETE /api/productos"]
    ROUTES --> RV["📄 ventas.js\nPOST /api/ventas"]

    ROOT --> MODELS["📁 models/ (planeado)\nAcceso a datos — capa Model"]
    MODELS --> MC["📄 clienteModel.js"]
    MODELS --> MP["📄 productoModel.js"]
    MODELS --> MV["📄 ventaModel.js"]
    MODELS --> DB["📄 db.js\nPool de conexión MySQL (mysql2)"]

    ROOT --> DATABASE["📁 database/ (planeado)\nScripts SQL de creación y seed"]
    DATABASE --> SCHEMA["📄 schema.sql\nCREATE TABLE clientes, productos, ventas, detalle_venta"]
    DATABASE --> SEED["📄 seed.sql\nDatos de prueba iniciales (8 productos)"]
```

**Resumen de responsabilidades por carpeta:**

| Carpeta | Responsabilidad |
|---|---|
| `/` (raíz) | Vistas HTML del frontend (las 4 páginas) |
| `public/css/` | Estilos globales compartidos por todas las vistas |
| `public/js/` | Lógica del cliente: carrito, navegación, búsqueda |
| `docs/` | Análisis del sistema, diagramas y documentación |
| `controllers/` | Lógica de negocio: validaciones, orquestación |
| `routes/` | Definición de endpoints REST con Express Router |
| `models/` | Consultas SQL y acceso a la base de datos MySQL |
| `database/` | Scripts DDL (schema) y DML (seed) para MySQL |
