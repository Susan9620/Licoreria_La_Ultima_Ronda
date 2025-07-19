const express = require('express');
const controladorProductos = require('../controladores/controlador_productos');
const { verificarToken } = require('../middleware/middleware_autenticación');

const router = express.Router();

/**
 * @route   GET /api/Productos
 * @desc    Obtener productos destacados
 */
router.get('/', controladorProductos.Obtener_Productos_Destacados);

/**
 * @route   GET /api/Productos/all
 * @desc    Obtener todos los productos activos
 */
router.get('/all', controladorProductos.Obtener_Todos);

/**
 * @route   GET /api/Productos/:id/compradosjuntos
 * @desc    Obtener hasta 4 productos comprados junto a la variante predeterminada
 */
router.get('/:id/compradosjuntos', controladorProductos.obtenerCompradosJuntos);

/**
 * @route   POST /api/Productos/:id/calificar
 * @desc    Registrar una nueva valoración para el producto
 */
router.post('/:id/calificar', verificarToken, controladorProductos.calificarProducto);

/**
 * @route   GET /api/Productos/:id/calificacion
 * @desc    Obtener la valoración del usuario
 */
router.get('/:id/calificacion', verificarToken, controladorProductos.obtenerCalificacionUsuario);


/**
 * @route   GET /api/Productos/:id
 * @desc    Obtener un producto por su ID
 */
router.get('/:id', controladorProductos.obtenerPorId);

module.exports = router;