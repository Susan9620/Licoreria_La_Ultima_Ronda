const { pool } = require("../configuraciones/configuraciones_bd")

/**
 * Obtener todas las variantes de un producto específico
 */
const obtenerPorProducto = async (idProducto) => {
  try {
    const query = `
      SELECT 
        ID_Variante_Producto,
        ID_Producto,
        Nombre_Variante,
        SKU,
        Medida,
        Graduación,
        Precio,
        Precio_Oferta,
        Predeterminada,
        Stock,
        Activo
      FROM VARIANTES_PRODUCTO 
      WHERE ID_Producto = ? AND Activo = 1
      ORDER BY Predeterminada DESC, Precio ASC
    `

    const [rows] = await pool.query(query, [idProducto])
    return rows
  } catch (error) {
    console.error("Error en modelo obtenerPorProducto:", error)
    throw error
  }
}

/**
 * Obtener una variante específica por ID
 */
const obtenerPorId = async (id) => {
  try {
    const query = `
      SELECT 
        ID_Variante_Producto,
        ID_Producto,
        Nombre_Variante,
        SKU,
        Medida,
        Graduación,
        Precio,
        Precio_Oferta,
        Predeterminada,
        Stock,
        Activo
      FROM VARIANTES_PRODUCTO 
      WHERE ID_Variante_Producto = ? AND Activo = 1
    `

    const [rows] = await pool.query(query, [id])
    return rows[0] || null
  } catch (error) {
    console.error("Error en modelo obtenerPorId:", error)
    throw error
  }
}

module.exports = {
  obtenerPorProducto,
  obtenerPorId,
}