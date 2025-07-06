const { pool } = require('../configuraciones/configuraciones_bd');

/**
 * Modelo para gestionar las promociones en PostgreSQL
 */
class ModeloPromociones {
  /**
   * Obtiene todas las promociones vigentes
   * @returns {Promise<Array>} - Lista de promociones
   */
  async obtenerPromocionesActivas() {
    try {
      const result = await pool.query(`
        SELECT
          "ID_Promoción"   AS id,
          "ID_Categoría"   AS categoriaId,
          "Título"         AS titulo,
          "Descripción"    AS descripcion,
          "Fecha_Inicio"   AS fechaInicio,
          "Fecha_Fin"      AS fechaFin,
          "Tipo"           AS tipo,
          "Parámetros"     AS parametros
        FROM "PROMOCIONES"
        WHERE ("Fecha_Inicio" IS NULL OR "Fecha_Inicio" <= CURRENT_DATE)
          AND ("Fecha_Fin"    IS NULL OR "Fecha_Fin"    >= CURRENT_DATE)
        ORDER BY "Fecha_Inicio" DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener promociones:', error);
      throw new Error('Error al obtener las promociones');
    }
  }

  /**
   * Inserta una nueva promoción y devuelve su ID.
   * @param {Object} datos
   * @returns {Promise<number>}
   */
  async crear(datos) {
    const permitidos = [
      'ID_Categoría',
      'Título',
      'Descripción',
      'Fecha_Inicio',
      'Fecha_Fin',
      'Tipo',
      'Parámetros'
    ];
    const keys = Object.keys(datos).filter(k => permitidos.includes(k));
    if (keys.length === 0) {
      throw new Error('No se proporcionaron campos válidos para crear la promoción');
    }

    const columns = keys.map(k => `"${k}"`).join(', ');
    const values = keys.map(k =>
      k === 'Parámetros'
        ? JSON.stringify(datos[k])
        : datos[k]
    );
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    try {
      const result = await pool.query(
        `INSERT INTO "PROMOCIONES" (${columns})
         VALUES (${placeholders})
         RETURNING "ID_Promoción"`,
        values
      );
      return result.rows[0]['ID_Promoción'];
    } catch (error) {
      console.error('Error al crear promoción:', error);
      throw new Error('Error al crear la promoción');
    }
  }

  /**
   * Actualiza una promoción por su ID.
   * @param {number} idPromocion
   * @param {Object} cambios
   * @returns {Promise<number>} filas afectadas
   */
  async actualizar(idPromocion, cambios) {
    const permitidos = [
      'ID_Categoría',
      'Título',
      'Descripción',
      'Fecha_Inicio',
      'Fecha_Fin',
      'Tipo',
      'Parámetros'
    ];
    const keys = Object.keys(cambios).filter(k => permitidos.includes(k));
    if (keys.length === 0) {
      throw new Error('No se proporcionaron campos válidos para actualizar la promoción');
    }

    const sets = keys
      .map((k, i) => `"${k}" = $${i + 1}`)
      .join(', ');
    const values = keys.map(k =>
      k === 'Parámetros'
        ? JSON.stringify(cambios[k])
        : cambios[k]
    );
    values.push(idPromocion);

    try {
      const result = await pool.query(
        `UPDATE "PROMOCIONES"
         SET ${sets}
         WHERE "ID_Promoción" = $${values.length}`,
        values
      );
      return result.rowCount;
    } catch (error) {
      console.error(`Error al actualizar promoción ${idPromocion}:`, error);
      throw new Error('Error al actualizar la promoción');
    }
  }

  /**
   * Elimina una promoción por su ID.
   * @param {number} idPromocion
   * @returns {Promise<number>} filas afectadas
   */
  async eliminar(idPromocion) {
    try {
      const result = await pool.query(
        `DELETE FROM "PROMOCIONES"
         WHERE "ID_Promoción" = $1`,
        [idPromocion]
      );
      return result.rowCount;
    } catch (error) {
      console.error(`Error al eliminar promoción ${idPromocion}:`, error);
      throw new Error('Error al eliminar la promoción');
    }
  }
}

module.exports = new ModeloPromociones();