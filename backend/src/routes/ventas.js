const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ventas');

router.get('/', ctrl.obtenerTodos);
router.get('/:id', ctrl.obtenerPorId);
router.post('/', ctrl.crear);

module.exports = router;
