// SalesFlow — clientes.js
// Registro de clientes (POST) y búsqueda por cédula (GET), conectado al backend.

/* ── Registrar cliente ─────────────────────────────── */
async function onSubmitCliente(e) {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) { form.reportValidity(); return; }

  const data = {
    nombre:   document.getElementById('cli-nombre').value.trim(),
    cedula:   document.getElementById('cli-cedula').value.trim(),
    telefono: document.getElementById('cli-telefono').value.trim(),
    correo:   document.getElementById('cli-correo').value.trim(),
  };

  const btn = form.querySelector('button[type="submit"]');
  btn.setAttribute('aria-busy', 'true');
  const res = await ClientesAPI.crear(data);
  btn.removeAttribute('aria-busy');

  if (!res.success) { showToast(res.error, 'error'); return; }
  showToast('Cliente registrado correctamente', 'success');
  form.reset();
}

/* ── Buscar cliente por cédula ─────────────────────── */
async function buscarCliente() {
  const q  = document.getElementById('buscar-cedula').value.trim();
  const el = document.getElementById('resultado-cliente');
  if (!q) { renderEmpty(el, 'Ingresa una cédula para buscar', '🔎'); return; }

  renderLoading(el, 'Buscando…');
  const res = await ClientesAPI.buscarPorCedula(q);

  if (!res.success) {
    if (res.status === 404) {
      el.innerHTML = '<p class="error-msg">No se encontró ningún cliente con esa cédula.</p>';
    } else {
      renderError(el, res.error);
    }
    return;
  }

  const c = res.data;
  el.innerHTML = `
    <div class="cliente-result-card">
      <strong>${escapeHTML(c.nombre)}</strong>
      <span>Cédula: ${escapeHTML(c.cedula)}</span>
      <span>Tel: ${escapeHTML(c.telefono) || '—'}</span>
      <span>Correo: ${escapeHTML(c.correo) || '—'}</span>
    </div>`;
}

/* ── Init ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('cliente-form')?.addEventListener('submit', onSubmitCliente);
  document.getElementById('buscar-cedula')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); buscarCliente(); }
  });
});
