const express = require('express');
const controladorPromociones = require('../controladores/controlador_promociones');

const router = express.Router();

/**
 * @route   GET /api/promociones
 * @desc    Obtener todas las promociones activas y vigentes
 * @access  Público
 */
router.get('/', controladorPromociones.obtenerPromociones);

module.exports = router;