# Registro de uso de Inteligencia Artificial — SalesFlow

**Curso:** IF2003 Programación Web · Grupo 603
**Fecha:** 2026-06-05

Este documento registra el uso de herramientas de IA en el proyecto, conforme a la sección 12 de las especificaciones. El equipo es responsable de comprender, adaptar, probar y defender todo lo entregado.

---

## 1. Herramientas utilizadas
| Herramienta | Uso principal |
|---|---|
| Claude Code (Anthropic) | Generación inicial del backend, integración frontend-backend, revisión de código y redacción de documentación |

---

## 2. Resumen de prompts relevantes
- "Calificar el proyecto contra la rúbrica del proyecto final y armar un plan de lo que falta."
- "Consolidar el backend (hecho por error en otro repositorio) con el frontend pulido de SalesFlow."
- "Adaptar el backend a persistencia JSON con el modelo de datos documentado (productos con stock, clientes por cédula, ventas multi-ítem)."
- "Conectar las 4 vistas al backend con Fetch API, reemplazar datos quemados y `alert()` por estados de interfaz y notificaciones."
- "Verificar todos los endpoints y el render del frontend antes de entregar."

---

## 3. Qué se generó, modificó o descartó
**Generado con apoyo de IA (y revisado por el equipo):**
- Backend Express: controladores, servicios (acceso a JSON), rutas y middleware de errores.
- Capa de consumo de API (`frontend/public/js/api.js`) y utilidades de interfaz (`ui.js`).
- Lógica de las vistas: `productos.js`, `clientes.js`, `ventas.js`, `dashboard.js`.
- Documentación: SRS, este registro y actualizaciones de diagramas/README.

**Modificado / adaptado por el equipo:**
- Unificación de dos modelos de datos divergentes (el del backend inicial vs. el documentado) en un único modelo canónico (stock, cédula, detalle de venta).
- Reorganización a estructura `backend/` + `frontend/`.
- Datos seed ajustados al catálogo real de la licorera (precios en COP, categorías).

**Descartado:**
- El frontend tipo "tabs" del backend original (se conservó el diseño multipágina de SalesFlow).
- Persistencia en MySQL inicialmente planeada (se optó por archivo JSON, permitido por la rúbrica y más simple de demostrar).
- Dependencias no usadas del backend original (`body-parser`, `http-server`).

---

## 4. Validaciones realizadas por el equipo
- Pruebas de todos los endpoints con `curl` verificando códigos HTTP (200/201/204/400/404) y mensajes de error.
- Verificación de persistencia: reinicio del servidor y confirmación de que los datos permanecen en los JSON.
- Pruebas de reglas de negocio: stock insuficiente, carrito vacío, cédula duplicada, categoría inválida.
- Render verificado en navegador (catálogo y dashboard cargando datos reales desde la API).

---

## 5. Riesgos detectados y mitigaciones
| Riesgo | Mitigación |
|---|---|
| Código generado que el equipo no comprenda | Revisión línea por línea y este registro; cada integrante estudia su módulo para la sustentación |
| Concurrencia en escritura de archivos JSON | Documentado como limitación conocida (alcance académico, un usuario a la vez) |
| Inconsistencia entre documentación y código | El SRS, los endpoints y el modelo de datos se escribieron a partir del código realmente implementado |
| Dependencias innecesarias | Se depuró `package.json` para dejar solo lo usado (`express`, `nodemon`) |
