const { pool } = require('../configuraciones/configuraciones_bd');

/**
 * Modelo para gestionar las promociones en la base de datos
 */
class ModeloPromociones {
  /**
   * Obtiene todas las promociones vigentes
   * @returns {Promise<Array>} - Lista de promociones
   */
  async obtenerPromocionesActivas() {
    try {
      const [promociones] = await pool.query(
        `SELECT
           ID_Promoción        AS id,
           ID_Categoría        AS categoriaId,
           Título              AS titulo,
           Descripción         AS descripcion,
           Fecha_Inicio        AS fechaInicio,
           Fecha_Fin           AS fechaFin,
           Tipo                AS tipo,
           Parámetros          AS parametros
         FROM PROMOCIONES
         WHERE (Fecha_Inicio IS NULL OR Fecha_Inicio <= CURRENT_DATE())
           AND (Fecha_Fin    IS NULL OR Fecha_Fin    >= CURRENT_DATE())
         ORDER BY Fecha_Inicio DESC`
      );
      return promociones;
    } catch (error) {
      console.error('Error al obtener promociones:', error);
      throw new Error('Error al obtener las promociones');
    }
  }

  /**
   * Inserta una nueva promoción y devuelve su ID.
   * @param {Object} datos 
   */
  async crear(datos) {
    // Campos permitidos para insertar
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

    const columns = keys.map(k => `\`${k}\``).join(', ');
    const placeholders = keys.map(_ => '?').join(', ');
    const values = keys.map(k => {
      // Si es Parámetros, lo serializamos a JSON
      return k === 'Parámetros' ? JSON.stringify(datos[k]) : datos[k];
    });

    const sql = `INSERT INTO PROMOCIONES (${columns}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, values);
    return result.insertId;
  }

  /**
   * Actualiza una promoción por su ID.
   * @param {number} idPromocion 
   * @param {Object} cambios 
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

    const sets = keys.map(k => `\`${k}\` = ?`).join(', ');
    const values = keys.map(k =>
      k === 'Parámetros' ? JSON.stringify(cambios[k]) : cambios[k]
    );
    values.push(idPromocion);

    const sql = `UPDATE PROMOCIONES SET ${sets} WHERE ID_Promoción = ?`;
    const [result] = await pool.query(sql, values);
    return result.affectedRows;
  }

  /**
   * Elimina una promoción por su ID.
   * @param {number} idPromocion 
   */
  async eliminar(idPromocion) {
    const sql = `DELETE FROM PROMOCIONES WHERE ID_Promoción = ?`;
    const [result] = await pool.query(sql, [idPromocion]);
    return result.affectedRows;
  }
}

module.exports = new ModeloPromociones();