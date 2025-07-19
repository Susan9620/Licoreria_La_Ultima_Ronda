const Modelo_Categorías = require('../modelos/modelo_categorías');

/**
 * Controlador para gestionar las categorías
 */
class Controlador_Categorías {
  /**
   * GET /api/Categorías
   * Devuelve todas las categorías activas
   */
  async Obtener_Categorías(req, res) {
    try {
      const Categorías = await Modelo_Categorías.Obtener_Categorías();
      res.status(200).json({
        Éxito: true,
        Mensaje: 'Categorías obtenidas correctamente',
        Datos: Categorías
      });
    } catch (error) {
      console.error('Error en controlador de categorías:', error);
      res.status(500).json({
        Éxito: false,
        Mensaje: 'Error al obtener las categorías',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }

  /**
   * POST /api/admin/Categorías
   * Crea una nueva categoría (solo Admin)
   */
  async Crear_Categoría(req, res) {
    try {
      const Datos = req.body; 
      const ID = await Modelo_Categorías.crear(Datos);
      return res.status(201).json({
        Éxito: true,
        Mensaje: 'Categoría creada correctamente',
        Datos: { IDCategoria: ID }
      });
    } catch (error) {
      console.error('Error al crear categoría:', error);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error interno del servidor.' });
    }
  }

  /**
   * PUT /api/admin/Categorías/:ID
   * Actualiza una categoría existente (solo Admin)
   */
  async actualizarCategoria(req, res) {
    try {
      const ID = parseInt(req.params.id, 10);
      const cambios = req.body;
      const filas = await Modelo_Categorías.actualizar(ID, cambios);
      if (filas === 0) {
        return res.status(404).json({ Éxito: false, Mensaje: 'Categoría no encontrada.' });
      }
      return res.json({ Éxito: true, Mensaje: 'Categoría actualizada correctamente.' });
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error interno del servidor.' });
    }
  }

  /**
   * DELETE /api/admin/Categorías/:ID
   * Elimina una categoría (solo Admin)
   */
  async eliminarCategoria(req, res) {
    try {
      const ID = parseInt(req.params.id, 10);
      const filas = await Modelo_Categorías.eliminar(ID);
      if (filas === 0) {
        return res.status(404).json({ Éxito: false, Mensaje: 'Categoría no encontrada.' });
      }
      return res.json({ Éxito: true, Mensaje: 'Categoría eliminada correctamente.' });
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error interno del servidor.' });
    }
  }
}

module.exports = new Controlador_Categorías();