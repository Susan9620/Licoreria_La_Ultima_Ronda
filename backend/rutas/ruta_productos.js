const express = require('express');
const controladorProductos = require('../controladores/controlador_productos');
const { verificarToken } = require('../middleware/middleware_autenticación');

const router = express.Router();

/**
 * @route   GET /api/productos
 * @desc    Obtener productos destacados
 */
router.get('/', controladorProductos.obtenerProductosDestacados);

/**
 * @route   GET /api/productos/all
 * @desc    Obtener todos los productos activos
 */
router.get('/all', controladorProductos.obtenerTodos);

/**
 * @route   GET /api/productos/:ID/compradosjuntos
 * @desc    Obtener hasta 4 productos comprados junto a la variante predeterminada
 */
router.get('/:ID/compradosjuntos', controladorProductos.obtenerCompradosJuntos);

/**
 * @route   POST /api/productos/:ID/calificar
 * @desc    Registrar una nueva valoración para el producto
 */
router.post('/:ID/calificar', verificarToken, controladorProductos.calificarProducto);

/**
 * @route   GET /api/productos/:ID/calificacion
 * @desc    Obtener la valoración del usuario
 */
router.get('/:ID/calificacion', verificarToken, controladorProductos.obtenerCalificacionUsuario);


/**
 * @route   GET /api/productos/:ID
 * @desc    Obtener un producto por su ID
 */
router.get('/:ID', controladorProductos.obtenerPorId);

module.exports = router;