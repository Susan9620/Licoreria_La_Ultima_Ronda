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
      const categorias = await pool.query(
        `SELECT 
         "ID_Categoría",
         "Nombre",
         "Descripción",
         "Ícono",
         "Slug"
       FROM 
         "CATEGORÍAS"
       WHERE 
         "Activo" = TRUE
       ORDER BY 
         "Nombre" ASC`
      );
      return categorias.rows;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw new Error('Error al obtener las categorías');
    }
  }

  /**
   * Inserta una nueva categoría y devuelve su ID.
   */
  async crear({ Nombre, Descripción, Ícono, Slug, Activo = true }) {
    try {
      const result = await pool.query(
        `INSERT INTO "CATEGORÍAS"
           ("Nombre", "Descripción", "Ícono", "Slug", "Activo")
         VALUES ($1, $2, $3, $4, $5)
         RETURNING "ID_Categoría"`,
        [Nombre, Descripción, Ícono, Slug, Activo]
      );
      return result.rows[0]['ID_Categoría'];
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw new Error('Error al crear la categoría');
    }
  }

  /**
   * Actualiza campos de una categoría dado su ID.
   */
  async actualizar(id, cambios) {
    try {
      const campos = [];
      const valores = [];
      let idx = 1;

      for (const key of Object.keys(cambios)) {
        campos.push(`"${key}" = $${idx}`);
        valores.push(cambios[key]);
        idx++;
      }

      // El último placeholder es para el id
      valores.push(id);

      const result = await pool.query(
        `UPDATE "CATEGORÍAS"
         SET ${campos.join(', ')}
         WHERE "ID_Categoría" = $${idx}`,
        valores
      );
      return result.rowCount;
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      throw new Error('Error al actualizar la categoría');
    }
  }

  /**
   * Elimina una categoría.
   */
  async eliminar(id) {
    try {
      const result = await pool.query(
        `DELETE FROM "CATEGORÍAS"
         WHERE "ID_Categoría" = $1`,
        [id]
      );
      return result.rowCount;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw new Error('Error al eliminar la categoría');
    }
  }
}

module.exports = new ModeloCategorias();