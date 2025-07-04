const { pool } = require("../configuraciones/configuraciones_bd")

/**
 * Obtener todas las imágenes de un producto específico
 */
const obtenerPorProducto = async (idProducto) => {
  try {
    const query = `
      SELECT 
        ID_Imagen,
        ID_Producto,
        ID_Variante,
        URL,
        Alt,
        Principal,
        Orden
      FROM IMÁGENES_PRODUCTO 
      WHERE ID_Producto = ?
      ORDER BY Principal DESC, Orden ASC
    `
    const [rows] = await pool.query(query, [idProducto])
    return rows
  } catch (error) {
    console.error("Error en modelo obtenerPorProducto:", error)
    throw error
  }
}

/**
 * Obtener la imagen principal de un producto
 */
const obtenerPrincipal = async (idProducto) => {
  try {
    const query = `
      SELECT 
        ID_Imagen,
        ID_Producto,
        ID_Variante,
        URL,
        Alt,
        Principal,
        Orden
      FROM IMÁGENES_PRODUCTO 
      WHERE ID_Producto = ? AND Principal = 1
      LIMIT 1
    `
    const [rows] = await pool.query(query, [idProducto])
    return rows[0] || null
  } catch (error) {
    console.error("Error en modelo obtenerPrincipal:", error)
    throw error
  }
}

/**
 * Inserta una nueva imagen de producto y devuelve su ID.
 */
const crear = async (datos) => {
  const permitidos = ['ID_Producto','ID_Variante','URL','Alt','Principal','Orden']
  const keys = Object.keys(datos).filter(k => permitidos.includes(k))
  if (keys.length === 0) {
    throw new Error('No se proporcionaron campos válidos para crear la imagen de producto')
  }

  const columns      = keys.map(k => `\`${k}\``).join(', ')
  const placeholders = keys.map(() => '?').join(', ')
  const values       = keys.map(k => datos[k])

  const sql = `INSERT INTO IMÁGENES_PRODUCTO (${columns}) VALUES (${placeholders})`
  const [result] = await pool.query(sql, values)
  return result.insertId
}

/**
 * Actualiza una imagen de producto por su ID.
 */
const actualizar = async (idImagen, cambios) => {
  const permitidos = ['URL','Alt','Principal','Orden']
  const keys = Object.keys(cambios).filter(k => permitidos.includes(k))
  if (keys.length === 0) {
    throw new Error('No se proporcionaron campos válidos para actualizar la imagen de producto')
  }

  const sets   = keys.map(k => `\`${k}\` = ?`).join(', ')
  const values = keys.map(k => cambios[k])
  values.push(idImagen)

  const sql = `UPDATE IMÁGENES_PRODUCTO SET ${sets} WHERE ID_Imagen = ?`
  const [result] = await pool.query(sql, values)
  return result.affectedRows
}

/**
 * Elimina una imagen de producto por su ID.
 */
const eliminar = async (idImagen) => {
  const [result] = await pool.query(
    `DELETE FROM IMÁGENES_PRODUCTO WHERE ID_Imagen = ?`,
    [idImagen]
  )
  return result.affectedRows
}

module.exports = {
  obtenerPorProducto,
  obtenerPrincipal,
  crear,
  actualizar,
  eliminar
}