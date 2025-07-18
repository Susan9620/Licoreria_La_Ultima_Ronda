const modeloImagenesCarrusel = require('../modelos/modelo_imágenes_carrusel');

/**
 * Controlador para gestionar las imágenes del carrusel
 */
class ControladorImagenesCarrusel {
  /**
   * Obtiene todas las imágenes activas del carrusel
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async obtenerImagenesCarrusel(req, res) {
    try {
      const imagenes = await modeloImagenesCarrusel.obtenerImagenesCarrusel();

      res.status(200).json({
        éxito: true,
        mensaje: 'Imágenes del carrusel obtenidas correctamente',
        Datos: imagenes
      });
    } catch (error) {
      console.error('Error en controlador de imágenes carrusel:', error);
      res.status(500).json({
        éxito: false,
        mensaje: 'Error al obtener las imágenes del carrusel',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }

  /**
   * Obtiene una imagen específica del carrusel por su ID
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async obtenerImagenPorId(req, res) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          éxito: false,
          mensaje: 'ID de imagen inválido'
        });
      }

      const imagen = await modeloImagenesCarrusel.obtenerImagenPorId(id);

      if (!imagen) {
        return res.status(404).json({
          éxito: false,
          mensaje: `No se encontró la imagen con ID ${id}`
        });
      }

      res.status(200).json({
        éxito: true,
        mensaje: 'Imagen del carrusel obtenida correctamente',
        Datos: imagen
      });
    } catch (error) {
      console.error(`Error al obtener imagen del carrusel:`, error);
      res.status(500).json({
        éxito: false,
        mensaje: 'Error al obtener la imagen del carrusel',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }

  async crearImagenCarrusel(req, res) {
    try {
      const id = await modeloImagenesCarrusel.crear(req.body);
      return res.status(201).json({
        éxito: true,
        mensaje: 'Imagen de carrusel creada correctamente',
        Datos: { idImagen: id }
      });
    } catch (error) {
      console.error('Error al crear imagen de carrusel:', error);
      return res.status(500).json({ éxito: false, mensaje: error.message });
    }
  }

  /**
   * PUT /api/admin/carrusel/:id
   * Actualiza una imagen de carrusel (solo Admin)
   */
  async actualizarImagenCarrusel(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ éxito: false, mensaje: 'ID inválido.' });
      }

      const filas = await modeloImagenesCarrusel.actualizar(id, req.body);
      if (filas === 0) {
        return res.status(404).json({ éxito: false, mensaje: 'Imagen no encontrada.' });
      }

      return res.json({ éxito: true, mensaje: 'Imagen de carrusel actualizada correctamente.' });
    } catch (error) {
      console.error('Error al actualizar imagen de carrusel:', error);
      return res.status(500).json({ éxito: false, mensaje: error.message });
    }
  }

  /**
   * DELETE /api/admin/carrusel/:id
   * Elimina una imagen de carrusel (solo Admin)
   */
  async eliminarImagenCarrusel(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ éxito: false, mensaje: 'ID inválido.' });
      }

      const filas = await modeloImagenesCarrusel.eliminar(id);
      if (filas === 0) {
        return res.status(404).json({ éxito: false, mensaje: 'Imagen no encontrada.' });
      }

      return res.json({ éxito: true, mensaje: 'Imagen de carrusel eliminada correctamente.' });
    } catch (error) {
      console.error('Error al eliminar imagen de carrusel:', error);
      return res.status(500).json({ éxito: false, mensaje: error.message });
    }
  }
}

module.exports = new ControladorImagenesCarrusel();