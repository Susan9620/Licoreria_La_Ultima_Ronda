const { pool } = require('../configuraciones/configuraciones_bd');

/**
 * Modelo para gestionar las imágenes del carrusel en PostgreSQL
 */
class ModeloImagenesCarrusel {
  /**
   * Obtiene todas las imágenes activas del carrusel ordenadas por el campo Orden
   * @returns {Promise<Array>} - Lista de imágenes del carrusel
   */
  async obtenerImagenesCarrusel() {
    try {
      const Resultado = await pool.query(`
        SELECT 
          "ID_Imagen", 
          "Título", 
          "Subtítulo", 
          "URL_Imagen", 
          "Enlace_Principal", 
          "Orden"
        FROM 
          "IMÁGENES_CARRUSEL"
        WHERE 
          "Activo" = TRUE
        ORDER BY 
          "Orden" ASC
      `);
      return Resultado.rows;
    } catch (error) {
      console.error('Error al obtener imágenes del carrusel:', error);
      throw new Error('Error al obtener las imágenes del carrusel');
    }
  }

  /**
   * Obtiene una imagen específica del carrusel por su ID
   * @param {number} id - ID de la imagen a obtener
   * @returns {Promise<Object|null>} - Imagen del carrusel o null si no existe
   */
  async obtenerImagenPorId(id) {
    try {
      const Resultado = await pool.query(
        `SELECT
           "ID_Imagen",
           "Título",
           "Subtítulo",
           "URL_Imagen",
           "Enlace_Principal",
           "Orden",
           "Activo"
         FROM
           "IMÁGENES_CARRUSEL"
         WHERE
           "ID_Imagen" = $1`,
        [id]
      );
      return Resultado.rows[0] || null;
    } catch (error) {
      console.error(`Error al obtener imagen del carrusel con ID ${id}:`, error);
      throw new Error('Error al obtener la imagen del carrusel');
    }
  }

  /**
   * Inserta una nueva imagen de carrusel y devuelve su ID.
   * @param {Object} Datos - Campos a insertar
   * @returns {Promise<number>} ID generado
   */
  async Crear(Datos) {
    const permitidos = [
      'Título',
      'Subtítulo',
      'URL_Imagen',
      'Enlace_Principal',
      'Orden',
      'Activo'
    ];
    const keys = Object.keys(Datos).filter(k => permitidos.includes(k));
    if (keys.length === 0) {
      throw new Error('No se proporcionaron campos válidos para crear la imagen de carrusel');
    }

    const columns = keys.map(k => `"${k}"`).join(', ');
    const values = keys.map(k => Datos[k]);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    try {
      const Resultado = await pool.query(
        `INSERT INTO "IMÁGENES_CARRUSEL" (${columns})
         VALUES (${placeholders})
         RETURNING "ID_Imagen"`,
        values
      );
      return Resultado.rows[0]['ID_Imagen'];
    } catch (error) {
      console.error('Error al crear imagen de carrusel:', error);
      throw new Error('Error al insertar la imagen de carrusel');
    }
  }

  /**
   * Actualiza los campos de una imagen de carrusel dado su ID.
   * @param {number} idImagen
   * @param {Object} Cambios - Campos a actualizar
   * @returns {Promise<number>} número de filas afectadas
   */
  async Actualizar(idImagen, Cambios) {
    const permitidos = [
      'Título',
      'Subtítulo',
      'URL_Imagen',
      'Enlace_Principal',
      'Orden',
      'Activo'
    ];
    const keys = Object.keys(Cambios).filter(k => permitidos.includes(k));
    if (keys.length === 0) {
      throw new Error('No se proporcionaron campos válidos para actualizar');
    }

    const sets = keys
      .map((k, i) => `"${k}" = $${i + 1}`)
      .join(', ');
    const values = keys.map(k => Cambios[k]);
    // último placeholder para el id
    values.push(idImagen);

    try {
      const Resultado = await pool.query(
        `UPDATE "IMÁGENES_CARRUSEL"
         SET ${sets}
         WHERE "ID_Imagen" = $${values.length}`,
        values
      );
      return Resultado.rowCount;
    } catch (error) {
      console.error(`Error al actualizar imagen ${idImagen}:`, error);
      throw new Error('Error al actualizar la imagen de carrusel');
    }
  }

  /**
   * Elimina una imagen de carrusel por su ID.
   * @param {number} idImagen
   * @returns {Promise<number>} número de filas afectadas
   */
  async eliminar(idImagen) {
    try {
      const Resultado = await pool.query(
        `DELETE FROM "IMÁGENES_CARRUSEL"
         WHERE "ID_Imagen" = $1`,
        [idImagen]
      );
      return Resultado.rowCount;
    } catch (error) {
      console.error(`Error al eliminar imagen ${idImagen}:`, error);
      throw new Error('Error al eliminar la imagen de carrusel');
    }
  }
}

module.exports = new ModeloImagenesCarrusel();