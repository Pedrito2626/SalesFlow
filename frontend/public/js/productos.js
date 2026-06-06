// SalesFlow — productos.js
// Vista de productos: catálogo (cards) + gestión CRUD (tabla), conectada al backend.

const LOW_STOCK = 5;
const CAT_ICON = { aguardiente: 'AG', cerveza: 'CE', vino: 'VI', ron: 'RO', whisky: 'WH', otros: 'OT' };

const prodState = { productos: [], editId: null };

const grid   = () => document.getElementById('product-grid');
const tbody  = () => document.getElementById('inv-tbody');

/* ── Carga inicial ─────────────────────────────────── */
async function cargarProductos() {
  renderLoading(grid(), 'Cargando catálogo…');
  renderLoading(tbody(), 'Cargando productos…');

  const res = await ProductosAPI.listar();
  if (!res.success) {
    renderError(grid(), 'No se pudo cargar el catálogo. ¿El servidor está encendido?');
    renderError(tbody(), 'No se pudieron cargar los productos.');
    showToast(res.error, 'error');
    return;
  }

  prodState.productos = res.data || [];
  aplicarFiltros();
}

/* ── Filtros (búsqueda + categoría, ambos modos) ───── */
function aplicarFiltros() {
  const q   = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  const cat = document.getElementById('cat-filter')?.value || '';

  const lista = prodState.productos.filter(p => {
    const coincideTexto = !q || p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q);
    const coincideCat   = !cat || p.categoria === cat;
    return coincideTexto && coincideCat;
  });

  renderCatalogo(lista);
  renderTabla(lista);
}

/* ── Render: catálogo de tarjetas ──────────────────── */
function renderCatalogo(lista) {
  const cont = grid();
  if (!cont) return;
  if (lista.length === 0) {
    renderEmpty(cont, 'No se encontraron productos', '🔍');
    return;
  }
  cont.innerHTML = lista.map(p => {
    const low = p.stock <= LOW_STOCK;
    return `
      <article class="product-card" data-cat="${p.categoria}">
        <div class="product-card__thumb"><div class="product-card__cat-icon">${CAT_ICON[p.categoria] || 'OT'}</div></div>
        <div class="product-card__body">
          <span class="product-card__cat">${escapeHTML(p.categoria)}</span>
          <h2 class="product-card__name">${escapeHTML(p.nombre)}</h2>
          ${p.descripcion ? `<p class="product-card__desc">${escapeHTML(p.descripcion)}</p>` : ''}
        </div>
        <div class="product-card__footer">
          <span class="product-card__price">${formatCOP(p.precio)}</span>
          <span class="badge ${low ? 'badge--low' : 'badge--ok'}">Stock: ${p.stock}</span>
        </div>
      </article>`;
  }).join('');
}

