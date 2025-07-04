const { pool } = require('../configuraciones/configuraciones_bd');

class ModeloUsuarios {
  /**
   * Inserta un nuevo usuario en la base de datos
   * @param {{ Nombre_Completo:string, Correo_Electrónico:string, Contraseña:string }} datos
   * @returns {Promise<import('mysql2').ResultSetHeader>}
   */
  async crear({ Nombre_Completo, Correo_Electrónico, Contraseña }) {
    const result = await pool.query(
      `INSERT INTO USUARIOS (Nombre_Completo, Correo_Electrónico, Contraseña)
       VALUES ($1, $2, $3)
       RETURNING ID_Usuario`,
      [Nombre_Completo, Correo_Electrónico, Contraseña]
    );
    return result.rows[0].ID_Usuario;
  }

  /**
   * Obtiene un usuario por su correo electrónico
   * @param {string} correo
   * @returns {Promise<Object|null>}
   */
  async obtenerPorCorreo(correo) {
    const result = await pool.query(
      `SELECT * FROM USUARIOS WHERE Correo_Electrónico = $1 AND Activo = 1 LIMIT 1`,
      [correo]
    );
    return result.rows[0] || null;
  }

  /**
 * Devuelve todos los usuarios activos
 * @returns {Promise<Object[]>}
 */
  async listarTodos() {
    const result = await pool.query(
      `SELECT ID_Usuario, Nombre_Completo, Correo_Electrónico, Rol, Activo
       FROM USUARIOS WHERE Activo = 1`
    );
    return result.rows;
  }

  /**
   * Devuelve un usuario por su ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async obtenerPorId(id) {
    const sql = `
      SELECT 
        ID_Usuario,
        Nombre_Completo,
        Correo_Electrónico,
        Teléfono
      FROM USUARIOS
      WHERE ID_Usuario = $1
        AND Activo = 1
      LIMIT 1
    `;
    const result = await pool.query(sql, [id]);
    const rows = result.rows;
    return rows[0] || null;
  }

  /**
   * Crea un usuario (solo campos obligatorios: nombre, correo y contraseña ya hasheada)
   * Devuelve el nuevo ID.
   */
  async crear(datos) {
    const permitidos = [
      'Nombre_Completo',
      'Correo_Electrónico',
      'Contraseña',
      'Fecha_Nacimiento',
      'Teléfono',
      'Dirección',
      'Código Postal',
      'Rol',
      'Activo'
    ];

    const keys = Object.keys(datos).filter(k => permitidos.includes(k));
    const columns = keys.map(k => `"${k}"`).join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const values = keys.map(k => datos[k]);

    const sql = `
      INSERT INTO USUARIOS (${columns})
      VALUES (${placeholders})
      RETURNING ID_Usuario
    `;
    const result = await pool.query(sql, values);
    return result.rows[0].id_usuario;
  }

  /**
   * Actualiza un usuario por su ID, solo columnas permitidas.
   * cambios puede contener Nombre_Completo, Correo_Electrónico, Contraseña, Rol y Activo.
   */
  async actualizar(idUsuario, cambios) {
    const permitidos = [
      'Nombre_Completo',
      'Correo_Electrónico',
      'Contraseña',
      'Fecha_Nacimiento',
      'Teléfono',
      'Dirección',
      'Código Postal',
      'Rol',
      'Activo'
    ];
    const keys = Object.keys(cambios).filter(k => permitidos.includes(k));
    if (keys.length === 0) return 0;

    const sets = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const values = keys.map(k => cambios[k]);
    values.push(idUsuario);
    const sql = `UPDATE USUARIOS SET ${sets} WHERE ID_Usuario = $${values.length}`;
    const result = await pool.query(sql, values);
    return result.rowCount;
  }

  /**
   * Elimina un usuario (se puede desactivar en lugar de borrar, si prefieres soft-delete).
   */
  async eliminar(idUsuario) {
    const result = await pool.query(
      `DELETE FROM USUARIOS WHERE ID_Usuario = $1`,
      [idUsuario]
    );
    return result.rowCount;
  }
}

module.exports = new ModeloUsuarios();