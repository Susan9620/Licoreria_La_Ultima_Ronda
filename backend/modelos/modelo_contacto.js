const { pool } = require('../configuraciones/configuraciones_bd');

class ModeloContacto {
  /**
   * Inserta un mensaje de contacto en la BD.
   * @param {number|null} idUsuario 
   * @param {string} mensaje 
   * @returns {Promise<number>} el ID generado
   */
  static async crear(idUsuario, mensaje) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(
        `INSERT INTO CONTACTO (ID_Usuario, Mensaje) VALUES (?, ?)`,
        [idUsuario, mensaje]
      );
      return result.insertId;
    } finally {
      conn.release();
    }
  }

  /**
   * (Opcional) Lista todos los mensajes de contacto.
   */
  static async obtenerTodos() {
    const [rows] = await pool.query(
      `SELECT c.ID_Contacto AS id, c.ID_Usuario AS usuarioId, c.Mensaje AS mensaje,
              c.Fecha_Envío AS fecha
       FROM CONTACTO c
       ORDER BY c.Fecha_Envío DESC`
    );
    return rows;
  }
}

module.exports = ModeloContacto;