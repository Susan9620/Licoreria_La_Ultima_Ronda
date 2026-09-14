const Modelo_Reseñas = require('../modelos/modelo_reseñas');
const Modelo_Productos = require('../modelos/modelo_productos');

class Controlador_Reseñas {
  /**
   * POST /api/Reseñas/:ID_Producto
   * Insertar nueva reseña y actualizar calificación del producto
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

      // Insertar reseña
      await Modelo_Reseñas.Insertar_Reseñas({
        ID_Producto,
        ID_Usuario,
        Valoración,
      });

      // Recalcular promedio y total de Reseñas para ese producto
      const { Promedio, Total } = await Modelo_Reseñas.Obtener_Promedio_Y_Total(
        ID_Producto
      );

      // Actualizar producto
      await Modelo_Productos.Actualizar_Calificación_Y_Total(
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
   * GET /api/Reseñas/:ID_Producto
   * Obtener reseñas de un producto
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

      const Reseñas = await Modelo_Reseñas.Obtener_Reseñas_Por_Producto(
        ID_Producto
      );
      return res.status(200).json({
        Éxito: true,
        Datos: Reseñas,
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

module.exports = new Controlador_Reseñas();