const Modelo_Productos = require('../modelos/modelo_productos');
const Modelo_Reseñas = require('../modelos/modelo_reseñas');


class Controlador_Productos {
  /**
   * Obtener productos marcados como destacados
   * @param {Object} req
   * @param {Object} res
   */
  async Obtener_Productos_Destacados(req, res) {
    try {
      const Límite = req.query.Límite ? parseInt(req.query.Límite) : 4;
      const Productos = await Modelo_Productos.Obtener_Productos_Destacados(Límite);

      res.status(200).json({
        Éxito: true,
        Mensaje: 'Productos destacados obtenidos correctamente',
        Datos: Productos
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
     * GET /api/Productos/all
     * Obtener productos activos
     */
  async Obtener_Todos(req, res) {
    try {
      const Productos = await Modelo_Productos.Obtener_Todos();
      res.status(200).json({
        Éxito: true,
        Mensaje: 'Todos los productos obtenidos correctamente',
        Datos: Productos
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
   * GET /api/Productos/:id
   * Obtener producto por su ID
   */
  async Obtener_Por_ID(req, res) {
    try {
      const { id } = req.params;
      const Producto = await Modelo_Productos.Obtener_Por_ID(id);

      if (!Producto) {
        return res.status(404).json({
          Éxito: false,
          Mensaje: 'Producto no encontrado'
        });
      }

      res.status(200).json({
        Éxito: true,
        Mensaje: 'Producto obtenido correctamente',
        Datos: Producto
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
   * GET /api/Productos/:id/Comprados_Juntos
   * Obtener productos que suelen comprarse junto a la variante predeterminada
   */
  async Obtener_Comprados_Juntos(req, res) {
    try {
      const ID_Producto = parseInt(req.params.id, 10);
      if (isNaN(ID_Producto)) {
        return res.status(400).json({ Éxito: false, Mensaje: 'ID de producto inválido' });
      }

      // Obtener el producto y su variante predeterminada
      const Producto_Variante = await Modelo_Productos.Obtener_Por_ID(ID_Producto);
      if (!Producto_Variante || !Producto_Variante.ID_Variante) {
        return res
          .status(404)
          .json({ Éxito: false, Mensaje: 'Producto o variante predeterminada no encontrada' });
      }
      const ID_Variante_Predetarminada = Producto_Variante.ID_Variante;

      // Llamar al modelo para obtener los productos “comprados juntos”
      const Filas = await Modelo_Productos.Obtener_Productos_Comprados_Juntos(ID_Variante_Predetarminada, 4);

      return res.json({ Éxito: true, Datos: Filas });
    } catch (error) {
      console.error('Error en Obtener_Comprados_Juntos:', error);
      return res.status(500).json({
        Éxito: false,
        Mensaje: 'Error al obtener productos comprados juntos'
      });
    }
  }

  /**
   * POST /api/Productos/:id/calificar
   * Insertar una valoración y actualizar la calificación media y total de reseñas
   */
  async calificarProducto(req, res) {
    try {
      const ID_Producto = parseInt(req.params.id, 10);
      const { Calificación } = req.body;

      if (isNaN(ID_Producto) || typeof Calificación !== 'number' || Calificación < 1 || Calificación > 5) {
        return res.status(400).json({ Éxito: false, Mensaje: 'Parámetros inválidos' });
      }

      // Extraer el usuario verificado
      const ID_Usuario = req.Usuario?.id;
      if (!ID_Usuario) {
        return res.status(401).json({ Éxito: false, Mensaje: 'Usuario no autenticado' });
      }

      // Insertar la reseña
      await Modelo_Reseñas.Insertar_Reseñas({ ID_Producto, ID_Usuario, Valoración: Calificación });

      // Recalcular y actualizar
      const { Promedio, Total } = await Modelo_Reseñas.Obtener_Promedio_Y_Total(ID_Producto);
      await Modelo_Productos.Actualizar_Calificación_Y_Total(ID_Producto, Promedio, Total);

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
 * GET /api/Productos/:id/Calificación
 * Obtener la valoración del usuario
 */
  async Obtener_Calificación_Usuario(req, res) {
    try {
      const ID_Producto = parseInt(req.params.id, 10);
      const ID_Usuario = req.Usuario.id;
      const Fila = await Modelo_Reseñas.Obtener_Calificación_Usuario(ID_Producto, ID_Usuario);
      return res.json({ Éxito: true, Datos: Fila ? Fila.Valoración : null });
    } catch (error) {
      console.error('Error en Obtener_Calificación_Usuario:', error);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error al obtener calificación' });
    }
  }

  /**
 * POST /api/Administrador/Productos
 * Crear nuevo producto (solo Administrador)
 */
  async Crear_Producto(req, res) {
    try {
      const Datos = req.body;
      const Nuevo_ID = await Modelo_Productos.Crear(Datos);
      return res.status(201).json({
        Éxito: true,
        Mensaje: 'Producto creado correctamente',
        Datos: { ID_Producto: Nuevo_ID }
      });
    } catch (error) {
      console.error('Error al crear producto:', error);
      return res.status(500).json({ Éxito: false, Mensaje: error.message });
    }
  }

  /**
   * PUT /api/Administrador/Productos/:id
   * Actualizar producto existente (solo Administrador)
   */
  async Actualizar_Producto(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const Cambios = req.body;
      const Filas = await Modelo_Productos.Actualizar(id, Cambios);
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
   * DELETE /api/Administrador/Productos/:id
   * Eliminar producto (solo Administrador)
   */
  async Eliminar_Producto(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const Filas = await Modelo_Productos.Eliminar(id);
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

module.exports = new Controlador_Productos();