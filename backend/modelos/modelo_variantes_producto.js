const { pool } = require('../configuraciones/configuraciones_bd');

/**
 * Obtiene todas las variantes de un producto específico
 * @param {number} ID_Producto
 * @returns {Promise<Array>}
 */
async function Obtener_Por_Producto(ID_Producto) {
  try {
    const Resultado = await pool.query(
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
      [ID_Producto]
    );
    return Resultado.rows;
  } catch (error) {
    console.error('Error en modelo Obtener_Por_Producto:', error);
    throw error;
  }
}

/**
 * Obtiene una variante específica por su ID
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function obtenerPorId(id) {
  try {
    const Resultado = await pool.query(
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
      [id]
    );
    return Resultado.rows[0] || null;
  } catch (error) {
    console.error('Error en modelo obtenerPorId:', error);
    throw error;
  }
}

module.exports = {
  Obtener_Por_Producto,
  obtenerPorId,
};