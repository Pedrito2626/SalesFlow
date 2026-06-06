// SalesFlow — ui.js
// Utilidades de interfaz: toasts, formato y estados (cargando, vacío, error).

/* ── Toasts / notificaciones ───────────────────────── */
function getToastContainer() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Muestra un mensaje al usuario (no depende de la consola).
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'info') {
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.innerHTML = `<span class="toast__icon">${icons[type] || icons.info}</span><span class="toast__msg"></span>`;
  toast.querySelector('.toast__msg').textContent = message;

  getToastContainer().appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 4000);
}

/* ── Formato ───────────────────────────────────────── */
// Pesos colombianos, sin decimales (ej: $28.000)
function formatCOP(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

/* ── Estados de interfaz ───────────────────────────── */
function renderLoading(el, mensaje = 'Cargando…') {
  if (el) el.innerHTML = `<div class="state"><div class="spinner"></div><span>${escapeHTML(mensaje)}</span></div>`;
}

function renderEmpty(el, mensaje = 'No hay datos para mostrar', icon = '📭') {
  if (el) el.innerHTML = `<div class="state"><span class="state__icon">${icon}</span><span>${escapeHTML(mensaje)}</span></div>`;
}

function renderError(el, mensaje = 'Ocurrió un error', icon = '⚠️') {
  if (el) el.innerHTML = `<div class="state state--error"><span class="state__icon">${icon}</span><span>${escapeHTML(mensaje)}</span></div>`;
}
