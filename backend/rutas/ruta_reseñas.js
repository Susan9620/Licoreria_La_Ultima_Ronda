const express = require('express');
const controladorReseñas = require('../controladores/controlador_reseñas');

const Ruta = express.Router();

/**
 * @route   POST /api/Reseñas/:ID_Producto
 * @desc    Inserta una nueva reseña y actualiza la calificación del producto
 * @access  Público (o privado si implementas autenticación)
 */
Ruta.post('/:ID_Producto', controladorReseñas.Insertar_Reseñas);

/**
 * @route   GET /api/Reseñas/:ID_Producto
 * @desc    Obtiene todas las reseñas de un producto
 * @access  Público
 */
Ruta.get('/:ID_Producto', controladorReseñas.Obtener_Reseñas_Por_Producto);

module.exports = Ruta;