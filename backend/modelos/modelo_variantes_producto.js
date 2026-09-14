const { pool } = require('../configuraciones/configuraciones_bd');
let datosIniciales = null;
try {
  datosIniciales = require('../semillas/datos_iniciales.json');
} catch (e) {}

/**
 * Obtener variantes de un producto específico
 * @param {number} ID_Producto
 * @returns {Promise<Array>}
 */
async function Obtener_Por_Producto(ID_Producto) {
  const numId = parseInt(ID_Producto, 10);
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
      [numId]
    );
    if (Resultado.rows && Resultado.rows.length > 0) return Resultado.rows;
    if (datosIniciales?.variantes) {
      return datosIniciales.variantes.filter(v => v.ID_Producto === numId);
    }
    return [];
  } catch (error) {
    console.warn('⚠️ Error en modelo Obtener_Por_Producto de variantes, usando datos de respaldo:', error.message);
    if (datosIniciales?.variantes) {
      return datosIniciales.variantes.filter(v => v.ID_Producto === numId);
    }
    return [];
  }
}

/**
 * Obtener variante específica por su ID
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function Obtener_Por_ID(id) {
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
    console.error('Error en modelo Obtener_Por_ID:', error);
    throw error;
  }
}

module.exports = {
  Obtener_Por_Producto,
  Obtener_Por_ID,
};