const { pool } = require('../configuraciones/configuraciones_bd');

/**
 * Obtiene todas las variantes de un producto específico
 * @param {number} idProducto
 * @returns {Promise<Array>}
 */
async function obtenerPorProducto(idProducto) {
  try {
    const result = await pool.query(
      `SELECT
         "ID_Variante_Producto",
         "ID_Producto",
         "Nombre_Variante",
         "SKU",
         "Medida",
         "Graduación",
         "Precio",
         "Precio_Oferta",
         "Predeterminada",
         "Stock",
         "Activo"
       FROM "VARIANTES_PRODUCTO"
       WHERE "ID_Producto" = $1
         AND "Activo" = TRUE
       ORDER BY
         "Predeterminada" DESC,
         "Precio" ASC`,
      [idProducto]
    );
    return result.rows;
  } catch (error) {
    console.error('Error en modelo obtenerPorProducto:', error);
    throw error;
  }
}

/**
 * Obtiene una variante específica por su ID
 * @param {number} ID
 * @returns {Promise<Object|null>}
 */
async function obtenerPorId(ID) {
  try {
    const result = await pool.query(
      `SELECT
         "ID_Variante_Producto",
         "ID_Producto",
         "Nombre_Variante",
         "SKU",
         "Medida",
         "Graduación",
         "Precio",
         "Precio_Oferta",
         "Predeterminada",
         "Stock",
         "Activo"
       FROM "VARIANTES_PRODUCTO"
       WHERE "ID_Variante_Producto" = $1
         AND "Activo" = TRUE`,
      [ID]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error en modelo obtenerPorId:', error);
    throw error;
  }
}

module.exports = {
  obtenerPorProducto,
  obtenerPorId,
};