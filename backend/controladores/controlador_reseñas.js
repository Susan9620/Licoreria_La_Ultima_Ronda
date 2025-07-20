const modeloReseñas = require('../modelos/modelo_reseñas');
const modeloProductos = require('../modelos/modelo_productos');

class ControladorReseñas {
  /**
   * POST /api/reseñas/:ID_Producto
   * Inserta una nueva reseña y actualiza la calificación del producto.
   */
  async Insertar_Reseñas(req, res) {
    try {
      const ID_Producto = parseInt(req.params.ID_Producto, 10);
      const { Valoración, ID_Usuario = null } = req.body;

      if (
        isNaN(ID_Producto) ||
        typeof Valoración !== 'number' ||
        Valoración < 1 ||
        Valoración > 5
      ) {
        return res.status(400).json({
          Éxito: false,
          Mensaje: 'Parámetros inválidos',
        });
      }

      // 1) Insertar la reseña en la tabla RESEÑAS
      await modeloReseñas.Insertar_Reseñas({
        ID_Producto,
        ID_Usuario,
        Valoración,
      });

      // 2) Recalcular promedio y total de reseñas para ese producto
      const { Promedio, Total } = await modeloReseñas.Obtener_Promedio_Y_Total(
        ID_Producto
      );

      // 3) Actualizar ese producto en su propia tabla (PRODUCTOS)
      await modeloProductos.Actualizar_Calificación_Y_Total(
        ID_Producto,
        Promedio,
        Total
      );

      return res.status(200).json({
        Éxito: true,
        Mensaje: 'Reseña registrada correctamente',
        Datos: { Promedio, Total },
      });
    } catch (error) {
      console.error('Error en Insertar_Reseñas:', error);
      return res.status(500).json({
        Éxito: false,
        Mensaje: 'Error al guardar la reseña',
      });
    }
  }

  /**
   * GET /api/reseñas/:ID_Producto
   * Obtiene todas las reseñas de un producto (opcional).
   */
  async Obtener_Reseñas_Por_Producto(req, res) {
    try {
      const ID_Producto = parseInt(req.params.ID_Producto, 10);
      if (isNaN(ID_Producto)) {
        return res.status(400).json({
          Éxito: false,
          Mensaje: 'ID de producto inválido',
        });
      }

      const reseñas = await modeloReseñas.Obtener_Reseñas_Por_Producto(
        ID_Producto
      );
      return res.status(200).json({
        Éxito: true,
        Datos: reseñas,
        Mensaje: 'Reseñas obtenidas correctamente',
      });
    } catch (error) {
      console.error('Error en Obtener_Reseñas_Por_Producto:', error);
      return res.status(500).json({
        Éxito: false,
        Mensaje: 'Error al obtener reseñas',
      });
    }
  }
}

module.exports = new ControladorReseñas();