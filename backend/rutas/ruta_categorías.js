const express = require('express');
const Controlador_Categorías = require('../controladores/controlador_categorías');

const router = express.Router();

/**
 * @route   GET /api/Categorías
 * @desc    Obtener todas las categorías activas
 * @access  Público
 */
router.get('/', Controlador_Categorías.Obtener_Categorías);

module.exports = router;