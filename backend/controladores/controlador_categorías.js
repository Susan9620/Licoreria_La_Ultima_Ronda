const modeloCategorias = require('../modelos/modelo_categorías');

/**
 * Controlador para gestionar las categorías
 */
class ControladorCategorias {
  /**
   * GET /api/categorias
   * Devuelve todas las categorías activas
   */
  async obtenerCategorias(req, res) {
    try {
      const categorias = await modeloCategorias.obtenerCategorias();
      res.status(200).json({
        éxito: true,
        mensaje: 'Categorías obtenidas correctamente',
        Datos: categorias
      });
    } catch (error) {
      console.error('Error en controlador de categorías:', error);
      res.status(500).json({
        éxito: false,
        mensaje: 'Error al obtener las categorías',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }

  /**
   * POST /api/admin/categorias
   * Crea una nueva categoría (solo Admin)
   */
  async crearCategoria(req, res) {
    try {
      const Datos = req.body; 
      const id = await modeloCategorias.crear(Datos);
      return res.status(201).json({
        éxito: true,
        mensaje: 'Categoría creada correctamente',
        Datos: { idCategoria: id }
      });
    } catch (error) {
      console.error('Error al crear categoría:', error);
      return res.status(500).json({ éxito: false, mensaje: 'Error interno del servidor.' });
    }
  }

  /**
   * PUT /api/admin/categorias/:id
   * Actualiza una categoría existente (solo Admin)
   */
  async actualizarCategoria(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const cambios = req.body;
      const filas = await modeloCategorias.actualizar(id, cambios);
      if (filas === 0) {
        return res.status(404).json({ éxito: false, mensaje: 'Categoría no encontrada.' });
      }
      return res.json({ éxito: true, mensaje: 'Categoría actualizada correctamente.' });
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      return res.status(500).json({ éxito: false, mensaje: 'Error interno del servidor.' });
    }
  }

  /**
   * DELETE /api/admin/categorias/:id
   * Elimina una categoría (solo Admin)
   */
  async eliminarCategoria(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const filas = await modeloCategorias.eliminar(id);
      if (filas === 0) {
        return res.status(404).json({ éxito: false, mensaje: 'Categoría no encontrada.' });
      }
      return res.json({ éxito: true, mensaje: 'Categoría eliminada correctamente.' });
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      return res.status(500).json({ éxito: false, mensaje: 'Error interno del servidor.' });
    }
  }
}

module.exports = new ControladorCategorias();