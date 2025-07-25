const { pool } = require('../configuraciones/configuraciones_bd');

class Modelo_Lista_Deseos {
  /**
   * Obtener todos los productos en la lista de un usuario
   * @param {number} ID_Usuario
   * @returns {Promise<Array>}
   */
  async Obtener_Por_Usuario(ID_Usuario) {
    try {
      const Resultado = await pool.query(
        `
          SELECT
            ld."ID_Lista_Deseos"   AS id,
            ld."ID_Producto"       AS Producto_ID,
            p."Nombre",
            v."Precio",
            i."URL"                AS Imagen
          FROM "LISTA_DESEOS" ld
          JOIN "PRODUCTOS" p
            ON ld."ID_Producto" = p."ID_Producto"
          LEFT JOIN "VARIANTES_PRODUCTO" v
            ON p."ID_Producto" = v."ID_Producto"
             AND v."Predeterminada" = TRUE
             AND v."Activo" = TRUE
          LEFT JOIN "IMÁGENES_PRODUCTO" i
            ON p."ID_Producto" = i."ID_Producto"
             AND i."Principal" = TRUE
          WHERE ld."ID_Usuario" = $1
          ORDER BY ld."Fecha_Agregado" DESC
        `,
        [ID_Usuario]
      );
      return Resultado.rows;
    } catch (error) {
      console.error('Error al obtener lista de deseos:', error);
      throw error;
    }
  }

  /**
   * Añadir un producto a la lista de deseos de un usuario
   * @param {number} ID_Usuario
   * @param {number} ID_Producto
   * @returns {Promise<Object>} - { id, Producto_ID }
   */
  async agregar(ID_Usuario, ID_Producto) {
    try {
      const Resultado = await pool.query(
        `
          INSERT INTO "LISTA_DESEOS" ("ID_Usuario", "ID_Producto")
          VALUES ($1, $2)
          RETURNING "ID_Lista_Deseos" AS id
        `,
        [ID_Usuario, ID_Producto]
      );
      return {
        id: Resultado.rows[0].id,
        Producto_ID: ID_Producto
      };
    } catch (error) {
      console.error('Error al agregar a lista de deseos:', error);
      throw error;
    }
  }

  /**
   * Eliminar un producto de la lista de deseos de un usuario
   * @param {number} ID_Usuario
   * @param {number} ID_Producto
   * @returns {Promise<number>}
   */
  async Eliminar(ID_Usuario, ID_Producto) {
    try {
      const Resultado = await pool.query(
        `
          DELETE FROM "LISTA_DESEOS"
          WHERE "ID_Usuario" = $1
            AND "ID_Producto" = $2
        `,
        [ID_Usuario, ID_Producto]
      );
      return Resultado.rowCount;
    } catch (error) {
      console.error('Error al eliminar de lista de deseos:', error);
      throw error;
    }
  }
}

module.exports = new Modelo_Lista_Deseos();