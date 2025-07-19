const express = require('express');
const { verificarToken, esAdministrador } = require('../middleware/middleware_autenticación');
const ControladorPedidos = require('../controladores/controlador_pedidos');
const ControladorProductos = require('../controladores/controlador_productos');
const ControladorImagenesProducto = require('../controladores/controlador_imágenes_producto');
const Controlador_Categorías = require('../controladores/controlador_categorías');
const ControladorCarrusel = require('../controladores/controlador_imágenes_carrusel');
const ControladorUsuarios = require('../controladores/controlador_usuarios');
const ControladorPromociones = require('../controladores/controlador_promociones');

const router = express.Router();

// Aplica autenticación y solo permite Administradores
router.use(verificarToken, esAdministrador);

// PEDIDOS
// Obtener un pedido con detalles (pedido + items)
router.get('/pedidos/:ID', ControladorPedidos.obtenerPedido);
// Cambiar estado de un pedido
router.put('/pedidos/:ID/estado', ControladorPedidos.cambiarEstado);
// Listar todos los pedidos
router.get('/pedidos', ControladorPedidos.obtenerTodos);

// PRODUCTOS
// Listar todos los productos (solo Admin)
router.get('/productos', ControladorProductos.obtenerTodos);
// Crear producto
router.post('/productos', ControladorProductos.crearProducto);
// Actualizar producto
router.put('/productos/:ID', ControladorProductos.actualizarProducto);
// Eliminar producto
router.delete('/productos/:ID', ControladorProductos.eliminarProducto);

// IMÁGENES DE PRODUCTO
// Crear imagen de producto
router.post('/imagenes', ControladorImagenesProducto.crearImagenProducto);
// Actualizar imagen de producto
router.put('/imagenes/:ID', ControladorImagenesProducto.actualizarImagenProducto);
// Eliminar imagen de producto
router.delete('/imagenes/:ID', ControladorImagenesProducto.eliminarImagenProducto);

// CATEGORÍAS
// Crear categoría
router.post('/Categorías', Controlador_Categorías.Crear_Categoría);
// Actualizar categoría
router.put('/Categorías/:ID', Controlador_Categorías.actualizarCategoria);
// Eliminar categoría
router.delete('/Categorías/:ID', Controlador_Categorías.eliminarCategoria);

// CARRUSEL
// Crear imagen de carrusel
router.post('/carrusel',    ControladorCarrusel.crearImagenCarrusel);
// Actualizar imagen de carrusel
router.put('/carrusel/:ID', ControladorCarrusel.actualizarImagenCarrusel);
// Eliminar imagen de carrusel
router.delete('/carrusel/:ID', ControladorCarrusel.eliminarImagenCarrusel);

// USUARIOS
// Crear usuario
router.post('/usuarios', ControladorUsuarios.crearUsuario);
// Actualizar usuario
router.put('/usuarios/:ID', ControladorUsuarios.actualizarUsuario);
// Eliminar usuario
router.delete('/usuarios/:ID', ControladorUsuarios.eliminarUsuario);

// PROMOCIONES
// Crear promoción
router.post('/promociones', ControladorPromociones.crearPromocion);
// Actualizar promoción
router.put('/promociones/:ID', ControladorPromociones.actualizarPromocion);
// Eliminar promoción
router.delete('/promociones/:ID', ControladorPromociones.eliminarPromocion);

module.exports = router;