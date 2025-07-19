const { pool } = require('../configuraciones/configuraciones_bd');

/**
 * Inserta una nueva reseña para un producto
 * @param {{ ID_Producto: number, ID_Usuario: number, valoracion: number }} Datos
 * @returns {Promise<void>}
 */
async function insertarReseña({ ID_Producto, ID_Usuario, valoracion }) {
  try {
    await pool.query(
      `INSERT INTO "RESEÑAS" ("ID_Producto", "ID_Usuario", "Valoración")
       VALUES ($1, $2, $3)`,
      [ID_Producto, ID_Usuario, valoracion]
    );
  } catch (error) {
    console.error('Error al insertar reseña:', error);
    throw new Error('No se pudo insertar la reseña');
  }
}

/**
 * Obtiene el promedio y total de reseñas para un producto
 * @param {number} ID_Producto
 * @returns {Promise<{ promedio: number, Total: number }>}
 */
async function obtenerPromedioYTotal(ID_Producto) {
  try {
    const Resultado = await pool.query(
      `SELECT
         ROUND(AVG("Valoración")::numeric, 1) AS promedio,
         COUNT(*)                           AS Total
       FROM "RESEÑAS"
       WHERE "ID_Producto" = $1`,
      [ID_Producto]
    );
    const row = Resultado.rows[0] || {};
    return {
      promedio: row.promedio ?? 0,
      Total:    row.Total    ?? 0
    };
  } catch (error) {
    console.error('Error al obtener promedio y total de reseñas:', error);
    throw new Error('No se pudo obtener el promedio y total de reseñas');
  }
}

/**
 * Obtiene todas las reseñas de un producto, con datos de usuario
 * @param {number} ID_Producto
 * @returns {Promise<Array>}
 */
async function obtenerReseñasPorProducto(ID_Producto) {
  try {
    const Resultado = await pool.query(
      `SELECT
         r."ID_Reseña"      AS idReseña,
         r."ID_Usuario"     AS ID_Usuario,
         r."Valoración"     AS valoracion,
         r."Fecha_Creación" AS fechaCreacion,
         u."Nombre_Completo" AS nombreUsuario
       FROM "RESEÑAS" r
       JOIN "USUARIOS" u
         ON r."ID_Usuario" = u."ID_Usuario"
       WHERE r."ID_Producto" = $1
       ORDER BY r."Fecha_Creación" DESC`,
      [ID_Producto]
    );
    return Resultado.rows;
  } catch (error) {
    console.error('Error al obtener reseñas por producto:', error);
    throw new Error('No se pudieron obtener las reseñas');
  }
}

/**
 * Obtiene la reseña de un usuario en un producto (si existe)
 * @param {number} ID_Producto
 * @param {number} ID_Usuario
 * @returns {Promise<{ valoracion: number }|null>}
 */
async function obtenerCalificacionUsuario(ID_Producto, ID_Usuario) {
  try {
    const Resultado = await pool.query(
      `SELECT "Valoración" AS valoracion
       FROM "RESEÑAS"
       WHERE "ID_Producto" = $1
         AND "ID_Usuario"  = $2`,
      [ID_Producto, ID_Usuario]
    );
    return Resultado.rows[0] || null;
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