const express = require('express');
const controladorReseñas = require('../controladores/controlador_reseñas');

const router = express.Router();

/**
 * @route   POST /api/reseñas/:ID_Producto
 * @desc    Inserta una nueva reseña y actualiza la calificación del producto
 * @access  Público (o privado si implementas autenticación)
 */
router.post('/:ID_Producto', controladorReseñas.Insertar_Reseñas);

/**
 * @route   GET /api/reseñas/:ID_Producto
 * @desc    Obtiene todas las reseñas de un producto
 * @access  Público
 */
router.get('/:ID_Producto', controladorReseñas.Obtener_Reseñas_Por_Producto);

module.exports = router;