const { pool } = require('../configuraciones/configuraciones_bd');

/**
 * Modelo para gestionar la lista de deseos en la base de datos
 */
class ModeloListaDeseos {
  /**
   * Obtiene todos los productos en la lista de un usuario
   * @param {number} idUsuario
   * @returns {Promise<Array>}
   */
  async obtenerPorUsuario(idUsuario) {
    const query = `
      SELECT
        ld.ID_Lista_Deseos AS id,
        ld.ID_Producto AS productoId,
        p.Nombre,
        v.Precio,
        i.URL AS imagen
      FROM LISTA_DESEOS ld
      JOIN PRODUCTOS p ON ld.ID_Producto = p.ID_Producto
      LEFT JOIN VARIANTES_PRODUCTO v
        ON p.ID_Producto = v.ID_Producto AND v.Predeterminada = 1 AND v.Activo = 1
      LEFT JOIN IMÁGENES_PRODUCTO i
        ON p.ID_Producto = i.ID_Producto AND i.Principal = 1
      WHERE ld.ID_Usuario = ?
      ORDER BY ld.Fecha_Agregado DESC
    `;
    const [rows] = await pool.query(query, [idUsuario]);
    return rows;
  }

  /**
   * Añade un producto a la lista de deseos de un usuario
   * @param {number} idUsuario
   * @param {number} idProducto
   * @returns {Promise<Object>} - Datos del registro insertado
   */
  async agregar(idUsuario, idProducto) {
    const query = `
      INSERT INTO LISTA_DESEOS (ID_Usuario, ID_Producto)
      VALUES (?, ?)
    `;
    const [result] = await pool.query(query, [idUsuario, idProducto]);
    return { id: result.insertId, productoId: idProducto };
  }

  /**
   * Elimina un producto de la lista de deseos de un usuario
   * @param {number} idUsuario
   * @param {number} idProducto
   * @returns {Promise<void>}
   */
  async eliminar(idUsuario, idProducto) {
    const query = `
      DELETE FROM LISTA_DESEOS
      WHERE ID_Usuario = ? AND ID_Producto = ?
    `;
    await pool.query(query, [idUsuario, idProducto]);
  }
}

module.exports = new ModeloListaDeseos();