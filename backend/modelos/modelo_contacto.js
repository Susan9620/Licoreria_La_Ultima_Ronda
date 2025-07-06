const { pool } = require('../configuraciones/configuraciones_bd');

class ModeloContacto {
  /**
   * Inserta un mensaje de contacto en la BD y devuelve su ID generado.
   * @param {number|null} idUsuario 
   * @param {string} mensaje 
   * @returns {Promise<number>} el ID generado
   */
  static async crear(idUsuario, mensaje) {
    try {
      const result = await pool.query(
        `INSERT INTO "CONTACTO" ("ID_Usuario", "Mensaje")
         VALUES ($1, $2)
         RETURNING "ID_Contacto"`,
        [idUsuario, mensaje]
      );
      return result.rows[0]['ID_Contacto'];
    } catch (error) {
      console.error('Error al crear contacto:', error);
      throw new Error('Error al insertar el mensaje de contacto');
    }
  }

  /**
   * Lista todos los mensajes de contacto.
   * @returns {Promise<Array>} lista de mensajes
   */
  static async obtenerTodos() {
    try {
      const result = await pool.query(
        `SELECT
           c."ID_Contacto"   AS id,
           c."ID_Usuario"    AS usuarioId,
           c."Mensaje"       AS mensaje,
           c."Fecha_Envío"   AS fecha
         FROM "CONTACTO" c
         ORDER BY c."Fecha_Envío" DESC`
      );
      return result.rows;
    } catch (error) {
      console.error('Error al obtener contactos:', error);
      throw new Error('Error al listar los mensajes de contacto');
    }
  }
}

module.exports = ModeloContacto;