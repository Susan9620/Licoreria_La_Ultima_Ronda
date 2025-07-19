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
      const Resultado = await pool.query(
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
      return Resultado.rows;
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
      const Resultado = await pool.query(
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
      return Resultado.rows[0] || null;
    } catch (error) {
      console.error("Error en modelo obtenerPrincipal:", error);
      throw error;
    }
  },

  /**
   * Inserta una nueva imagen de producto y devuelve su ID.
   * @param {Object} Datos
   * @returns {Promise<number>}
   */
  async Crear(Datos) {
    const Permitidos = [
      "ID_Producto",
      "ID_Variante",
      "URL",
      "Alt",
      "Principal",
      "Orden"
    ];
    const Claves = Object.keys(Datos).filter(k => Permitidos.includes(k));
    if (Claves.length === 0) {
      throw new Error("No se proporcionaron campos válidos para crear la imagen de producto");
    }

    const Columnas      = Claves.map(k => `"${k}"`).join(", ");
    const Valores       = Claves.map(k => Datos[k]);
    const placeholders = Valores.map((_, i) => `$${i + 1}`).join(", ");

    try {
      const Resultado = await pool.query(
        `INSERT INTO "IMÁGENES_PRODUCTO" (${Columnas})
         VALUES (${placeholders})
         RETURNING "ID_Imagen"`,
        Valores
      );
      return Resultado.rows[0]["ID_Imagen"];
    } catch (error) {
      console.error("Error en modelo crear imagen de producto:", error);
      throw error;
    }
  },

  /**
   * Actualiza una imagen de producto por su ID.
   * @param {number} idImagen
   * @param {Object} Cambios
   * @returns {Promise<number>} filas afectadas
   */
  async Actualizar(idImagen, Cambios) {
    const Permitidos = ["URL", "Alt", "Principal", "Orden"];
    const Claves = Object.keys(Cambios).filter(k => Permitidos.includes(k));
    if (Claves.length === 0) {
      throw new Error("No se proporcionaron campos válidos para actualizar la imagen de producto");
    }

    const sets = Claves
      .map((k, i) => `"${k}" = $${i + 1}`)
      .join(", ");
    const Valores = Claves.map(k => Cambios[k]);
    Valores.push(idImagen); // último placeholder

    try {
      const Resultado = await pool.query(
        `UPDATE "IMÁGENES_PRODUCTO"
         SET ${sets}
         WHERE "ID_Imagen" = $${Valores.length}`,
        Valores
      );
      return Resultado.rowCount;
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
  async Eliminar(idImagen) {
    try {
      const Resultado = await pool.query(
        `DELETE FROM "IMÁGENES_PRODUCTO"
         WHERE "ID_Imagen" = $1`,
        [idImagen]
      );
      return Resultado.rowCount;
    } catch (error) {
      console.error("Error en modelo eliminar imagen de producto:", error);
      throw error;
    }
  }
};

module.exports = ModeloImagenesProducto;