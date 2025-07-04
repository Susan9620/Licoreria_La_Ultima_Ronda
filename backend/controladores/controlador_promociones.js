const modeloPromociones = require('../modelos/modelo_promociones');

/**
 * Controlador para gestionar las promociones
 */
class ControladorPromociones {
  /**
   * GET /api/promociones
   * Devuelve todas las promociones activas y vigentes
   */
  async obtenerPromociones(req, res) {
    try {
      const promociones = await modeloPromociones.obtenerPromocionesActivas();
      res.status(200).json({
        éxito: true,
        mensaje: 'Promociones obtenidas correctamente',
        datos: promociones
      });
    } catch (error) {
      console.error('Error en controlador de promociones:', error);
      res.status(500).json({
        éxito: false,
        mensaje: 'Error al obtener las promociones',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }

  /**
   * POST /api/admin/promociones
   * Crea una nueva promoción (solo Admin)
   */
  async crearPromocion(req, res) {
    try {
      const id = await modeloPromociones.crear(req.body);
      return res.status(201).json({
        éxito: true,
        mensaje: 'Promoción creada correctamente',
        datos: { idPromoción: id }
      });
    } catch (error) {
      console.error('Error al crear promoción:', error);
      return res.status(500).json({ éxito: false, mensaje: error.message });
    }
  }

  /**
   * PUT /api/admin/promociones/:id
   * Actualiza una promoción existente (solo Admin)
   */
  async actualizarPromocion(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ éxito: false, mensaje: 'ID inválido.' });
      }

      const filas = await modeloPromociones.actualizar(id, req.body);
      if (filas === 0) {
        return res.status(404).json({ éxito: false, mensaje: 'Promoción no encontrada.' });
      }

      return res.json({ éxito: true, mensaje: 'Promoción actualizada correctamente.' });
    } catch (error) {
      console.error('Error al actualizar promoción:', error);
      return res.status(500).json({ éxito: false, mensaje: error.message });
    }
  }

  /**
   * DELETE /api/admin/promociones/:id
   * Elimina una promoción (solo Admin)
   */
  async eliminarPromocion(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ éxito: false, mensaje: 'ID inválido.' });
      }

      const filas = await modeloPromociones.eliminar(id);
      if (filas === 0) {
        return res.status(404).json({ éxito: false, mensaje: 'Promoción no encontrada.' });
      }

      return res.json({ éxito: true, mensaje: 'Promoción eliminada correctamente.' });
    } catch (error) {
      console.error('Error al eliminar promoción:', error);
      return res.status(500).json({ éxito: false, mensaje: error.message });
    }
  }
}

module.exports = new ControladorPromociones();