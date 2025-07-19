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
  async Obtener_Imágenes_Carrusel(req, res) {
    try {
      const imagenes = await modeloImagenesCarrusel.Obtener_Imágenes_Carrusel();

      res.status(200).json({
        Éxito: true,
        Mensaje: 'Imágenes del carrusel obtenidas correctamente',
        Datos: imagenes
      });
    } catch (error) {
      console.error('Error en controlador de imágenes carrusel:', error);
      res.status(500).json({
        Éxito: false,
        Mensaje: 'Error al obtener las imágenes del carrusel',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }

  /**
   * Obtiene una imagen específica del carrusel por su ID
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async Obtener_Imagen_ID(req, res) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          Éxito: false,
          Mensaje: 'ID de imagen inválido'
        });
      }

      const Imagen = await modeloImagenesCarrusel.Obtener_Imagen_ID(id);

      if (!Imagen) {
        return res.status(404).json({
          Éxito: false,
          Mensaje: `No se encontró la imagen con ID ${id}`
        });
      }

      res.status(200).json({
        Éxito: true,
        Mensaje: 'Imagen del carrusel obtenida correctamente',
        Datos: Imagen
      });
    } catch (error) {
      console.error(`Error al obtener imagen del carrusel:`, error);
      res.status(500).json({
        Éxito: false,
        Mensaje: 'Error al obtener la imagen del carrusel',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }

  async crearImagenCarrusel(req, res) {
    try {
      const id = await modeloImagenesCarrusel.Crear(req.body);
      return res.status(201).json({
        Éxito: true,
        Mensaje: 'Imagen de carrusel creada correctamente',
        Datos: { ID_Imagen: id }
      });
    } catch (error) {
      console.error('Error al crear imagen de carrusel:', error);
      return res.status(500).json({ Éxito: false, Mensaje: error.message });
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
        return res.status(400).json({ Éxito: false, Mensaje: 'ID inválido.' });
      }

      const Filas = await modeloImagenesCarrusel.Actualizar(id, req.body);
      if (Filas === 0) {
        return res.status(404).json({ Éxito: false, Mensaje: 'Imagen no encontrada.' });
      }

      return res.json({ Éxito: true, Mensaje: 'Imagen de carrusel actualizada correctamente.' });
    } catch (error) {
      console.error('Error al actualizar imagen de carrusel:', error);
      return res.status(500).json({ Éxito: false, Mensaje: error.message });
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
        return res.status(400).json({ Éxito: false, Mensaje: 'ID inválido.' });
      }

      const Filas = await modeloImagenesCarrusel.Eliminar(id);
      if (Filas === 0) {
        return res.status(404).json({ Éxito: false, Mensaje: 'Imagen no encontrada.' });
      }

      return res.json({ Éxito: true, Mensaje: 'Imagen de carrusel eliminada correctamente.' });
    } catch (error) {
      console.error('Error al eliminar imagen de carrusel:', error);
      return res.status(500).json({ Éxito: false, Mensaje: error.message });
    }
  }
}

module.exports = new ControladorImagenesCarrusel();