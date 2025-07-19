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
      const Resultado = await pool.query(`
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
      return Resultado.rows;
    } catch (error) {
      console.error('Error al obtener promociones:', error);
      throw new Error('Error al obtener las promociones');
    }
  }

  /**
   * Inserta una nueva promoción y devuelve su ID.
   * @param {Object} Datos
   * @returns {Promise<number>}
   */
  async Crear(Datos) {
    const Permitidos = [
      'ID_Categoría',
      'Título',
      'Descripción',
      'Fecha_Inicio',
      'Fecha_Fin',
      'Tipo',
      'Parámetros'
    ];
    const Claves = Object.keys(Datos).filter(k => Permitidos.includes(k));
    if (Claves.length === 0) {
      throw new Error('No se proporcionaron campos válidos para crear la promoción');
    }

    const Columnas = Claves.map(k => `"${k}"`).join(', ');
    const Valores = Claves.map(k =>
      k === 'Parámetros'
        ? JSON.stringify(Datos[k])
        : Datos[k]
    );
    const placeholders = Valores.map((_, i) => `$${i + 1}`).join(', ');

    try {
      const Resultado = await pool.query(
        `INSERT INTO "PROMOCIONES" (${Columnas})
         VALUES (${placeholders})
         RETURNING "ID_Promoción"`,
        Valores
      );
      return Resultado.rows[0]['ID_Promoción'];
    } catch (error) {
      console.error('Error al crear promoción:', error);
      throw new Error('Error al crear la promoción');
    }
  }

  /**
   * Actualiza una promoción por su ID.
   * @param {number} idPromocion
   * @param {Object} Cambios
   * @returns {Promise<number>} filas afectadas
   */
  async Actualizar(idPromocion, Cambios) {
    const Permitidos = [
      'ID_Categoría',
      'Título',
      'Descripción',
      'Fecha_Inicio',
      'Fecha_Fin',
      'Tipo',
      'Parámetros'
    ];
    const Claves = Object.keys(Cambios).filter(k => Permitidos.includes(k));
    if (Claves.length === 0) {
      throw new Error('No se proporcionaron campos válidos para actualizar la promoción');
    }

    const sets = Claves
      .map((k, i) => `"${k}" = $${i + 1}`)
      .join(', ');
    const Valores = Claves.map(k =>
      k === 'Parámetros'
        ? JSON.stringify(Cambios[k])
        : Cambios[k]
    );
    Valores.push(idPromocion);

    try {
      const Resultado = await pool.query(
        `UPDATE "PROMOCIONES"
         SET ${sets}
         WHERE "ID_Promoción" = $${Valores.length}`,
        Valores
      );
      return Resultado.rowCount;
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
  async Eliminar(idPromocion) {
    try {
      const Resultado = await pool.query(
        `DELETE FROM "PROMOCIONES"
         WHERE "ID_Promoción" = $1`,
        [idPromocion]
      );
      return Resultado.rowCount;
    } catch (error) {
      console.error(`Error al eliminar promoción ${idPromocion}:`, error);
      throw new Error('Error al eliminar la promoción');
    }
  }
}

module.exports = new ModeloPromociones();