const service = require('../services/productos');

const CATEGORIAS = ['aguardiente', 'cerveza', 'vino', 'ron', 'whisky', 'otros'];

// Valida los campos de un producto. Devuelve un mensaje de error o null si es válido.
const validarProducto = ({ nombre, categoria, precio, stock }) => {
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
    return 'El nombre es obligatorio y debe tener al menos 3 caracteres';
  }
  if (!categoria || !CATEGORIAS.includes(categoria)) {
    return `La categoría es obligatoria y debe ser una de: ${CATEGORIAS.join(', ')}`;
  }
  if (precio === undefined || isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
    return 'El precio es obligatorio y debe ser mayor a 0';
  }
  if (stock === undefined || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
    return 'El stock es obligatorio y no puede ser negativo';
  }
  return null;
};

const obtenerTodos = (req, res) => {
  res.json(service.leer());
};

const buscar = (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const productos = service.leer();
  const resultados = productos.filter(p =>
    p.nombre.toLowerCase().includes(q) ||
    p.categoria.toLowerCase().includes(q) ||
    (p.descripcion && p.descripcion.toLowerCase().includes(q))
  );
  res.json(resultados);
};

const obtenerPorId = (req, res) => {
  const id = parseInt(req.params.id);
  const producto = service.leer().find(p => p.id === id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(producto);
};

const crear = (req, res) => {
  const error = validarProducto(req.body);
  if (error) return res.status(400).json({ error });

  const { nombre, categoria, precio, stock, descripcion } = req.body;
  const productos = service.leer();
  const nuevo = {
    id: productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1,
    nombre: nombre.trim(),
    categoria,
    precio: parseInt(precio),
    stock: parseInt(stock),
    descripcion: descripcion || ''
  };
  productos.push(nuevo);
  service.guardar(productos);
  res.status(201).json(nuevo);
};

const actualizar = (req, res) => {
  const id = parseInt(req.params.id);
  const productos = service.leer();
  const indice = productos.findIndex(p => p.id === id);
  if (indice === -1) return res.status(404).json({ error: 'Producto no encontrado' });

  const error = validarProducto(req.body);
  if (error) return res.status(400).json({ error });

  const { nombre, categoria, precio, stock, descripcion } = req.body;
  productos[indice] = {
    id,
    nombre: nombre.trim(),
    categoria,
    precio: parseInt(precio),
    stock: parseInt(stock),
    descripcion: descripcion || ''
  };
  service.guardar(productos);
  res.json(productos[indice]);
};

// Actualiza únicamente el stock (PATCH /:id/stock)
const actualizarStock = (req, res) => {
  const id = parseInt(req.params.id);
  const productos = service.leer();
  const indice = productos.findIndex(p => p.id === id);
  if (indice === -1) return res.status(404).json({ error: 'Producto no encontrado' });

  const { stock } = req.body;
  if (stock === undefined || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
    return res.status(400).json({ error: 'El stock es obligatorio y no puede ser negativo' });
  }

  productos[indice].stock = parseInt(stock);
  service.guardar(productos);
  res.json(productos[indice]);
};

const eliminar = (req, res) => {
  const id = parseInt(req.params.id);
  const productos = service.leer();
  const indice = productos.findIndex(p => p.id === id);
  if (indice === -1) return res.status(404).json({ error: 'Producto no encontrado' });

  productos.splice(indice, 1);
  service.guardar(productos);
  res.status(204).send();
};

module.exports = { obtenerTodos, buscar, obtenerPorId, crear, actualizar, actualizarStock, eliminar };
