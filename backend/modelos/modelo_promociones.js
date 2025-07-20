const { pool } = require('../configuraciones/configuraciones_bd');

class Modelo_Promociones {
  /**
   * Obtener todas las promociones activas
   * @returns {Promise<Array>}
   */
  async Obtener_Promociones_Activas() {
    try {
      const Resultado = await pool.query(`
        SELECT
          "ID_Promoción"   AS id,
          "ID_Categoría"   AS Categoría_ID,
          "Título"         AS Título,
          "Descripción"    AS Descripción,
          "Fecha_Inicio"   AS Fecha_Inicio,
          "Fecha_Fin"      AS Fecha_Fin,
          "Tipo"           AS Tipo,
          "Parámetros"     AS Parámetros
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
   * Insertar nueva promoción y devolver su ID
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
    const Marcadores = Valores.map((_, i) => `$${i + 1}`).join(', ');

    try {
      const Resultado = await pool.query(
        `INSERT INTO "PROMOCIONES" (${Columnas})
         VALUES (${Marcadores})
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
   * Actualizar promoción por su ID
   * @param {number} ID_Promoción
   * @param {Object} Cambios
   * @returns {Promise<number>}
   */
  async Actualizar(ID_Promoción, Cambios) {
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

    const Conjuntos = Claves
      .map((k, i) => `"${k}" = $${i + 1}`)
      .join(', ');
    const Valores = Claves.map(k =>
      k === 'Parámetros'
        ? JSON.stringify(Cambios[k])
        : Cambios[k]
    );
    Valores.push(ID_Promoción);

    try {
      const Resultado = await pool.query(
        `UPDATE "PROMOCIONES"
         SET ${Conjuntos}
         WHERE "ID_Promoción" = $${Valores.length}`,
        Valores
      );
      return Resultado.rowCount;
    } catch (error) {
      console.error(`Error al actualizar promoción ${ID_Promoción}:`, error);
      throw new Error('Error al actualizar la promoción');
    }
  }

  /**
   * Eliminar promoción por su ID
   * @param {number} ID_Promoción
   * @returns {Promise<number>}
   */
  async Eliminar(ID_Promoción) {
    try {
      const Resultado = await pool.query(
        `DELETE FROM "PROMOCIONES"
         WHERE "ID_Promoción" = $1`,
        [ID_Promoción]
      );
      return Resultado.rowCount;
    } catch (error) {
      console.error(`Error al eliminar promoción ${ID_Promoción}:`, error);
      throw new Error('Error al eliminar la promoción');
    }
  }
}

module.exports = new Modelo_Promociones();