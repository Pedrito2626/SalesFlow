// SalesFlow — dashboard.js
// Carga las estadísticas del día en la pantalla inicial (index.html).

async function cargarStats() {
  const els = {
    ventas:    document.getElementById('stat-ventas'),
    ingresos:  document.getElementById('stat-ingresos'),
    stock:     document.getElementById('stat-stock'),
    clientes:  document.getElementById('stat-clientes'),
  };

  // Estado de carga
  Object.values(els).forEach(el => { if (el) el.textContent = '…'; });

  const res = await StatsAPI.obtener();
  if (!res.success) {
    Object.values(els).forEach(el => { if (el) el.textContent = '—'; });
    showToast('No se pudieron cargar las estadísticas', 'error');
    return;
  }

  const s = res.data;
  if (els.ventas)   els.ventas.textContent   = s.ventasHoy;
  if (els.ingresos) els.ingresos.textContent = formatCOP(s.ingresosHoy);
  if (els.stock)    els.stock.textContent    = s.productosEnStock;
  if (els.clientes) els.clientes.textContent = s.clientesRegistrados;
}

document.addEventListener('DOMContentLoaded', cargarStats);
