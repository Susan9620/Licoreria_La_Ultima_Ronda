const { pool } = require("../configuraciones/configuraciones_bd");

const Modelo_Imágenes_Producto = {
  /**
   * Obtener todas las imágenes de un producto específico
   * @param {number} ID_Producto
   * @returns {Promise<Array>}
   */
  async Obtener_Por_Producto(ID_Producto) {
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
        [ID_Producto]
      );
      return Resultado.rows;
    } catch (error) {
      console.error("Error en modelo Obtener_Por_Producto:", error);
      throw error;
    }
  },

  /**
   * Obtener la imagen principal de un producto
   * @param {number} ID_Producto
   * @returns {Promise<Object|null>}
   */
  async obtenerPrincipal(ID_Producto) {
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
        [ID_Producto]
      );
      return Resultado.rows[0] || null;
    } catch (error) {
      console.error("Error en modelo obtenerPrincipal:", error);
      throw error;
    }
  },

  /**
   * Insertar una nueva imagen de producto y devolver su ID.
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
    const Marcadores = Valores.map((_, i) => `$${i + 1}`).join(", ");

    try {
      const Resultado = await pool.query(
        `INSERT INTO "IMÁGENES_PRODUCTO" (${Columnas})
         VALUES (${Marcadores})
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
   * Actualizar una imagen de producto por su ID
   * @param {number} ID_Imagen
   * @param {Object} Cambios
   * @returns {Promise<number>}
   */
  async Actualizar(ID_Imagen, Cambios) {
    const Permitidos = ["URL", "Alt", "Principal", "Orden"];
    const Claves = Object.keys(Cambios).filter(k => Permitidos.includes(k));
    if (Claves.length === 0) {
      throw new Error("No se proporcionaron campos válidos para actualizar la imagen de producto");
    }

    const Conjuntos = Claves
      .map((k, i) => `"${k}" = $${i + 1}`)
      .join(", ");
    const Valores = Claves.map(k => Cambios[k]);
    Valores.push(ID_Imagen);

    try {
      const Resultado = await pool.query(
        `UPDATE "IMÁGENES_PRODUCTO"
         SET ${Conjuntos}
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
   * Eliminar una imagen de producto por su ID
   * @param {number} ID_Imagen
   * @returns {Promise<number>}
   */
  async Eliminar(ID_Imagen) {
    try {
      const Resultado = await pool.query(
        `DELETE FROM "IMÁGENES_PRODUCTO"
         WHERE "ID_Imagen" = $1`,
        [ID_Imagen]
      );
      return Resultado.rowCount;
    } catch (error) {
      console.error("Error en modelo eliminar imagen de producto:", error);
      throw error;
    }
  }
};

module.exports = Modelo_Imágenes_Producto;