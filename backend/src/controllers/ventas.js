const serviceVentas = require('../services/ventas');
const serviceProductos = require('../services/productos');

const CEDULA_REGEX = /^[0-9]{6,12}$/;

const obtenerTodos = (req, res) => {
  res.json(serviceVentas.leer());
};

const obtenerPorId = (req, res) => {
  const id = parseInt(req.params.id);
  const venta = serviceVentas.leer().find(v => v.id === id);
  if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
  res.json(venta);
};

const crear = (req, res) => {
  const { cedula, nombre_cliente, items, notas } = req.body;

  // Validación de cliente
  if (!cedula || !CEDULA_REGEX.test(String(cedula))) {
    return res.status(400).json({ error: 'La cédula del cliente es obligatoria y debe contener solo dígitos (6 a 12 caracteres)' });
  }
  if (!nombre_cliente || nombre_cliente.trim().length < 3) {
    return res.status(400).json({ error: 'El nombre del cliente es obligatorio y debe tener al menos 3 caracteres' });
  }

  // Validación del carrito
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'La venta debe incluir al menos un producto' });
  }

  const productos = serviceProductos.leer();
  const detalle = [];

  // Verificar existencia y stock de cada ítem antes de modificar nada
  for (const item of items) {
    const idProducto = parseInt(item.producto_id);
    const cantidad = parseInt(item.cantidad);

    if (isNaN(idProducto) || isNaN(cantidad) || cantidad <= 0) {
      return res.status(400).json({ error: 'Cada ítem debe tener un producto válido y una cantidad mayor a 0' });
    }

    const producto = productos.find(p => p.id === idProducto);
    if (!producto) {
      return res.status(404).json({ error: `Producto con id ${idProducto} no encontrado` });
    }
    if (producto.stock < cantidad) {
      return res.status(400).json({ error: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}` });
    }

    detalle.push({
      producto_id: idProducto,
      cantidad,
      precio_unitario: producto.precio
    });
  }

  // Aplicar: descontar stock y calcular total
  let total = 0;
  for (const linea of detalle) {
    const producto = productos.find(p => p.id === linea.producto_id);
    producto.stock -= linea.cantidad;
    total += linea.precio_unitario * linea.cantidad;
  }
  serviceProductos.guardar(productos);

  const ventas = serviceVentas.leer();
  const nuevaVenta = {
    id: ventas.length > 0 ? Math.max(...ventas.map(v => v.id)) + 1 : 1,
    cliente_cedula: String(cedula),
    cliente_nombre: nombre_cliente.trim(),
    fecha: new Date().toISOString(),
    total,
    notas: notas || '',
    detalle
  };
  ventas.push(nuevaVenta);
  serviceVentas.guardar(ventas);

  res.status(201).json(nuevaVenta);
};

module.exports = { obtenerTodos, obtenerPorId, crear };
