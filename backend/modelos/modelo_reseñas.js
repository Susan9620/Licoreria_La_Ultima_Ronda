const { pool } = require('../configuraciones/configuraciones_bd');

/**
 * Insertar nueva reseña para un producto
 * @param {{ ID_Producto: number, ID_Usuario: number, Valoración: number }} Datos
 * @returns {Promise<void>}
 */
async function Insertar_Reseñas({ ID_Producto, ID_Usuario, Valoración }) {
  try {
    await pool.query(
      `INSERT INTO "RESEÑAS" ("ID_Producto", "ID_Usuario", "Valoración")
       VALUES ($1, $2, $3)`,
      [ID_Producto, ID_Usuario, Valoración]
    );
  } catch (error) {
    console.error('Error al insertar reseña:', error);
    throw new Error('No se pudo insertar la reseña');
  }
}

/**
 * Obtener promedio y total de reseñas para un producto
 * @param {number} ID_Producto
 * @returns {Promise<{ Promedio: number, Total: number }>}
 */
async function Obtener_Promedio_Y_Total(ID_Producto) {
  try {
    const Resultado = await pool.query(
      `SELECT
         ROUND(AVG("Valoración")::numeric, 1) AS Promedio,
         COUNT(*)                           AS Total
       FROM "RESEÑAS"
       WHERE "ID_Producto" = $1`,
      [ID_Producto]
    );
    const Fila = Resultado.rows[0] || {};
    return {
      Promedio: Fila.Promedio ?? 0,
      Total:    Fila.Total    ?? 0
    };
  } catch (error) {
    console.error('Error al obtener promedio y total de reseñas:', error);
    throw new Error('No se pudo obtener el promedio y total de reseñas');
  }
}

/**
 * Obtener reseñas de un producto con datos de usuario
 * @param {number} ID_Producto
 * @returns {Promise<Array>}
 */
async function Obtener_Reseñas_Por_Producto(ID_Producto) {
  try {
    const Resultado = await pool.query(
      `SELECT
         r."ID_Reseña"      AS ID_Reseña,
         r."ID_Usuario"     AS ID_Usuario,
         r."Valoración"     AS Valoración,
         r."Fecha_Creación" AS Fecha_Creación,
         u."Nombre_Completo" AS Nombre_Usuario
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
 * Obtener reseña de un usuario en un producto
 * @param {number} ID_Producto
 * @param {number} ID_Usuario
 * @returns {Promise<{ Valoración: number }|null>}
 */
async function Obtener_Calificación_Usuario(ID_Producto, ID_Usuario) {
  try {
    const Resultado = await pool.query(
      `SELECT "Valoración" AS Valoración
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
  Insertar_Reseñas,
  Obtener_Promedio_Y_Total,
  Obtener_Reseñas_Por_Producto,
  Obtener_Calificación_Usuario
};