const express = require('express');
const { verificarToken, esAdministrador } = require('../middleware/middleware_autenticación');
const ControladorPedidos = require('../controladores/controlador_pedidos');
const ControladorProductos = require('../controladores/controlador_productos');
const ControladorImagenesProducto = require('../controladores/controlador_imágenes_producto');
const ControladorCategorias = require('../controladores/controlador_categorías');
const ControladorCarrusel = require('../controladores/controlador_imágenes_carrusel');
const ControladorUsuarios = require('../controladores/controlador_usuarios');
const ControladorPromociones = require('../controladores/controlador_promociones');

const router = express.Router();

// Aplica autenticación y solo permite Administradores
router.use(verificarToken, esAdministrador);

// PEDIDOS
// Obtener un pedido con detalles (pedido + items)
router.get('/pedidos/:id', ControladorPedidos.obtenerPedido);
// Cambiar estado de un pedido
router.put('/pedidos/:id/estado', ControladorPedidos.cambiarEstado);
// Listar todos los pedidos
router.get('/pedidos', ControladorPedidos.obtenerTodos);

// PRODUCTOS
// Listar todos los productos (solo Admin)
router.get('/productos', ControladorProductos.obtenerTodos);
// Crear producto
router.post('/productos', ControladorProductos.crearProducto);
// Actualizar producto
router.put('/productos/:id', ControladorProductos.actualizarProducto);
// Eliminar producto
router.delete('/productos/:id', ControladorProductos.eliminarProducto);

// IMÁGENES DE PRODUCTO
// Crear imagen de producto
router.post('/imagenes', ControladorImagenesProducto.crearImagenProducto);
// Actualizar imagen de producto
router.put('/imagenes/:id', ControladorImagenesProducto.actualizarImagenProducto);
// Eliminar imagen de producto
router.delete('/imagenes/:id', ControladorImagenesProducto.eliminarImagenProducto);

// CATEGORÍAS
// Crear categoría
router.post('/categorias', ControladorCategorias.crearCategoria);
// Actualizar categoría
router.put('/categorias/:id', ControladorCategorias.actualizarCategoria);
// Eliminar categoría
router.delete('/categorias/:id', ControladorCategorias.eliminarCategoria);

// CARRUSEL
// Crear imagen de carrusel
router.post('/carrusel',    ControladorCarrusel.crearImagenCarrusel);
// Actualizar imagen de carrusel
router.put('/carrusel/:id', ControladorCarrusel.actualizarImagenCarrusel);
// Eliminar imagen de carrusel
router.delete('/carrusel/:id', ControladorCarrusel.eliminarImagenCarrusel);

// USUARIOS
// Crear usuario
router.post('/usuarios', ControladorUsuarios.crearUsuario);
// Actualizar usuario
router.put('/usuarios/:id', ControladorUsuarios.actualizarUsuario);
// Eliminar usuario
router.delete('/usuarios/:id', ControladorUsuarios.eliminarUsuario);

// PROMOCIONES
// Crear promoción
router.post('/promociones', ControladorPromociones.crearPromocion);
// Actualizar promoción
router.put('/promociones/:id', ControladorPromociones.actualizarPromocion);
// Eliminar promoción
router.delete('/promociones/:id', ControladorPromociones.eliminarPromocion);

module.exports = router;