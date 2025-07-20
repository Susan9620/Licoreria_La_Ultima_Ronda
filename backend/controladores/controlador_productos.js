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
  async Obtener_Productos_Destacados(req, res) {
    try {
      // Obtener el límite del parámetro de consulta o usar el valor predeterminado
      const Límite = req.query.Límite ? parseInt(req.query.Límite) : 4;
      const productos = await modeloProductos.Obtener_Productos_Destacados(Límite);

      res.status(200).json({
        Éxito: true,
        Mensaje: 'Productos destacados obtenidos correctamente',
        Datos: productos
      });
    } catch (error) {
      console.error('Error en controlador de productos destacados:', error);
      res.status(500).json({
        Éxito: false,
        Mensaje: 'Error al obtener los productos destacados',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }

  /**
     * GET /api/productos/all
     * Obtiene todos los productos activos
     */
  async Obtener_Todos(req, res) {
    try {
      const productos = await modeloProductos.Obtener_Todos();
      res.status(200).json({
        Éxito: true,
        Mensaje: 'Todos los productos obtenidos correctamente',
        Datos: productos
      });
    } catch (error) {
      console.error('Error en controlador de todos los productos:', error);
      res.status(500).json({
        Éxito: false,
        Mensaje: 'Error al obtener todos los productos',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }

  /**
   * GET /api/productos/:id
   * Devuelve un producto por su ID
   */
  async Obtener_Por_ID(req, res) {
    try {
      const { id } = req.params;
      const producto = await modeloProductos.Obtener_Por_ID(id);

      if (!producto) {
        return res.status(404).json({
          Éxito: false,
          Mensaje: 'Producto no encontrado'
        });
      }

      res.status(200).json({
        Éxito: true,
        Mensaje: 'Producto obtenido correctamente',
        Datos: producto
      });
    } catch (error) {
      console.error('Error en controlador de producto por ID:', error);
      res.status(500).json({
        Éxito: false,
        Mensaje: 'Error al obtener el producto',
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
      const ID_Producto = parseInt(req.params.id, 10);
      if (isNaN(ID_Producto)) {
        return res.status(400).json({ Éxito: false, Mensaje: 'ID de producto inválido' });
      }

      // 1) Obtener el producto y su variante predeterminada
      const prod = await modeloProductos.Obtener_Por_ID(ID_Producto);
      if (!prod || !prod.ID_Variante) {
        return res
          .status(404)
          .json({ Éxito: false, Mensaje: 'Producto o variante predeterminada no encontrada' });
      }
      const idVariantePred = prod.ID_Variante;

      // 2) Llamar al modelo para obtener los “comprados juntos”
      const Filas = await modeloProductos.Obtener_Productos_Comprados_Juntos(idVariantePred, 4);

      return res.json({ Éxito: true, Datos: Filas });
    } catch (error) {
      console.error('Error en obtenerCompradosJuntos:', error);
      return res.status(500).json({
        Éxito: false,
        Mensaje: 'Error al obtener productos comprados juntos'
      });
    }
  }

  /**
   * POST /api/productos/:id/calificar
   * Inserta una valoración en la tabla RESEÑAS y actualiza la calificación media y total de reseñas en PRODUCTOS.
   */
  async calificarProducto(req, res) {
    try {
      const ID_Producto = parseInt(req.params.id, 10);
      const { calificacion } = req.body;

      if (isNaN(ID_Producto) || typeof calificacion !== 'number' || calificacion < 1 || calificacion > 5) {
        return res.status(400).json({ Éxito: false, Mensaje: 'Parámetros inválidos' });
      }

      // ¡Aquí!: extrae el usuario YA VERIFICADO
      const ID_Usuario = req.usuario?.id;
      if (!ID_Usuario) {
        return res.status(401).json({ Éxito: false, Mensaje: 'Usuario no autenticado' });
      }

      // 1) Insertar la reseña
      await modeloReseñas.Insertar_Reseñas({ ID_Producto, ID_Usuario, Valoración: calificacion });

      // 2) Recalcular y 3) actualizar
      const { Promedio, Total } = await modeloReseñas.Obtener_Promedio_Y_Total(ID_Producto);
      await modeloProductos.Actualizar_Calificación_Y_Total(ID_Producto, Promedio, Total);

      return res.status(200).json({
        Éxito: true,
        Mensaje: 'Calificación registrada correctamente',
        Datos: { Promedio, Total }
      });
    } catch (error) {
      console.error('Error en calificarProducto:', error);
      res.status(500).json({ Éxito: false, Mensaje: 'Error al guardar la calificación' });
    }
  }

  /**
 * GET /api/productos/:id/calificacion
 * Devuelve la valoración que este usuario dio (o null si no valoró)
 */
  async Obtener_Calificación_Usuario(req, res) {
    try {
      const ID_Producto = parseInt(req.params.id, 10);
      const ID_Usuario = req.usuario.id;
      const fila = await modeloReseñas.Obtener_Calificación_Usuario(ID_Producto, ID_Usuario);
      // fila puede ser { Valoración: 4 } o undefined
      return res.json({ Éxito: true, Datos: fila ? fila.Valoración : null });
    } catch (error) {
      console.error('Error en Obtener_Calificación_Usuario:', error);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error al obtener calificación' });
    }
  }

  /**
 * POST /api/admin/productos
 * Crea un nuevo producto (solo Admin)
 */
  async crearProducto(req, res) {
    try {
      const Datos = req.body;
      const nuevoId = await modeloProductos.Crear(Datos);
      return res.status(201).json({
        Éxito: true,
        Mensaje: 'Producto creado correctamente',
        Datos: { ID_Producto: nuevoId }
      });
    } catch (error) {
      console.error('Error al crear producto:', error);
      // Temporal: enviamos el mensaje real al cliente para depurar
      return res.status(500).json({ Éxito: false, Mensaje: error.message });
    }
  }

  /**
   * PUT /api/admin/productos/:id
   * Actualiza un producto existente (solo Admin)
   */
  async actualizarProducto(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const Cambios = req.body;
      const Filas = await modeloProductos.Actualizar(id, Cambios);
      if (Filas === 0) {
        return res.status(404).json({ Éxito: false, Mensaje: 'Producto no encontrado.' });
      }
      return res.json({ Éxito: true, Mensaje: 'Producto actualizado correctamente.' });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error del servidor.' });
    }
  }

  /**
   * DELETE /api/admin/productos/:id
   * Elimina un producto (solo Admin)
   */
  async eliminarProducto(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const Filas = await modeloProductos.Eliminar(id);
      if (Filas === 0) {
        return res.status(404).json({ Éxito: false, Mensaje: 'Producto no encontrado.' });
      }
      return res.json({ Éxito: true, Mensaje: 'Producto eliminado correctamente.' });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error del servidor.' });
    }
  }
}

module.exports = new ControladorProductos();