const express = require('express');
const controladorImagenesCarrusel = require('../controladores/controlador_imágenes_carrusel');
const { Verificar_Token, esAdministrador } = require('../middleware/middleware_autenticación');

const Ruta = express.Router();

/**
 * @route   GET /api/Carrusel
 * @desc    Obtener todas las imágenes activas del carrusel
 * @access  Público
 */
Ruta.get('/', controladorImagenesCarrusel.Obtener_Imágenes_Carrusel);

/**
 * @route   GET /api/Carrusel/:id
 * @desc    Obtener una imagen del carrusel por su ID
 * @access  Público
 */
Ruta.get('/:id', controladorImagenesCarrusel.Obtener_Imagen_ID);

module.exports = Ruta;