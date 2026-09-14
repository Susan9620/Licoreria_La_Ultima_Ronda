const express = require('express');
const { Verificar_Token, Es_Administrador } = require('../middleware/middleware_autenticación');
const Controlador_Pedidos = require('../controladores/controlador_pedidos');
const Controlador_Productos = require('../controladores/controlador_productos');
const Controlador_Imágenes_Producto = require('../controladores/controlador_imágenes_producto');
const Controlador_Categorías = require('../controladores/controlador_categorías');
const ControladorCarrusel = require('../controladores/controlador_imágenes_carrusel');
const Controlador_Usuarios = require('../controladores/controlador_usuarios');
const Controlador_Promociones = require('../controladores/controlador_promociones');

const Ruta = express.Router();

// Aplicar autenticación y solo permitir Administradores
Ruta.use(Verificar_Token, Es_Administrador);

// PEDIDOS
/**
 * @route   POST /api/Contacto
 * @desc    Obtener un pedido con detalles
 */
Ruta.get('/Pedidos/:id', Controlador_Pedidos.Obtener_Pedido);
// Cambiar estado de un pedido
Ruta.put('/Pedidos/:id/Estado', Controlador_Pedidos.Cambiar_Estado);
// Listar todos los pedidos
Ruta.get('/Pedidos', Controlador_Pedidos.Obtener_Todos);

// PRODUCTOS
// Listar todos los productos (solo Administrador)
Ruta.get('/Productos', Controlador_Productos.Obtener_Todos);
// Crear producto
Ruta.post('/Productos', Controlador_Productos.Crear_Producto);
// Actualizar producto
Ruta.put('/Productos/:id', Controlador_Productos.Actualizar_Producto);
// Eliminar producto
Ruta.delete('/Productos/:id', Controlador_Productos.Eliminar_Producto);

// IMÁGENES DE PRODUCTO
// Crear imagen de producto
Ruta.post('/Imágenes', Controlador_Imágenes_Producto.Crear_Imagen_Producto);
// Actualizar imagen de producto
Ruta.put('/Imágenes/:id', Controlador_Imágenes_Producto.Actualizar_Imagen_Producto);
// Eliminar imagen de producto
Ruta.delete('/Imágenes/:id', Controlador_Imágenes_Producto.Eliminar_Imagen_Producto);

// CATEGORÍAS
// Crear categoría
Ruta.post('/Categorías', Controlador_Categorías.Crear_Categoría);
// Actualizar categoría
Ruta.put('/Categorías/:id', Controlador_Categorías.Actualizar_Categoría);
// Eliminar categoría
Ruta.delete('/Categorías/:id', Controlador_Categorías.Eliminar_Categoría);

// CARRUSEL
// Crear imagen de carrusel
Ruta.post('/Carrusel',    ControladorCarrusel.Crear_Imagen_Carrusel);
// Actualizar imagen de carrusel
Ruta.put('/Carrusel/:id', ControladorCarrusel.Actualizar_Imagen_Carrusel);
// Eliminar imagen de carrusel
Ruta.delete('/Carrusel/:id', ControladorCarrusel.Eliminar_Imagen_Carrusel);

// USUARIOS
// Crear usuario
Ruta.post('/Usuarios', Controlador_Usuarios.Crear_Usuario);
// Actualizar usuario
Ruta.put('/Usuarios/:id', Controlador_Usuarios.Actualizar_Usuario);
// Eliminar usuario
Ruta.delete('/Usuarios/:id', Controlador_Usuarios.Eliminar_Usuario);

// PROMOCIONES
// Crear promoción
Ruta.post('/Promociones', Controlador_Promociones.Crear_Promoción);
// Actualizar promoción
Ruta.put('/Promociones/:id', Controlador_Promociones.Actualizar_Promoción);
// Eliminar promoción
Ruta.delete('/Promociones/:id', Controlador_Promociones.Eliminar_Promoción);

module.exports = Ruta;