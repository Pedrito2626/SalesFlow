// SalesFlow — api.js
// Capa de comunicación con el backend. Centraliza el consumo de la API REST.

const API_BASE = '/api';

/**
 * Realiza una petición a la API y normaliza la respuesta.
 * Devuelve siempre { success, status, data, error }.
 */
async function apiFetch(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);

    if (res.status === 204) return { success: true, status: 204, data: null };

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    if (!res.ok) {
      return { success: false, status: res.status, error: data.error || 'Error en la petición', data };
    }
    return { success: true, status: res.status, data };
  } catch (err) {
    // Error de red / servidor caído
    return { success: false, status: 0, error: 'No se pudo conectar con el servidor', data: null };
  }
}

/* ── Productos ─────────────────────────────────────── */
const ProductosAPI = {
  listar:        ()            => apiFetch('/productos'),
  buscar:        (q)           => apiFetch(`/productos/search?q=${encodeURIComponent(q)}`),
  obtener:       (id)          => apiFetch(`/productos/${id}`),
  crear:         (data)        => apiFetch('/productos', 'POST', data),
  actualizar:    (id, data)    => apiFetch(`/productos/${id}`, 'PUT', data),
  actualizarStock: (id, stock) => apiFetch(`/productos/${id}/stock`, 'PATCH', { stock }),
  eliminar:      (id)          => apiFetch(`/productos/${id}`, 'DELETE'),
};

/* ── Clientes ──────────────────────────────────────── */
const ClientesAPI = {
  listar:          ()       => apiFetch('/clientes'),
  buscarPorCedula: (cedula) => apiFetch(`/clientes/${encodeURIComponent(cedula)}`),
  crear:           (data)   => apiFetch('/clientes', 'POST', data),
};

/* ── Ventas ────────────────────────────────────────── */
const VentasAPI = {
  listar: ()     => apiFetch('/ventas'),
  crear:  (data) => apiFetch('/ventas', 'POST', data),
};

/* ── Estadísticas ──────────────────────────────────── */
const StatsAPI = {
  obtener: () => apiFetch('/stats'),
};
