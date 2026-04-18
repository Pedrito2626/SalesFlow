// SalesFlow — app.js
// Lógica del cliente: navegación, resumen de venta, interacciones

/* ── Nav mobile toggle ─────────────────────────────── */
const toggle = document.querySelector('.nav__toggle');
const links  = document.querySelector('.nav__links');
if (toggle && links) {
  toggle.addEventListener('click', () => links.classList.toggle('open'));
}

/* ── Active nav link ───────────────────────────────── */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__link').forEach(link => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('nav__link--active');
  }
});

/* ── Resumen de venta (ventas.html) ─────────────────── */
const itemsEl  = document.querySelector('.summary-items');
const totalEl  = document.querySelector('.summary-total__value');

let cartItems = [];

function updateSummary() {
  if (!itemsEl) return;
  if (cartItems.length === 0) {
    itemsEl.innerHTML = '<p class="summary-empty">Sin productos agregados</p>';
    if (totalEl) totalEl.textContent = '$0';
    return;
  }
  itemsEl.innerHTML = cartItems.map((item, i) => `
    <div class="summary-item">
      <span><strong>${item.name}</strong> ×${item.qty}</span>
      <span>$${(item.price * item.qty).toLocaleString()}</span>
    </div>
  `).join('');
  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  if (totalEl) totalEl.textContent = '$' + total.toLocaleString();
}

// Agregar producto al resumen desde el selector
const addBtn = document.getElementById('add-product-btn');
if (addBtn) {
  addBtn.addEventListener('click', () => {
    const sel = document.getElementById('producto-select');
    const qtyEl = document.getElementById('cantidad');
    if (!sel || !qtyEl) return;
    const opt = sel.options[sel.selectedIndex];
    const qty = parseInt(qtyEl.value) || 1;
    if (!opt || !opt.dataset.price) return;
    const existing = cartItems.find(i => i.id === opt.value);
    if (existing) { existing.qty += qty; }
    else { cartItems.push({ id: opt.value, name: opt.text, price: parseFloat(opt.dataset.price), qty }); }
    updateSummary();
    qtyEl.value = 1;
  });
}

// Validación HTML5 del formulario de venta
const ventaForm = document.getElementById('venta-form');
if (ventaForm) {
  ventaForm.addEventListener('submit', e => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Agrega al menos un producto a la venta.');
      return;
    }
    alert('Venta registrada correctamente.');
    cartItems = [];
    updateSummary();
    ventaForm.reset();
  });
}

// Búsqueda en tiempo real en catálogo
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    document.querySelectorAll('.product-card').forEach(card => {
      const name = card.querySelector('.product-card__name')?.textContent.toLowerCase() || '';
      const cat  = card.querySelector('.product-card__cat')?.textContent.toLowerCase() || '';
      card.style.display = (name.includes(q) || cat.includes(q)) ? '' : 'none';
    });
  });
}

// Filtro por categoría
const catFilter = document.getElementById('cat-filter');
if (catFilter) {
  catFilter.addEventListener('change', () => {
    const val = catFilter.value;
    document.querySelectorAll('.product-card').forEach(card => {
      const cat = card.querySelector('.product-card__cat')?.textContent.toLowerCase() || '';
      card.style.display = (!val || cat.includes(val)) ? '' : 'none';
    });
  });
}