const modeloReseñas = require('../modelos/modelo_reseñas');
const modeloProductos = require('../modelos/modelo_productos');

class ControladorReseñas {
  /**
   * POST /api/reseñas/:idProducto
   * Inserta una nueva reseña y actualiza la calificación del producto.
   */
  async insertarReseña(req, res) {
    try {
      const idProducto = parseInt(req.params.idProducto, 10);
      const { valoracion, idUsuario = null } = req.body;

      if (
        isNaN(idProducto) ||
        typeof valoracion !== 'number' ||
        valoracion < 1 ||
        valoracion > 5
      ) {
        return res.status(400).json({
          Éxito: false,
          Mensaje: 'Parámetros inválidos',
        });
      }

      // 1) Insertar la reseña en la tabla RESEÑAS
      await modeloReseñas.insertarReseña({
        idProducto,
        idUsuario,
        valoracion,
      });

      // 2) Recalcular promedio y total de reseñas para ese producto
      const { promedio, total } = await modeloReseñas.obtenerPromedioYTotal(
        idProducto
      );

      // 3) Actualizar ese producto en su propia tabla (PRODUCTOS)
      await modeloProductos.actualizarCalificacionYTotal(
        idProducto,
        promedio,
        total
      );

      return res.status(200).json({
        Éxito: true,
        Mensaje: 'Reseña registrada correctamente',
        Datos: { promedio, total },
      });
    } catch (error) {
      console.error('Error en insertarReseña:', error);
      return res.status(500).json({
        Éxito: false,
        Mensaje: 'Error al guardar la reseña',
      });
    }
  }

  /**
   * GET /api/reseñas/:idProducto
   * Obtiene todas las reseñas de un producto (opcional).
   */
  async obtenerReseñasPorProducto(req, res) {
    try {
      const idProducto = parseInt(req.params.idProducto, 10);
      if (isNaN(idProducto)) {
        return res.status(400).json({
          Éxito: false,
          Mensaje: 'ID de producto inválido',
        });
      }

      const reseñas = await modeloReseñas.obtenerReseñasPorProducto(
        idProducto
      );
      return res.status(200).json({
        Éxito: true,
        Datos: reseñas,
        Mensaje: 'Reseñas obtenidas correctamente',
      });
    } catch (error) {
      console.error('Error en obtenerReseñasPorProducto:', error);
      return res.status(500).json({
        Éxito: false,
        Mensaje: 'Error al obtener reseñas',
      });
    }
  }
}

module.exports = new ControladorReseñas();