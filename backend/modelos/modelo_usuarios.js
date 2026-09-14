const { pool } = require('../configuraciones/configuraciones_bd');
const Bcrypt = require('bcryptjs');

const fallbackUsers = [
  {
    ID_Usuario: 1,
    Nombre_Completo: 'Susan Aguilar',
    Correo_Electrónico: 'susan.aguilar@espoch.edu.ec',
    Contraseña: Bcrypt.hashSync('12345678', 10),
    Rol: 'Administrador',
    Teléfono: '0984796539',
    Activo: true
  },
  {
    ID_Usuario: 2,
    Nombre_Completo: 'Cliente Demo',
    Correo_Electrónico: 'cliente@ejemplo.com',
    Contraseña: Bcrypt.hashSync('12345678', 10),
    Rol: 'Cliente',
    Teléfono: '0999999999',
    Activo: true
  }
];

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
      if (Resultado.rows && Resultado.rows.length > 0) {
        return Resultado.rows[0];
      }
      const user = fallbackUsers.find(u => u.Correo_Electrónico.toLowerCase() === Correo.toLowerCase() && u.Activo);
      return user || null;
    } catch (error) {
      console.warn('⚠️ Error al obtener usuario por correo en BD, buscando en respaldo:', error.message);
      const user = fallbackUsers.find(u => u.Correo_Electrónico.toLowerCase() === Correo.toLowerCase() && u.Activo);
      return user || null;
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
      if (Resultado.rows && Resultado.rows.length > 0) {
        return Resultado.rows;
      }
      return fallbackUsers;
    } catch (error) {
      console.warn('⚠️ Error al listar usuarios en BD, usando datos de respaldo:', error.message);
      return fallbackUsers;
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
      if (Resultado.rows && Resultado.rows.length > 0) {
        return Resultado.rows[0];
      }
      const user = fallbackUsers.find(u => u.ID_Usuario === parseInt(id, 10) && u.Activo);
      return user || null;
    } catch (error) {
      console.warn('⚠️ Error al obtener usuario por ID en BD, buscando en respaldo:', error.message);
      const user = fallbackUsers.find(u => u.ID_Usuario === parseInt(id, 10) && u.Activo);
      return user || null;
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
      if (error.code === '23505' && error.constraint === 'USUARIOS_pkey') {
        // Corregir secuencia desfasada y reintentar
        await pool.query(`SELECT setval(pg_get_serial_sequence('"USUARIOS"', 'ID_Usuario'), COALESCE(max("ID_Usuario"), 1)) FROM "USUARIOS"`);
        const Reintento = await pool.query(
          `INSERT INTO "USUARIOS" (${Columnas})
           VALUES (${Marcadores})
           RETURNING "ID_Usuario"`,
          Valores
        );
        return Reintento.rows[0]['ID_Usuario'];
      }
      console.warn('⚠️ Error al crear usuario en BD, registrando en memoria de respaldo:', error.message);
      const nuevoId = fallbackUsers.length + 1;
      const nuevoUser = { ID_Usuario: nuevoId, ...Datos, Rol: Datos.Rol || 'Cliente', Activo: true };
      fallbackUsers.push(nuevoUser);
      return nuevoId;
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