/* ── Render: tabla de gestión ──────────────────────── */
function renderTabla(lista) {
  const cont = tbody();
  if (!cont) return;
  if (lista.length === 0) {
    cont.innerHTML = `<tr><td colspan="6"><div class="state"><span class="state__icon">📭</span><span>Sin productos</span></div></td></tr>`;
    return;
  }
  cont.innerHTML = lista.map(p => {
    const low = p.stock <= LOW_STOCK;
    return `
      <tr>
        <td>${escapeHTML(p.nombre)}</td>
        <td>${escapeHTML(p.categoria)}</td>
        <td>${formatCOP(p.precio)}</td>
        <td>${p.stock}</td>
        <td><span class="badge ${low ? 'badge--low' : 'badge--ok'}">${low ? 'Stock bajo' : 'OK'}</span></td>
        <td>
          <div class="actions">
            <button class="btn btn--ghost btn--sm" onclick="editarProducto(${p.id})">Editar</button>
            <button class="btn btn--danger btn--sm" onclick="eliminarProducto(${p.id})">Eliminar</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

/* ── Crear / actualizar (submit del formulario) ────── */
async function onSubmitProducto(e) {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) { form.reportValidity(); return; }

  const data = {
    nombre:      document.getElementById('p-nombre').value.trim(),
    categoria:   document.getElementById('p-cat').value,
    precio:      parseInt(document.getElementById('p-precio').value, 10),
    stock:       parseInt(document.getElementById('p-stock').value, 10),
    descripcion: document.getElementById('p-desc').value.trim(),
  };

  const btn = form.querySelector('button[type="submit"]');
  btn.setAttribute('aria-busy', 'true');

  const res = prodState.editId
    ? await ProductosAPI.actualizar(prodState.editId, data)
    : await ProductosAPI.crear(data);

  btn.removeAttribute('aria-busy');

  if (!res.success) { showToast(res.error, 'error'); return; }

  showToast(prodState.editId ? 'Producto actualizado correctamente' : 'Producto agregado correctamente', 'success');
  resetFormProducto();
  document.getElementById('form-nuevo').hidden = true;
  await cargarProductos();
}

/* ── Editar ────────────────────────────────────────── */
function editarProducto(id) {
  const p = prodState.productos.find(x => x.id === id);
  if (!p) return;
  prodState.editId = id;

  document.getElementById('p-nombre').value = p.nombre;
  document.getElementById('p-cat').value    = p.categoria;
  document.getElementById('p-precio').value = p.precio;
  document.getElementById('p-stock').value  = p.stock;
  document.getElementById('p-desc').value   = p.descripcion || '';

  const titulo = document.getElementById('form-titulo');
  if (titulo) titulo.textContent = 'Editar producto';
  const submitBtn = document.querySelector('#producto-form button[type="submit"]');
  if (submitBtn) submitBtn.textContent = 'Guardar cambios';

  setMode('gestionar');
  document.getElementById('form-nuevo').hidden = false;
  document.getElementById('form-nuevo').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetFormProducto() {
  prodState.editId = null;
  const form = document.getElementById('producto-form');
  if (form) form.reset();
  const titulo = document.getElementById('form-titulo');
  if (titulo) titulo.textContent = 'Agregar producto';
  const submitBtn = document.querySelector('#producto-form button[type="submit"]');
  if (submitBtn) submitBtn.textContent = 'Guardar producto';
}

/* ── Eliminar ──────────────────────────────────────── */
async function eliminarProducto(id) {
  const p = prodState.productos.find(x => x.id === id);
  if (!confirm(`¿Eliminar "${p ? p.nombre : 'este producto'}"? Esta acción no se puede deshacer.`)) return;

  const res = await ProductosAPI.eliminar(id);
  if (!res.success) { showToast(res.error, 'error'); return; }
  showToast('Producto eliminado correctamente', 'success');
  await cargarProductos();
}

/* ── Toggles de interfaz (referenciados desde el HTML) ─ */
function setMode(mode) {
  const esCatalogo = mode === 'catalogo';
  document.getElementById('modo-catalogo').hidden = !esCatalogo;
  document.getElementById('modo-gestionar').hidden = esCatalogo;
  document.getElementById('btn-catalogo').classList.toggle('mode-btn--active', esCatalogo);
  document.getElementById('btn-gestionar').classList.toggle('mode-btn--active', !esCatalogo);
  document.getElementById('mode-desc').textContent = esCatalogo
    ? 'Catálogo disponible en inventario'
    : 'Agrega, edita y elimina productos';
}

function toggleFormNuevo() {
  const f = document.getElementById('form-nuevo');
  f.hidden = !f.hidden;
  if (!f.hidden && !prodState.editId) resetFormProducto();
}

/* ── Init ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  setMode('catalogo');
  cargarProductos();

  document.getElementById('search-input')?.addEventListener('input', aplicarFiltros);
  document.getElementById('cat-filter')?.addEventListener('change', aplicarFiltros);
  document.getElementById('producto-form')?.addEventListener('submit', onSubmitProducto);

  // Botón cancelar edición (si existe)
  document.getElementById('cancel-edit-btn')?.addEventListener('click', () => {
    resetFormProducto();
    document.getElementById('form-nuevo').hidden = true;
  });
});
