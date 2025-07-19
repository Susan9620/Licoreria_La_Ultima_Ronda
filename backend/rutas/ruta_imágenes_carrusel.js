const express = require('express');
const controladorImagenesCarrusel = require('../controladores/controlador_imágenes_carrusel');
const { verificarToken, esAdministrador } = require('../middleware/middleware_autenticación');

const router = express.Router();

/**
 * @route   GET /api/carrusel
 * @desc    Obtener todas las imágenes activas del carrusel
 * @access  Público
 */
router.get('/', controladorImagenesCarrusel.Obtener_Imágenes_Carrusel);

/**
 * @route   GET /api/carrusel/:id
 * @desc    Obtener una imagen del carrusel por su ID
 * @access  Público
 */
router.get('/:id', controladorImagenesCarrusel.Obtener_Imagen_ID);

// Aquí podrías añadir rutas para crear, actualizar y eliminar imágenes del carrusel
// Estas rutas deberían estar protegidas con middleware de autenticación y autorización

module.exports = router;