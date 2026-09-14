const express = require('express');
const controladorPromociones = require('../controladores/controlador_promociones');

const Ruta = express.Router();

/**
 * @route   GET /api/Promociones
 * @desc    Obtener todas las promociones activas y vigentes
 * @access  Público
 */
Ruta.get('/', controladorPromociones.Obtener_Promociones);

module.exports = Ruta;