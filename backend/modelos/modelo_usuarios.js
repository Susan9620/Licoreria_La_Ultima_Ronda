const { pool } = require('../configuraciones/configuraciones_bd');

class Modelo_Usuarios {
  /**
   * Obtener usuario activo por su correo electrónico
   * @param {string} Correo
   * @returns {Promise<Object|null>}
   */
  async Obtener_Por_Correo(Correo) {
    try {
      const Resultado = await pool.query(
        `SELECT *
           FROM "USUARIOS"
          WHERE "Correo_Electrónico" = $1
            AND "Activo" = TRUE
          LIMIT 1`,
        [Correo]
      );
      return Resultado.rows[0] || null;
    } catch (error) {
      console.error('Error al obtener usuario por correo:', error);
      throw new Error('Error al obtener usuario');
    }
  }

  /**
   * Obtener todos los usuarios activos
   * @returns {Promise<Array>}
   */
  async Listar_Todos() {
    try {
      const Resultado = await pool.query(
        `SELECT
           "ID_Usuario",
           "Nombre_Completo",
           "Correo_Electrónico",
           "Rol",
           "Activo"
         FROM "USUARIOS"
        WHERE "Activo" = TRUE`
      );
      return Resultado.rows;
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      throw new Error('Error al listar los usuarios');
    }
  }

  /**
   * Obtener usuario activo por su ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async Obtener_Por_ID(id) {
    try {
      const Resultado = await pool.query(
        `SELECT
           "ID_Usuario",
           "Nombre_Completo",
           "Correo_Electrónico",
           "Teléfono"
         FROM "USUARIOS"
        WHERE "ID_Usuario" = $1
          AND "Activo" = TRUE
        LIMIT 1`,
        [id]
      );
      return Resultado.rows[0] || null;
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error);
      throw new Error('Error al obtener usuario');
    }
  }

  /**
   * Crear usuario con los campos permitidos y devolver su ID
   * @param {Object} Datos
   * @returns {Promise<number>}
   */
  async Crear(Datos) {
    const Permitidos = [
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
    const Claves = Object.keys(Datos).filter(k => Permitidos.includes(k));
    if (Claves.length === 0) {
      throw new Error('No se proporcionaron campos válidos para crear el usuario');
    }

    const Columnas = Claves.map(k => `"${k}"`).join(', ');
    const Valores = Claves.map(k => Datos[k]);
    const Marcadores = Valores.map((_, i) => `$${i + 1}`).join(', ');

    try {
      const Resultado = await pool.query(
        `INSERT INTO "USUARIOS" (${Columnas})
         VALUES (${Marcadores})
         RETURNING "ID_Usuario"`,
        Valores
      );
      return Resultado.rows[0]['ID_Usuario'];
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw new Error('Error al crear el usuario');
    }
  }

  /**
   * Actualizar un usuario por su ID sólo con campos permitidos
   * @param {number} ID_Usuario
   * @param {Object} Cambios
   * @returns {Promise<number>}
   */
  async Actualizar(ID_Usuario, Cambios) {
    const Permitidos = [
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
    const Claves = Object.keys(Cambios).filter(k => Permitidos.includes(k));
    if (Claves.length === 0) return 0;

    const Conjuntos = Claves
      .map((k, i) => `"${k}" = $${i + 1}`)
      .join(', ');
    const Valores = Claves.map(k => Cambios[k]);
    Valores.push(ID_Usuario);

    try {
      const Resultado = await pool.query(
        `UPDATE "USUARIOS"
           SET ${Conjuntos}
         WHERE "ID_Usuario" = $${Valores.length}`,
        Valores
      );
      return Resultado.rowCount;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw new Error('Error al actualizar el usuario');
    }
  }

  /**
   * Eliminar usuario por su ID
   * @param {number} ID_Usuario
   * @returns {Promise<number>}
   */
  async Eliminar(ID_Usuario) {
    try {
      const Resultado = await pool.query(
        `DELETE FROM "USUARIOS"
         WHERE "ID_Usuario" = $1`,
        [ID_Usuario]
      );
      return Resultado.rowCount;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw new Error('Error al eliminar el usuario');
    }
  }
}

module.exports = new Modelo_Usuarios();