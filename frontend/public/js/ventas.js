// SalesFlow — ventas.js
// Registro de ventas: carga productos del backend, arma el carrito y crea la venta.

const ventaState = { productos: [], cart: [] };

const itemsEl = () => document.querySelector('.summary-items');
const totalEl = () => document.querySelector('.summary-total__value');

/* ── Cargar productos en el selector ───────────────── */
async function cargarProductosVenta() {
  const sel = document.getElementById('producto-select');
  if (!sel) return;
  sel.innerHTML = '<option value="">Cargando productos…</option>';

  const res = await ProductosAPI.listar();
  if (!res.success) {
    sel.innerHTML = '<option value="">Error al cargar productos</option>';
    showToast(res.error, 'error');
    return;
  }

  ventaState.productos = res.data || [];
  sel.innerHTML = '<option value="">Selecciona un producto…</option>' +
    ventaState.productos.map(p =>
      `<option value="${p.id}" data-price="${p.precio}" data-stock="${p.stock}">${escapeHTML(p.nombre)} — ${formatCOP(p.precio)} (Stock: ${p.stock})</option>`
    ).join('');
}

/* ── Resumen / carrito ─────────────────────────────── */
function updateSummary() {
  const cont = itemsEl();
  if (!cont) return;
  if (ventaState.cart.length === 0) {
    cont.innerHTML = '<p class="summary-empty">Sin productos agregados</p>';
    if (totalEl()) totalEl().textContent = formatCOP(0);
    return;
  }
  cont.innerHTML = ventaState.cart.map((item, i) => `
    <div class="summary-item">
      <span><strong>${escapeHTML(item.nombre)}</strong> ×${item.cantidad}</span>
      <span>${formatCOP(item.precio * item.cantidad)}
        <button type="button" class="summary-item__remove" aria-label="Quitar" onclick="quitarItem(${i})">✕</button>
      </span>
    </div>`).join('');
  const total = ventaState.cart.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  if (totalEl()) totalEl().textContent = formatCOP(total);
}

function quitarItem(index) {
  ventaState.cart.splice(index, 1);
  updateSummary();
}

function agregarAlCarrito() {
  const sel = document.getElementById('producto-select');
  const qtyEl = document.getElementById('cantidad');
  if (!sel || !qtyEl) return;

  const opt = sel.options[sel.selectedIndex];
  const id  = parseInt(sel.value, 10);
  const qty = parseInt(qtyEl.value, 10) || 1;

  if (!id || !opt.dataset.price) { showToast('Selecciona un producto', 'error'); return; }

  const stock = parseInt(opt.dataset.stock, 10);
  const existente = ventaState.cart.find(i => i.id === id);
  const yaEnCarrito = existente ? existente.cantidad : 0;

  if (yaEnCarrito + qty > stock) {
    showToast(`Stock insuficiente. Disponible: ${stock}`, 'error');
    return;
  }

  if (existente) {
    existente.cantidad += qty;
  } else {
    ventaState.cart.push({ id, nombre: opt.dataset.nombre || opt.textContent.split(' — ')[0], precio: parseFloat(opt.dataset.price), cantidad: qty });
  }
  updateSummary();
  qtyEl.value = 1;
}

/* ── Registrar venta ───────────────────────────────── */
async function onSubmitVenta(e) {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) { form.reportValidity(); return; }
  if (ventaState.cart.length === 0) {
    showToast('Agrega al menos un producto a la venta', 'error');
    return;
  }

  const data = {
    cedula:         document.getElementById('cedula').value.trim(),
    nombre_cliente: document.getElementById('nombre-cliente').value.trim(),
    notas:          document.getElementById('notas').value.trim(),
    items: ventaState.cart.map(i => ({ producto_id: i.id, cantidad: i.cantidad })),
  };

  const btn = document.querySelector('.summary-actions .btn');
  btn?.setAttribute('aria-busy', 'true');
  const res = await VentasAPI.crear(data);
  btn?.removeAttribute('aria-busy');

  if (!res.success) { showToast(res.error, 'error'); return; }

  showToast(`Venta registrada · Total ${formatCOP(res.data.total)}`, 'success');
  ventaState.cart = [];
  updateSummary();
  form.reset();
  document.getElementById('cantidad').value = 1;
  await cargarProductosVenta(); // refrescar stock en el selector
}

/* ── Init ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  cargarProductosVenta();
  updateSummary();
  document.getElementById('add-product-btn')?.addEventListener('click', agregarAlCarrito);
  document.getElementById('venta-form')?.addEventListener('submit', onSubmitVenta);
});
