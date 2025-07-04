const { pool } = require('../configuraciones/configuraciones_bd');

async function insertarReseña({ idProducto, idUsuario, valoracion }) {
  await pool.query(
    `INSERT INTO RESEÑAS (ID_Producto, ID_Usuario, Valoración) VALUES (?, ?, ?)`,
    [idProducto, idUsuario, valoracion]
  );
}

async function obtenerPromedioYTotal(idProducto) {
  const [rows] = await pool.query(
    `SELECT ROUND(AVG(Valoración),1) AS promedio, COUNT(*) AS total
       FROM RESEÑAS
      WHERE ID_Producto = ?`,
    [idProducto]
  );
  return {
    promedio: rows[0]?.promedio || 0,
    total: rows[0]?.total || 0,
  };
}

async function obtenerReseñasPorProducto(idProducto) {
  const [rows] = await pool.query(
    `SELECT r.ID_Reseña, r.ID_Usuario, r.Valoración, r.Fecha_Creación, u.Nombre_Completo
       FROM RESEÑAS r
       JOIN USUARIOS u ON r.ID_Usuario = u.ID_Usuario
      WHERE r.ID_Producto = ?
      ORDER BY r.Fecha_Creación DESC`,
    [idProducto]
  );
  return rows;
}

// Devuelve la fila de la reseña de un usuario en un producto (o undefined)
async function obtenerCalificacionUsuario(idProducto, idUsuario) {
  const [rows] = await pool.query(
    `SELECT Valoración FROM RESEÑAS WHERE ID_Producto = ? AND ID_Usuario = ?`,
    [idProducto, idUsuario]
  );
  return rows[0];
}

module.exports = {
  insertarReseña,
  obtenerPromedioYTotal,
  obtenerReseñasPorProducto,
  obtenerCalificacionUsuario,
};