# SalesFlow

Sistema web de gestión de ventas e inventario para licorera. Permite registrar clientes, procesar ventas y administrar el catálogo de productos desde un punto de venta unificado, sin necesidad de papel ni hojas de cálculo.

---

## Prototipo navegable

🔗 [Enlace al prototipo web](https://www.figma.com/make/Au6RAlIK0UnUKk4CDEVuDX/Dashboard-para-SalesFlow?t=iaTipdvEWn1qwSiB-20&fullscreen=1&preview-route=%2Fproductos)
🔗 [Enlace al prototipo móvil](https://www.figma.com/make/yKnN4nBh2nSNQ2KMWp5g0Y/Minimalist-sidebar-component--Community-?t=WRqjjUl0LNCfbS0A-20&fullscreen=1&preview-route=%2Fproductos)

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend (implementado) | HTML5 semántico · CSS3 con Flexbox y Grid · JavaScript vanilla |
| Tipografía | Outfit (títulos) · DM Sans (cuerpo) — Google Fonts |
| Backend (planeado) | Node.js + Express.js |
| Base de datos (planeada) | MySQL |
| Hosting | GitHub Pages (frontend) · Railway (backend) |

---

## Arquitectura

- **Estilo:** Cliente-Servidor
- **Patrón:** MVC (Model-View-Controller)
- **Comunicación:** HTTP / HTTPS · Respuestas en JSON

```
Navegador  →  index.html · clientes.html · ventas.html · productos.html
                         public/css/styles.css · public/js/app.js
        ↕  HTTP · JSON
Servidor   →  routes/  →  controllers/  →  models/
        ↕  SQL
MySQL      →  clientes · productos · ventas · detalle_venta
```


## Cómo ejecutar el proyecto

El proyecto es frontend puro en este primer avance — no requiere instalar dependencias.

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Pedrito2626/SalesFlow.git
   cd salesflow
   ```

2. Abre `index.html` en el navegador:
   ```bash
   # Con Python (cualquier versión):
   python -m http.server 3000
   # Luego abre: http://localhost:3000

   # Con VS Code: instala la extensión Live Server → clic en "Go Live"
   ```

3. Navega entre las 4 vistas desde el menú superior.

> En `productos.html` usa el toggle **"Ver catálogo / Gestionar"** para cambiar entre el modo vendedor y el modo administrador.
