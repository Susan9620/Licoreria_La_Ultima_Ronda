const { pool } = require('../configuraciones/configuraciones_bd');

class Modelo_Imágenes_Carrusel {
  /**
   * Obtener todas las imágenes activas del carrusel ordenadas
   * @returns {Promise<Array>}
   */
  async Obtener_Imágenes_Carrusel() {
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
   * Obtener una imagen específica del carrusel por su ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async Obtener_Imagen_ID(id) {
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
   * Insertar una nueva imagen de carrusel y devolver su ID.
   * @param {Object} Datos
   * @returns {Promise<number>}
   */
  async Crear(Datos) {
    const Permitidos = [
      'Título',
      'Subtítulo',
      'URL_Imagen',
      'Enlace_Principal',
      'Orden',
      'Activo'
    ];
    const Claves = Object.keys(Datos).filter(k => Permitidos.includes(k));
    if (Claves.length === 0) {
      throw new Error('No se proporcionaron campos válidos para crear la imagen de carrusel');
    }

    const Columnas = Claves.map(k => `"${k}"`).join(', ');
    const Valores = Claves.map(k => Datos[k]);
    const Marcadores = Valores.map((_, i) => `$${i + 1}`).join(', ');

    try {
      const Resultado = await pool.query(
        `INSERT INTO "IMÁGENES_CARRUSEL" (${Columnas})
         VALUES (${Marcadores})
         RETURNING "ID_Imagen"`,
        Valores
      );
      return Resultado.rows[0]['ID_Imagen'];
    } catch (error) {
      console.error('Error al crear imagen de carrusel:', error);
      throw new Error('Error al insertar la imagen de carrusel');
    }
  }

  /**
   * Actualizar los campos de una imagen de carrusel dado su ID
   * @param {number} ID_Imagen
   * @param {Object} Cambios
   * @returns {Promise<number>}
   */
  async Actualizar(ID_Imagen, Cambios) {
    const Permitidos = [
      'Título',
      'Subtítulo',
      'URL_Imagen',
      'Enlace_Principal',
      'Orden',
      'Activo'
    ];
    const Claves = Object.keys(Cambios).filter(k => Permitidos.includes(k));
    if (Claves.length === 0) {
      throw new Error('No se proporcionaron campos válidos para actualizar');
    }

    const Conjuntos = Claves
      .map((k, i) => `"${k}" = $${i + 1}`)
      .join(', ');
    const Valores = Claves.map(k => Cambios[k]);
    Valores.push(ID_Imagen);

    try {
      const Resultado = await pool.query(
        `UPDATE "IMÁGENES_CARRUSEL"
         SET ${Conjuntos}
         WHERE "ID_Imagen" = $${Valores.length}`,
        Valores
      );
      return Resultado.rowCount;
    } catch (error) {
      console.error(`Error al actualizar imagen ${ID_Imagen}:`, error);
      throw new Error('Error al actualizar la imagen de carrusel');
    }
  }

  /**
   * Eliminar una imagen de carrusel por su ID
   * @param {number} ID_Imagen
   * @returns {Promise<number>}
   */
  async Eliminar(ID_Imagen) {
    try {
      const Resultado = await pool.query(
        `DELETE FROM "IMÁGENES_CARRUSEL"
         WHERE "ID_Imagen" = $1`,
        [ID_Imagen]
      );
      return Resultado.rowCount;
    } catch (error) {
      console.error(`Error al eliminar imagen ${ID_Imagen}:`, error);
      throw new Error('Error al eliminar la imagen de carrusel');
    }
  }
}

module.exports = new Modelo_Imágenes_Carrusel();