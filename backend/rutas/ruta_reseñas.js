const express = require('express');
const controladorReseñas = require('../controladores/controlador_reseñas');

const router = express.Router();

/**
 * @route   POST /api/reseñas/:idProducto
 * @desc    Inserta una nueva reseña y actualiza la calificación del producto
 * @access  Público (o privado si implementas autenticación)
 */
router.post('/:idProducto', controladorReseñas.insertarReseña);

/**
 * @route   GET /api/reseñas/:idProducto
 * @desc    Obtiene todas las reseñas de un producto
 * @access  Público
 */
router.get('/:idProducto', controladorReseñas.obtenerReseñasPorProducto);

module.exports = router;