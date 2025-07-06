const { pool } = require("../configuraciones/configuraciones_bd");

/**
 * Modelo para gestionar las imágenes de producto en PostgreSQL
 */
const ModeloImagenesProducto = {
  /**
   * Obtiene todas las imágenes de un producto específico
   * @param {number} idProducto
   * @returns {Promise<Array>}
   */
  async obtenerPorProducto(idProducto) {
    try {
      const result = await pool.query(
        `SELECT
           "ID_Imagen",
           "ID_Producto",
           "ID_Variante",
           "URL",
           "Alt",
           "Principal",
           "Orden"
         FROM
           "IMÁGENES_PRODUCTO"
         WHERE
           "ID_Producto" = $1
         ORDER BY
           "Principal" DESC,
           "Orden" ASC`,
        [idProducto]
      );
      return result.rows;
    } catch (error) {
      console.error("Error en modelo obtenerPorProducto:", error);
      throw error;
    }
  },

  /**
   * Obtiene la imagen principal de un producto
   * @param {number} idProducto
   * @returns {Promise<Object|null>}
   */
  async obtenerPrincipal(idProducto) {
    try {
      const result = await pool.query(
        `SELECT
           "ID_Imagen",
           "ID_Producto",
           "ID_Variante",
           "URL",
           "Alt",
           "Principal",
           "Orden"
         FROM
           "IMÁGENES_PRODUCTO"
         WHERE
           "ID_Producto" = $1
           AND "Principal" = TRUE
         LIMIT 1`,
        [idProducto]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error en modelo obtenerPrincipal:", error);
      throw error;
    }
  },

  /**
   * Inserta una nueva imagen de producto y devuelve su ID.
   * @param {Object} datos
   * @returns {Promise<number>}
   */
  async crear(datos) {
    const permitidos = [
      "ID_Producto",
      "ID_Variante",
      "URL",
      "Alt",
      "Principal",
      "Orden"
    ];
    const keys = Object.keys(datos).filter(k => permitidos.includes(k));
    if (keys.length === 0) {
      throw new Error("No se proporcionaron campos válidos para crear la imagen de producto");
    }

    const columns      = keys.map(k => `"${k}"`).join(", ");
    const values       = keys.map(k => datos[k]);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

    try {
      const result = await pool.query(
        `INSERT INTO "IMÁGENES_PRODUCTO" (${columns})
         VALUES (${placeholders})
         RETURNING "ID_Imagen"`,
        values
      );
      return result.rows[0]["ID_Imagen"];
    } catch (error) {
      console.error("Error en modelo crear imagen de producto:", error);
      throw error;
    }
  },

  /**
   * Actualiza una imagen de producto por su ID.
   * @param {number} idImagen
   * @param {Object} cambios
   * @returns {Promise<number>} filas afectadas
   */
  async actualizar(idImagen, cambios) {
    const permitidos = ["URL", "Alt", "Principal", "Orden"];
    const keys = Object.keys(cambios).filter(k => permitidos.includes(k));
    if (keys.length === 0) {
      throw new Error("No se proporcionaron campos válidos para actualizar la imagen de producto");
    }

    const sets = keys
      .map((k, i) => `"${k}" = $${i + 1}`)
      .join(", ");
    const values = keys.map(k => cambios[k]);
    values.push(idImagen); // último placeholder

    try {
      const result = await pool.query(
        `UPDATE "IMÁGENES_PRODUCTO"
         SET ${sets}
         WHERE "ID_Imagen" = $${values.length}`,
        values
      );
      return result.rowCount;
    } catch (error) {
      console.error("Error en modelo actualizar imagen de producto:", error);
      throw error;
    }
  },

  /**
   * Elimina una imagen de producto por su ID.
   * @param {number} idImagen
   * @returns {Promise<number>} filas afectadas
   */
  async eliminar(idImagen) {
    try {
      const result = await pool.query(
        `DELETE FROM "IMÁGENES_PRODUCTO"
         WHERE "ID_Imagen" = $1`,
        [idImagen]
      );
      return result.rowCount;
    } catch (error) {
      console.error("Error en modelo eliminar imagen de producto:", error);
      throw error;
    }
  }
};

module.exports = ModeloImagenesProducto;