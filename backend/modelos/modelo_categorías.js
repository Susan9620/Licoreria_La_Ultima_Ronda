const { pool } = require('../configuraciones/configuraciones_bd');

class Modelo_Categorías {
  /**
   * Obtener todas las categorías activas
   * @returns {Promise<Array>}
   */
  async Obtener_Categorías() {
    try {
      const Categorías = await pool.query(
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
      return Categorías.rows;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw new Error('Error al obtener las categorías');
    }
  }

  /**
   * Insertar una nueva categoría y devolver su ID.
   */
  async Crear({ Nombre, Descripción, Ícono, Slug, Activo = true }) {
    try {
      const Resultado = await pool.query(
        `INSERT INTO "CATEGORÍAS"
           ("Nombre", "Descripción", "Ícono", "Slug", "Activo")
         VALUES ($1, $2, $3, $4, $5)
         RETURNING "ID_Categoría"`,
        [Nombre, Descripción, Ícono, Slug, Activo]
      );
      return Resultado.rows[0]['ID_Categoría'];
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw new Error('Error al crear la categoría');
    }
  }

  /**
   * Actualizar campos de una categoría dado su ID.
   */
  async Actualizar(id, Cambios) {
    try {
      const Campos = [];
      const Valores = [];
      let Índice = 1;

      for (const Clave of Object.keys(Cambios)) {
        Campos.push(`"${Clave}" = $${Índice}`);
        Valores.push(Cambios[Clave]);
        Índice++;
      }

      Valores.push(id);

      const Resultado = await pool.query(
        `UPDATE "CATEGORÍAS"
         SET ${Campos.join(', ')}
         WHERE "ID_Categoría" = $${Índice}`,
        Valores
      );
      return Resultado.rowCount;
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      throw new Error('Error al actualizar la categoría');
    }
  }

  /**
   * Eliminar una categoría.
   */
  async eliminar(id) {
    try {
      const Resultado = await pool.query(
        `DELETE FROM "CATEGORÍAS"
         WHERE "ID_Categoría" = $1`,
        [id]
      );
      return Resultado.rowCount;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw new Error('Error al eliminar la categoría');
    }
  }
}

module.exports = new Modelo_Categorías();