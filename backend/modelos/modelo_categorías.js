const { pool } = require('../configuraciones/configuraciones_bd');

/**
 * Modelo para gestionar las categorías en la base de datos
 */
class ModeloCategorias {
  /**
   * Obtiene todas las categorías activas
   * @returns {Promise<Array>} - Lista de categorías
   */
  async obtenerCategorias() {
    try {
      const [categorias] = await pool.query(
        `SELECT 
           ID_Categoría,
           Nombre,
           Descripción,
           Ícono,
           Slug
         FROM 
           CATEGORÍAS
         WHERE 
           Activo = 1
         ORDER BY 
           Nombre ASC`
      );
      return categorias;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw new Error('Error al obtener las categorías');
    }
  }

  /**
   * Inserta una nueva categoría y devuelve su ID.
   */
  async crear({ Nombre, Descripción, Ícono, Slug, Activo = 1 }) {
    const [res] = await pool.query(
      `INSERT INTO CATEGORÍAS
        (Nombre, Descripción, Ícono, Slug, Activo)
       VALUES (?, ?, ?, ?, ?)`,
      [Nombre, Descripción, Ícono, Slug, Activo]
    );
    return res.insertId;
  }

  /**
   * Actualiza campos de una categoría dado su ID.
   */
  async actualizar(id, cambios) {
    const campos = [];
    const valores = [];
    for (const key of Object.keys(cambios)) {
      campos.push(`\`${key}\` = ?`);
      valores.push(cambios[key]);
    }
    valores.push(id);
    const [res] = await pool.query(
      `UPDATE CATEGORÍAS SET ${campos.join(', ')} WHERE ID_Categoría = ?`,
      valores
    );
    return res.affectedRows;
  }

  /**
   * Elimina una categoría.
   */
  async eliminar(id) {
    const [res] = await pool.query(
      `DELETE FROM CATEGORÍAS WHERE ID_Categoría = ?`,
      [id]
    );
    return res.affectedRows;
  }
}

module.exports = new ModeloCategorias();