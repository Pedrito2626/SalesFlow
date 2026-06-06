const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clientes');

router.get('/', ctrl.obtenerTodos);
router.get('/:cedula', ctrl.obtenerPorCedula);
router.post('/', ctrl.crear);

module.exports = router;
