# Especificación de Requisitos de Software (SRS) — SalesFlow

**Proyecto:** SalesFlow · Sistema de gestión de ventas e inventario para licorera
**Curso:** IF2003 Programación Web · Grupo 603
**Versión:** 1.0 · **Fecha:** 2026-06-05

---

## 1. Introducción

### 1.1 Propósito
Este documento especifica los requisitos funcionales y no funcionales del sistema **SalesFlow**, una aplicación web full-stack para la gestión de ventas e inventario de una licorera. Está dirigido al equipo de desarrollo, al docente evaluador y a cualquier persona que deba mantener o evaluar el proyecto sin haber participado en su construcción.

### 1.2 Alcance del sistema
SalesFlow permite a una licorera administrar su catálogo de productos, registrar clientes y procesar ventas desde un punto único, reemplazando hojas de cálculo y registros en papel. El sistema cubre:
- Gestión completa (CRUD) del catálogo de productos con control de stock.
- Registro y consulta de clientes por cédula.
- Registro de ventas con múltiples productos y descuento automático de inventario.
- Tablero con indicadores del día.

Queda **fuera de alcance** en esta entrega: autenticación de usuarios, reportes históricos avanzados, facturación electrónica y despliegue público.

### 1.3 Público objetivo
Docente de IF2003, integrantes del equipo y futuros mantenedores del código.

### 1.4 Definiciones, siglas y abreviaturas
| Término | Significado |
|---|---|
| CRUD | Create, Read, Update, Delete |
| API REST | Interfaz HTTP que expone recursos en formato JSON |
| SRS | Software Requirements Specification |
| RF / RNF | Requerimiento Funcional / No Funcional |
| RN | Regla de Negocio |
| Stock | Cantidad disponible de un producto |
| Detalle de venta | Línea de una venta (producto, cantidad, precio unitario) |
| COP | Peso colombiano |

### 1.5 Referencias
- Especificaciones del Proyecto Final, IF2003 (rúbrica del curso).
- Manual de clase: *API REST con Node.js y Express* (Clase 12).

---

## 2. Descripción general

### 2.1 Contexto del problema
Una licorera lleva su inventario y sus ventas de forma manual (hojas de cálculo y papel). Consultar disponibilidad, precios o el historial de un cliente exige revisar archivos dispersos, lo que genera errores de stock, ventas sin control de inventario y pérdida de información de clientes.

### 2.2 Oportunidad o necesidad detectada
Se necesita una herramienta centralizada, rápida y clara que permita al personal de mostrador y al administrador trabajar sobre los mismos datos, con validaciones que eviten errores (vender sin stock, precios negativos, clientes duplicados).

### 2.3 Descripción de la solución propuesta
Una aplicación web cliente-servidor: un frontend que consume una **API REST** construida con Node.js + Express, con **persistencia en archivos JSON** administrados por el backend. El frontend ofrece cuatro vistas (inicio, clientes, ventas, productos) y consume los endpoints reales mediante Fetch API.

### 2.4 Actores / tipos de usuario
| Actor | Descripción | Acciones principales |
|---|---|---|
| **Vendedor** | Empleado de mostrador | Registrar/buscar clientes, crear ventas, consultar catálogo |
| **Administrador** | Encargado del negocio | CRUD de productos, ajustar stock, consultar inventario y estadísticas |

### 2.5 Supuestos, restricciones y dependencias
- Un solo usuario opera el sistema a la vez (sin concurrencia de escritura intensiva).
- Requiere Node.js v20+ y pnpm instalados.
- La persistencia es en archivos JSON locales; no hay motor de base de datos.
- El frontend y el backend se ejecutan en el mismo origen (`http://localhost:3000`).

---

## 3. Requerimientos funcionales

