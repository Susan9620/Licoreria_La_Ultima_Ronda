const { pool } = require('../configuraciones/configuraciones_bd');

/**
 * Modelo para gestionar las imágenes del carrusel en la base de datos
 */
class ModeloImagenesCarrusel {
  /**
   * Obtiene todas las imágenes activas del carrusel ordenadas por el campo Orden
   * @returns {Promise<Array>} - Lista de imágenes del carrusel
   */
  async obtenerImagenesCarrusel() {
    try {
      const [imagenes] = await pool.query(
      `SELECT 
        "ID_Imagen", 
        "Título", 
        "Subtítulo", 
        "URL_Imagen", 
        "Enlace_Principal", 
        "Orden"
      FROM 
        "IMÁGENES_CARRUSEL"
      WHERE 
        "Activo" = true
      ORDER BY 
        "Orden" ASC
    `
      );

      return imagenes;
    } catch (error) {
      console.error('Error al obtener imágenes del carrusel:', error);
      throw new Error('Error al obtener las imágenes del carrusel');
    }
  }

  /**
   * Obtiene una imagen específica del carrusel por su ID
   * @param {number} id - ID de la imagen a obtener
   * @returns {Promise<Object>} - Imagen del carrusel
   */
  async obtenerImagenPorId(id) {
    try {
      const [imagenes] = await pool.query(
        'SELECT * FROM IMÁGENES_CARRUSEL WHERE ID_Imagen = ?',
        [id]
      );

      return imagenes[0] || null;
    } catch (error) {
      console.error(`Error al obtener imagen del carrusel con ID ${id}:`, error);
      throw new Error('Error al obtener la imagen del carrusel');
    }
  }

  /**
   * Inserta una nueva imagen de carrusel y devuelve su ID.
   */
  async crear(datos) {
    // Campos permitidos para insertar
    const permitidos = [
      'Título',
      'Subtítulo',
      'URL_Imagen',
      'Enlace_Principal',
      'Orden',
      'Activo'
    ];
    const keys = Object.keys(datos).filter(k => permitidos.includes(k));
    if (keys.length === 0) {
      throw new Error('No se proporcionaron campos válidos para crear la imagen de carrusel');
    }

    const columns = keys.map(k => `\`${k}\``).join(', ');
    const placeholders = keys.map(_ => '?').join(', ');
    const values = keys.map(k => datos[k]);

    const sql = `INSERT INTO IMÁGENES_CARRUSEL (${columns}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, values);
    return result.insertId;
  }

  /**
   * Actualiza los campos de una imagen de carrusel dado su ID.
   */
  async actualizar(idImagen, cambios) {
    const permitidos = [
      'Título',
      'Subtítulo',
      'URL_Imagen',
      'Enlace_Principal',
      'Orden',
      'Activo'
    ];
    const keys = Object.keys(cambios).filter(k => permitidos.includes(k));
    if (keys.length === 0) {
      throw new Error('No se proporcionaron campos válidos para actualizar');
    }

    const sets = keys.map(k => `\`${k}\` = ?`).join(', ');
    const values = keys.map(k => cambios[k]);
    values.push(idImagen);

    const sql = `UPDATE IMÁGENES_CARRUSEL SET ${sets} WHERE ID_Imagen = ?`;
    const [result] = await pool.query(sql, values);
    return result.affectedRows;
  }

  /**
   * Elimina una imagen de carrusel por su ID.
   */
  async eliminar(idImagen) {
    const [result] = await pool.query(
      `DELETE FROM IMÁGENES_CARRUSEL WHERE ID_Imagen = ?`,
      [idImagen]
    );
    return result.affectedRows;
  }
}

module.exports = new ModeloImagenesCarrusel();