const service = require('../services/clientes');

const CEDULA_REGEX = /^[0-9]{6,12}$/;
const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const obtenerTodos = (req, res) => {
  res.json(service.leer());
};

// Búsqueda por cédula (no por id), según el flujo del frontend.
const obtenerPorCedula = (req, res) => {
  const cedula = String(req.params.cedula);
  const cliente = service.leer().find(c => c.cedula === cedula);
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(cliente);
};

const crear = (req, res) => {
  const { nombre, cedula, telefono, correo } = req.body;

  if (!nombre || nombre.trim().length < 3) {
    return res.status(400).json({ error: 'El nombre es obligatorio y debe tener al menos 3 caracteres' });
  }
  if (!cedula || !CEDULA_REGEX.test(String(cedula))) {
    return res.status(400).json({ error: 'La cédula es obligatoria y debe contener solo dígitos (6 a 12 caracteres)' });
  }
  if (correo && !CORREO_REGEX.test(correo)) {
    return res.status(400).json({ error: 'El correo electrónico no es válido' });
  }

  const clientes = service.leer();
  if (clientes.some(c => c.cedula === String(cedula))) {
    return res.status(400).json({ error: 'Ya existe un cliente registrado con esa cédula' });
  }

  const nuevo = {
    id: clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1,
    nombre: nombre.trim(),
    cedula: String(cedula),
    telefono: telefono || '',
    correo: correo || ''
  };
  clientes.push(nuevo);
  service.guardar(clientes);
  res.status(201).json(nuevo);
};

module.exports = { obtenerTodos, obtenerPorCedula, crear };