| ID | Requerimiento funcional | Prioridad | Criterios de aceptación |
|---|---|---|---|
| RF-01 | El sistema debe permitir **registrar un producto** | Alta | Dado el formulario válido, al enviarlo el backend crea el registro (201) y el catálogo se actualiza |
| RF-02 | El sistema debe permitir **consultar el catálogo de productos** | Alta | Al abrir Productos se muestran los productos persistidos o un estado vacío |
| RF-03 | El sistema debe permitir **actualizar un producto** | Alta | Al editar datos válidos se persisten los cambios y se muestra confirmación |
| RF-04 | El sistema debe permitir **eliminar un producto** | Alta | Antes de eliminar se pide confirmación; luego el producto deja de aparecer (204) |
| RF-05 | El sistema debe permitir **buscar productos** por nombre o categoría | Media | Al escribir en el buscador, la lista se filtra mostrando solo coincidencias |
| RF-06 | El sistema debe permitir **filtrar productos por categoría** | Media | Al elegir una categoría, solo se muestran productos de esa categoría |
| RF-07 | El sistema debe permitir **ajustar el stock** de un producto | Media | Al cambiar el stock se persiste vía PATCH y el indicador (OK/Stock bajo) se actualiza |
| RF-08 | El sistema debe permitir **registrar un cliente** | Alta | Con nombre y cédula válidos se crea el cliente (201); cédula duplicada se rechaza (400) |
| RF-09 | El sistema debe permitir **buscar un cliente por cédula** | Alta | Si existe, muestra sus datos; si no, muestra "no encontrado" (404) |
| RF-10 | El sistema debe permitir **registrar una venta con uno o más productos** | Alta | Con carrito no vacío y stock suficiente, crea la venta (201), descuenta stock y calcula el total |
| RF-11 | El sistema debe **mostrar estadísticas del día** en el inicio | Media | El dashboard muestra ventas del día, ingresos, stock total y clientes registrados |
| RF-12 | El sistema debe **validar los datos en frontend y backend** | Alta | Datos inválidos son rechazados en ambos lados con mensajes claros |
| RF-13 | El sistema debe **mostrar estados de interfaz** (cargando, vacío, error, éxito) | Media | Cada operación refleja visualmente su estado sin depender de la consola |

---

## 4. Requerimientos no funcionales

| Categoría | Requerimiento no funcional | Criterio verificable |
|---|---|---|
| Usabilidad | La interfaz debe ser comprensible para usuarios no técnicos | Un vendedor completa una venta sin ayuda externa |
| Responsividad | Debe funcionar en móvil y escritorio | Se prueba a ~375px y en escritorio sin pérdida de funciones |
| Rendimiento | Las operaciones comunes deben responder rápido | Las consultas no bloquean la interfaz; respuestas < 1s en local |
| Seguridad básica | No exponer credenciales ni secretos | `.env` excluido por `.gitignore`; `.env.example` documentado |
| Mantenibilidad | Código modular según la arquitectura | Lógica separada en rutas, controladores, servicios; no todo en un archivo |
| Confiabilidad | Manejo de errores de API y validación | Respuestas HTTP correctas (200/201/204/400/404/500) y mensajes visibles |
| Accesibilidad | Formularios y navegación entendibles | `label` en campos, contraste adecuado, roles ARIA en alertas |

---

## 5. Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | No pueden existir dos clientes con la misma cédula |
| RN-02 | La cédula debe contener solo dígitos (6 a 12 caracteres) |
| RN-03 | El precio de un producto debe ser mayor a 0 |
| RN-04 | El stock no puede ser negativo |
| RN-05 | Una venta debe incluir al menos un producto |
| RN-06 | No se puede vender una cantidad mayor al stock disponible |
| RN-07 | La categoría de un producto debe pertenecer al conjunto: aguardiente, cerveza, vino, ron, whisky, otros |
| RN-08 | El precio unitario en el detalle de la venta se congela al momento de la venta (precio histórico) |
| RN-09 | El nombre de producto y de cliente requiere mínimo 3 caracteres |

---

## 6. Modelo de datos

### Entidades, atributos y tipos

**Producto**
| Atributo | Tipo | Restricciones |
|---|---|---|
| id | int (PK) | autoincremental |
| nombre | string | obligatorio, mín. 3 caracteres |
| categoria | enum | aguardiente \| cerveza \| vino \| ron \| whisky \| otros |
| precio | int (COP) | > 0 |
| stock | int | ≥ 0 |
| descripcion | string | opcional, máx. 500 |

**Cliente**
| Atributo | Tipo | Restricciones |
|---|---|---|
| id | int (PK) | autoincremental |
| nombre | string | obligatorio, mín. 3 caracteres |
| cedula | string | única, 6–12 dígitos |
| telefono | string | opcional |
| correo | string | opcional, formato email |

**Venta** (con **DetalleVenta** embebido)
| Atributo | Tipo | Restricciones |
|---|---|---|
| id | int (PK) | autoincremental |
| cliente_cedula | string | obligatorio |
| cliente_nombre | string | obligatorio |
| fecha | string (ISO) | asignada automáticamente |
| total | int (COP) | calculado |
| notas | string | opcional |
| detalle | array | ≥ 1 línea: `{ producto_id, cantidad, precio_unitario }` |

### Relaciones
- Un **Cliente** realiza muchas **Ventas** (1:N, por cédula).
- Una **Venta** contiene uno o más **DetalleVenta** (1:N).
- Un **Producto** puede aparecer en muchos **DetalleVenta** (1:N).

