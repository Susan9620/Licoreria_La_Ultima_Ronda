const express = require('express');
const controladorListaDeseos = require('../controladores/controlador_lista_deseos');
const { Verificar_Token } = require('../middleware/middleware_autenticación');

const Ruta = express.Router();

/**
 * @route   GET /api/Deseos
 * @desc    Obtener la lista de deseos del usuario autenticado
 * @access  Privado
 */
Ruta.get('/', Verificar_Token, controladorListaDeseos.Obtener_Lista);

/**
 * @route   POST /api/Deseos
 * @desc    Agregar un producto a la lista de deseos
 * @access  Privado
 */
Ruta.post('/', Verificar_Token, controladorListaDeseos.Agregar);

/**
 * @route   DELETE /api/Deseos/:Producto_ID
 * @desc    Eliminar un producto de la lista de deseos
 * @access  Privado
 */
Ruta.delete('/:Producto_ID', Verificar_Token, controladorListaDeseos.Eliminar);

module.exports = Ruta;