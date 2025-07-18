const { pool } = require('../configuraciones/configuraciones_bd');

/**
 * Inserta una nueva reseña para un producto
 * @param {{ idProducto: number, idUsuario: number, valoracion: number }} Datos
 * @returns {Promise<void>}
 */
async function insertarReseña({ idProducto, idUsuario, valoracion }) {
  try {
    await pool.query(
      `INSERT INTO "RESEÑAS" ("ID_Producto", "ID_Usuario", "Valoración")
       VALUES ($1, $2, $3)`,
      [idProducto, idUsuario, valoracion]
    );
  } catch (error) {
    console.error('Error al insertar reseña:', error);
    throw new Error('No se pudo insertar la reseña');
  }
}

/**
 * Obtiene el promedio y total de reseñas para un producto
 * @param {number} idProducto
 * @returns {Promise<{ promedio: number, total: number }>}
 */
async function obtenerPromedioYTotal(idProducto) {
  try {
    const result = await pool.query(
      `SELECT
         ROUND(AVG("Valoración")::numeric, 1) AS promedio,
         COUNT(*)                           AS total
       FROM "RESEÑAS"
       WHERE "ID_Producto" = $1`,
      [idProducto]
    );
    const row = result.rows[0] || {};
    return {
      promedio: row.promedio ?? 0,
      total:    row.total    ?? 0
    };
  } catch (error) {
    console.error('Error al obtener promedio y total de reseñas:', error);
    throw new Error('No se pudo obtener el promedio y total de reseñas');
  }
}

/**
 * Obtiene todas las reseñas de un producto, con datos de usuario
 * @param {number} idProducto
 * @returns {Promise<Array>}
 */
async function obtenerReseñasPorProducto(idProducto) {
  try {
    const result = await pool.query(
      `SELECT
         r."ID_Reseña"      AS idReseña,
         r."ID_Usuario"     AS idUsuario,
         r."Valoración"     AS valoracion,
         r."Fecha_Creación" AS fechaCreacion,
         u."Nombre_Completo" AS nombreUsuario
       FROM "RESEÑAS" r
       JOIN "USUARIOS" u
         ON r."ID_Usuario" = u."ID_Usuario"
       WHERE r."ID_Producto" = $1
       ORDER BY r."Fecha_Creación" DESC`,
      [idProducto]
    );
    return result.rows;
  } catch (error) {
    console.error('Error al obtener reseñas por producto:', error);
    throw new Error('No se pudieron obtener las reseñas');
  }
}

/**
 * Obtiene la reseña de un usuario en un producto (si existe)
 * @param {number} idProducto
 * @param {number} idUsuario
 * @returns {Promise<{ valoracion: number }|null>}
 */
async function obtenerCalificacionUsuario(idProducto, idUsuario) {
  try {
    const result = await pool.query(
      `SELECT "Valoración" AS valoracion
       FROM "RESEÑAS"
       WHERE "ID_Producto" = $1
         AND "ID_Usuario"  = $2`,
      [idProducto, idUsuario]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error al obtener la calificación de usuario:', error);
    throw new Error('No se pudo obtener la calificación del usuario');
  }
}

module.exports = {
  insertarReseña,
  obtenerPromedioYTotal,
  obtenerReseñasPorProducto,
  obtenerCalificacionUsuario
};