*(Diagrama entidad-relación: ver `docs/diagramas/diagramas.md`, sección D03.)*

---

## 7. Interfaces externas

### 7.1 Interfaz de usuario (pantallas principales)
1. **Inicio / Dashboard** (`index.html`) — propósito del sistema y estadísticas del día.
2. **Clientes** (`clientes.html`) — registro y búsqueda por cédula.
3. **Nueva venta** (`ventas.html`) — selección de productos, carrito y registro.
4. **Productos** (`productos.html`) — catálogo (cards) y gestión CRUD (tabla + formulario).

### 7.2 API backend (endpoints)
| Método | Endpoint | Descripción | Respuesta |
|---|---|---|---|
| GET | `/api/productos` | Lista productos | 200 + arreglo |
| GET | `/api/productos/search?q=` | Busca por nombre/categoría | 200 + arreglo |
| GET | `/api/productos/:id` | Consulta un producto | 200 / 404 |
| POST | `/api/productos` | Crea producto | 201 / 400 |
| PUT | `/api/productos/:id` | Actualiza producto | 200 / 400 / 404 |
| PATCH | `/api/productos/:id/stock` | Ajusta solo el stock | 200 / 400 / 404 |
| DELETE | `/api/productos/:id` | Elimina producto | 204 / 404 |
| GET | `/api/clientes` | Lista clientes | 200 + arreglo |
| GET | `/api/clientes/:cedula` | Busca cliente por cédula | 200 / 404 |
| POST | `/api/clientes` | Registra cliente | 201 / 400 |
| GET | `/api/ventas` | Lista ventas | 200 + arreglo |
| GET | `/api/ventas/:id` | Consulta una venta | 200 / 404 |
| POST | `/api/ventas` | Registra venta multi-ítem | 201 / 400 / 404 |
| GET | `/api/stats` | Indicadores del día | 200 |

### 7.3 Persistencia
- **Mecanismo:** archivos JSON administrados por el backend.
- **Ubicación:** `backend/data/{productos,clientes,ventas}.json`.
- **Lectura/escritura:** la capa de servicios (`backend/src/services/*.js`) lee con `fs.readFileSync` y escribe con `fs.writeFileSync` (JSON con indentación).
- **Limitaciones:** riesgo de concurrencia ante escrituras simultáneas y escalabilidad limitada; aceptable para el alcance académico.

### 7.4 Servicios externos
Ninguno en esta entrega.

---

## 8. Criterios de aceptación del proyecto
- [x] El proyecto se ejecuta siguiendo el README (`pnpm install && pnpm dev`).
- [x] El frontend consume el backend real (Fetch API a `/api/*`).
- [x] El CRUD principal (productos) funciona completo.
- [x] Los datos persisten tras reiniciar el servidor.
- [x] Hay validación en frontend y backend.
- [x] Se muestran errores y estados de interfaz.
- [ ] Todos los integrantes pueden explicar su aporte y la arquitectura (sustentación).

---

## 9. Matriz de trazabilidad

| RF | Pantalla relacionada | Endpoint relacionado | Cómo se demuestra |
|---|---|---|---|
| RF-01 | Productos (Gestionar) | `POST /api/productos` | Crear un producto y verlo en la tabla y el catálogo |
| RF-02 | Productos (Catálogo) | `GET /api/productos` | Abrir Productos y ver los datos persistidos |
| RF-03 | Productos (Gestionar) | `PUT /api/productos/:id` | Editar un producto y ver el cambio |
| RF-04 | Productos (Gestionar) | `DELETE /api/productos/:id` | Eliminar con confirmación |
| RF-05 | Productos | `GET /api/productos/search?q=` | Buscar por nombre y ver el filtrado |
| RF-06 | Productos | (filtro en cliente) | Filtrar por categoría |
| RF-07 | Productos (Gestionar) | `PATCH /api/productos/:id/stock` | Cambiar stock y ver el indicador OK/bajo |
| RF-08 | Clientes | `POST /api/clientes` | Registrar cliente; intentar cédula duplicada (error) |
| RF-09 | Clientes | `GET /api/clientes/:cedula` | Buscar por cédula existente e inexistente |
| RF-10 | Nueva venta | `POST /api/ventas` | Venta con 2 productos; ver stock descontado y total |
| RF-11 | Inicio | `GET /api/stats` | Ver indicadores del día |
| RF-12 | Todas | (validación back) | Enviar datos inválidos y ver rechazo 400 |
| RF-13 | Todas | — | Mostrar loaders, vacío, error y toasts de éxito |
