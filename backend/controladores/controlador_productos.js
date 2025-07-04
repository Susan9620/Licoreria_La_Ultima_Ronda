const modeloProductos = require('../modelos/modelo_productos');
const modeloReseñas = require('../modelos/modelo_reseñas');

/**
 * Controlador para gestionar productos (destacados y todos)
 */
class ControladorProductos {
  /**
   * Obtiene todos los productos marcados como destacados
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async obtenerProductosDestacados(req, res) {
    try {
      // Obtener el límite del parámetro de consulta o usar el valor predeterminado
      const limite = req.query.limite ? parseInt(req.query.limite) : 4;
      const productos = await modeloProductos.obtenerProductosDestacados(limite);

      res.status(200).json({
        éxito: true,
        mensaje: 'Productos destacados obtenidos correctamente',
        datos: productos
      });
    } catch (error) {
      console.error('Error en controlador de productos destacados:', error);
      res.status(500).json({
        éxito: false,
        mensaje: 'Error al obtener los productos destacados',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }

  /**
     * GET /api/productos/all
     * Obtiene todos los productos activos
     */
  async obtenerTodos(req, res) {
    try {
      const productos = await modeloProductos.obtenerTodos();
      res.status(200).json({
        éxito: true,
        mensaje: 'Todos los productos obtenidos correctamente',
        datos: productos
      });
    } catch (error) {
      console.error('Error en controlador de todos los productos:', error);
      res.status(500).json({
        éxito: false,
        mensaje: 'Error al obtener todos los productos',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }

  /**
   * GET /api/productos/:id
   * Devuelve un producto por su ID
   */
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const producto = await modeloProductos.obtenerPorId(id);

      if (!producto) {
        return res.status(404).json({
          éxito: false,
          mensaje: 'Producto no encontrado'
        });
      }

      res.status(200).json({
        éxito: true,
        mensaje: 'Producto obtenido correctamente',
        datos: producto
      });
    } catch (error) {
      console.error('Error en controlador de producto por ID:', error);
      res.status(500).json({
        éxito: false,
        mensaje: 'Error al obtener el producto',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }

  /**
   * GET /api/productos/:id/compradosjuntos
   * Devuelve hasta 4 productos que suelen comprarse junto a la variante predeterminada
   */
  async obtenerCompradosJuntos(req, res) {
    try {
      const idProducto = parseInt(req.params.id, 10);
      if (isNaN(idProducto)) {
        return res.status(400).json({ éxito: false, mensaje: 'ID de producto inválido' });
      }

      // 1) Obtener el producto y su variante predeterminada
      const prod = await modeloProductos.obtenerPorId(idProducto);
      if (!prod || !prod.ID_Variante) {
        return res
          .status(404)
          .json({ éxito: false, mensaje: 'Producto o variante predeterminada no encontrada' });
      }
      const idVariantePred = prod.ID_Variante;

      // 2) Llamar al modelo para obtener los “comprados juntos”
      //    (En modelo_producto.js deberás implementar `obtenerProductosCompradosJuntos`)
      const filas = await modeloProductos.obtenerProductosCompradosJuntos(idVariantePred, 4);

      return res.json({ éxito: true, datos: filas });
    } catch (error) {
      console.error('Error en obtenerCompradosJuntos:', error);
      return res.status(500).json({
        éxito: false,
        mensaje: 'Error al obtener productos comprados juntos'
      });
    }
  }

  /**
   * POST /api/productos/:id/calificar
   * Inserta una valoración en la tabla RESEÑAS y actualiza la calificación media y total de reseñas en PRODUCTOS.
   */
  async calificarProducto(req, res) {
    try {
      const idProducto = parseInt(req.params.id, 10);
      const { calificacion } = req.body;

      if (isNaN(idProducto) || typeof calificacion !== 'number' || calificacion < 1 || calificacion > 5) {
        return res.status(400).json({ éxito: false, mensaje: 'Parámetros inválidos' });
      }

      // ¡Aquí!: extrae el usuario YA VERIFICADO
      const idUsuario = req.usuario?.id;
      if (!idUsuario) {
        return res.status(401).json({ éxito: false, mensaje: 'Usuario no autenticado' });
      }

      // 1) Insertar la reseña
      await modeloReseñas.insertarReseña({ idProducto, idUsuario, valoracion: calificacion });

      // 2) Recalcular y 3) actualizar
      const { promedio, total } = await modeloReseñas.obtenerPromedioYTotal(idProducto);
      await modeloProductos.actualizarCalificacionYTotal(idProducto, promedio, total);

      return res.status(200).json({
        éxito: true,
        mensaje: 'Calificación registrada correctamente',
        datos: { promedio, total }
      });
    } catch (error) {
      console.error('Error en calificarProducto:', error);
      res.status(500).json({ éxito: false, mensaje: 'Error al guardar la calificación' });
    }
  }

  /**
 * GET /api/productos/:id/calificacion
 * Devuelve la valoración que este usuario dio (o null si no valoró)
 */
  async obtenerCalificacionUsuario(req, res) {
    try {
      const idProducto = parseInt(req.params.id, 10);
      const idUsuario = req.usuario.id;
      const fila = await modeloReseñas.obtenerCalificacionUsuario(idProducto, idUsuario);
      // fila puede ser { Valoración: 4 } o undefined
      return res.json({ éxito: true, datos: fila ? fila.Valoración : null });
    } catch (error) {
      console.error('Error en obtenerCalificacionUsuario:', error);
      return res.status(500).json({ éxito: false, mensaje: 'Error al obtener calificación' });
    }
  }

  /**
 * POST /api/admin/productos
 * Crea un nuevo producto (solo Admin)
 */
  async crearProducto(req, res) {
    try {
      const datos = req.body;
      const nuevoId = await modeloProductos.crear(datos);
      return res.status(201).json({
        éxito: true,
        mensaje: 'Producto creado correctamente',
        datos: { idProducto: nuevoId }
      });
    } catch (error) {
      console.error('Error al crear producto:', error);
      // Temporal: enviamos el mensaje real al cliente para depurar
      return res.status(500).json({ éxito: false, mensaje: error.message });
    }
  }

  /**
   * PUT /api/admin/productos/:id
   * Actualiza un producto existente (solo Admin)
   */
  async actualizarProducto(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const cambios = req.body;
      const filas = await modeloProductos.actualizar(id, cambios);
      if (filas === 0) {
        return res.status(404).json({ éxito: false, mensaje: 'Producto no encontrado.' });
      }
      return res.json({ éxito: true, mensaje: 'Producto actualizado correctamente.' });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      return res.status(500).json({ éxito: false, mensaje: 'Error del servidor.' });
    }
  }

  /**
   * DELETE /api/admin/productos/:id
   * Elimina un producto (solo Admin)
   */
  async eliminarProducto(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const filas = await modeloProductos.eliminar(id);
      if (filas === 0) {
        return res.status(404).json({ éxito: false, mensaje: 'Producto no encontrado.' });
      }
      return res.json({ éxito: true, mensaje: 'Producto eliminado correctamente.' });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      return res.status(500).json({ éxito: false, mensaje: 'Error del servidor.' });
    }
  }
}

module.exports = new ControladorProductos();