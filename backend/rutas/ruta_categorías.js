const express = require('express');
const controladorCategorias = require('../controladores/controlador_categorías');

const router = express.Router();

/**
 * @route   GET /api/categorias
 * @desc    Obtener todas las categorías activas
 * @access  Público
 */
router.get('/', controladorCategorias.obtenerCategorias);

module.exports = router;