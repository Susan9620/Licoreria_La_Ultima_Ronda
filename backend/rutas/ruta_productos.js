const express = require('express');
const controladorProductos = require('../controladores/controlador_productos');
const { Verificar_Token } = require('../middleware/middleware_autenticación');

const Ruta = express.Router();

/**
 * @route   GET /api/Productos
 * @desc    Obtener productos destacados
 */
Ruta.get('/', controladorProductos.Obtener_Productos_Destacados);

/**
 * @route   GET /api/Productos/all
 * @desc    Obtener todos los productos activos
 */
Ruta.get('/all', controladorProductos.Obtener_Todos);

/**
 * @route   GET /api/Productos/:id/Comprados_Juntos
 * @desc    Obtener hasta 4 productos comprados junto a la variante predeterminada
 */
Ruta.get('/:id/Comprados_Juntos', controladorProductos.Obtener_Comprados_Juntos);

/**
 * @route   POST /api/Productos/:id/calificar
 * @desc    Registrar una nueva valoración para el producto
 */
Ruta.post('/:id/calificar', Verificar_Token, controladorProductos.calificarProducto);

/**
 * @route   GET /api/Productos/:id/Calificación
 * @desc    Obtener la valoración del usuario
 */
Ruta.get('/:id/Calificación', Verificar_Token, controladorProductos.Obtener_Calificación_Usuario);


/**
 * @route   GET /api/Productos/:id
 * @desc    Obtener un producto por su ID
 */
Ruta.get('/:id', controladorProductos.Obtener_Por_ID);

module.exports = Ruta;