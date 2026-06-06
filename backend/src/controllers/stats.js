const serviceProductos = require('../services/productos');
const serviceClientes = require('../services/clientes');
const serviceVentas = require('../services/ventas');

const obtener = (req, res) => {
  const productos = serviceProductos.leer();
  const clientes = serviceClientes.leer();
  const ventas = serviceVentas.leer();

  const hoy = new Date().toISOString().split('T')[0];
  const ventasHoy = ventas.filter(v => (v.fecha || '').split('T')[0] === hoy);

  res.json({
    ventasHoy: ventasHoy.length,
    ingresosHoy: ventasHoy.reduce((sum, v) => sum + (v.total || 0), 0),
    productosEnStock: productos.reduce((sum, p) => sum + (p.stock || 0), 0),
    clientesRegistrados: clientes.length
  });
};

module.exports = { obtener };
