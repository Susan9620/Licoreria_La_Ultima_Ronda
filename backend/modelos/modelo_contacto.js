const { pool } = require('../configuraciones/configuraciones_bd');

class Modelo_Contacto {
  /**
   * Insertar un mensaje de contacto y devolver su ID generado
   * @param {number|null} ID_Usuario 
   * @param {string} Mensaje 
   * @returns {Promise<number>}
   */
  static async Crear(ID_Usuario, Mensaje) {
    try {
      const Resultado = await pool.query(
        `INSERT INTO "CONTACTO" ("ID_Usuario", "Mensaje")
         VALUES ($1, $2)
         RETURNING "ID_Contacto"`,
        [ID_Usuario, Mensaje]
      );
      return Resultado.rows[0]['ID_Contacto'];
    } catch (error) {
      console.error('Error al crear contacto:', error);
      throw new Error('Error al insertar el mensaje de contacto');
    }
  }

  /**
   * Obtener todos los mensajes
   * @returns {Promise<Array>}
   */
  static async obtenerTodos() {
    try {
      const Resultado = await pool.query(
        `SELECT
           c."ID_Contacto"   AS id,
           c."ID_Usuario"    AS usuarioId,
           c."Mensaje"       AS mensaje,
           c."Fecha_Envío"   AS fecha
         FROM "CONTACTO" c
         ORDER BY c."Fecha_Envío" DESC`
      );
      return Resultado.rows;
    } catch (error) {
      console.error('Error al obtener contactos:', error);
      throw new Error('Error al listar los mensajes de contacto');
    }
  }
}

module.exports = Modelo_Contacto;