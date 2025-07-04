const express = require('express');
const controladorListaDeseos = require('../controladores/controlador_lista_deseos');
const { verificarToken } = require('../middleware/middleware_autenticación');

const router = express.Router();

/**
 * @route   GET /api/deseos
 * @desc    Obtener la lista de deseos del usuario autenticado
 * @access  Privado
 */
router.get('/', verificarToken, controladorListaDeseos.obtenerLista);

/**
 * @route   POST /api/deseos
 * @desc    Agregar un producto a la lista de deseos
 * @access  Privado
 */
router.post('/', verificarToken, controladorListaDeseos.agregar);

/**
 * @route   DELETE /api/deseos/:productoId
 * @desc    Eliminar un producto de la lista de deseos
 * @access  Privado
 */
router.delete('/:productoId', verificarToken, controladorListaDeseos.eliminar);

module.exports = router;