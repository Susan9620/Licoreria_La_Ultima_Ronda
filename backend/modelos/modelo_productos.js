const { pool } = require('../configuraciones/configuraciones_bd');

/**
 * Modelo para gestionar los productos (destacados y todos) en PostgreSQL
 */
class ModeloProductos {
  /**
   * Obtiene los productos marcados como destacados
   * @param {number} limite
   * @returns {Promise<Array>}
   */
  async obtenerProductosDestacados(limite = 4) {
    try {
      const Resultado = await pool.query(
        `SELECT 
           p."ID_Producto",
           p."Nombre",
           p."Descripción_Corta",
           p."Slug",
           p."Etiqueta",
           c."Nombre" AS "Categoría",
           v."ID_Variante_Producto" AS "ID_Variante",
           v."Nombre_Variante",
           v."Graduación" AS "Graduacion",
           v."Precio",
           v."Precio_Oferta",
           v."Stock",
           i."URL" AS "Imagen_URL",
           COALESCE(AVG(r."Valoración"), 0) AS "CalificaciónMedia",
           COUNT(r."ID_Reseña")   AS "TotalReseñas"
         FROM "PRODUCTOS" p
         JOIN "CATEGORÍAS" c
           ON p."ID_Categoría" = c."ID_Categoría"
         LEFT JOIN "VARIANTES_PRODUCTO" v
           ON p."ID_Producto" = v."ID_Producto"
           AND v."Activo" = TRUE
           AND v."Predeterminada" = TRUE
         LEFT JOIN "IMÁGENES_PRODUCTO" i
           ON p."ID_Producto" = i."ID_Producto"
           AND i."Principal" = TRUE
         LEFT JOIN "RESEÑAS" r
           ON p."ID_Producto" = r."ID_Producto"
         WHERE p."Destacado" = TRUE
           AND p."Activo"   = TRUE
         GROUP BY
           p."ID_Producto", p."Nombre", p."Descripción_Corta", p."Slug",
           p."Etiqueta", c."Nombre",
           v."ID_Variante_Producto", v."Nombre_Variante", v."Graduación",
           v."Precio", v."Precio_Oferta", v."Stock", i."URL"
         ORDER BY p."Fecha_Actualización" DESC
         LIMIT $1`,
        [limite]
      );
      return Resultado.rows;
    } catch (error) {
      console.error('Error al obtener productos destacados:', error);
      throw new Error('Error al obtener los productos destacados');
    }
  }

  /**
   * Obtiene todos los productos activos
   * @returns {Promise<Array>}
   */
  async obtenerTodos() {
    try {
      const productos = await pool.query(`
       SELECT
          p."ID_Producto",
          p."Nombre",
          p."Descripción_Corta",
          p."Slug",
          COALESCE(r.calif, p."Calificación") AS "CalificaciónMedia",
          COALESCE(r.numReseñas, 0) AS "NumReseñas",
          p."Etiqueta",
          c."Nombre" AS "Categoría",
          v."ID_Variante_Producto" AS "ID_Variante",
          v."Nombre_Variante",
          v."Graduación" AS "Graduacion",
          v."Precio",
          v."Precio_Oferta",
          v."Stock" AS "Stock",
          i."URL" AS "Imagen_URL"
        FROM "PRODUCTOS" p
        JOIN "CATEGORÍAS" c
          ON p."ID_Categoría" = c."ID_Categoría"
        LEFT JOIN "VARIANTES_PRODUCTO" v
          ON p."ID_Producto" = v."ID_Producto"
          AND v."Activo" = TRUE
          AND v."Predeterminada" = TRUE
        LEFT JOIN LATERAL (
          SELECT i."URL"
          FROM "IMÁGENES_PRODUCTO" i
          WHERE i."ID_Producto" = p."ID_Producto"
            AND i."Principal" = TRUE
          ORDER BY i."ID_Imagen" ASC
          LIMIT 1
        ) i ON TRUE
        LEFT JOIN (
          SELECT
            "ID_Producto",
            ROUND(AVG("Valoración"), 1) AS calif,
            COUNT(*) AS numReseñas
          FROM "RESEÑAS"
          GROUP BY "ID_Producto"
        ) r
          ON p."ID_Producto" = r."ID_Producto"
        WHERE p."Activo" = TRUE
        ORDER BY p."Nombre" ASC;

      `);
      return productos.rows;
    } catch (error) {
      console.error('Error al obtener todos los productos:', error);
      throw new Error('Error al obtener todos los productos');
    }
  }

  /**
   * Obtiene los datos completos de un producto por su ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async obtenerPorId(id) {
    try {
      const Resultado = await pool.query(
        `SELECT
           p."ID_Producto",
           p."Nombre",
           p."Descripción",
           p."Descripción_Corta",
           p."Slug",
           p."Etiqueta",
           p."Cómo_Disfrutarlo",
           c."Nombre"                    AS "Categoría",
           v."ID_Variante_Producto"      AS "ID_Variante",
           v."Nombre_Variante",
           v."Graduación"                AS "Graduacion",
           v."Precio",
           v."Precio_Oferta",
           v."Stock",
           i."URL"                       AS "Imagen_URL",
           COALESCE(rr."CalificaciónMedia", p."Calificación") AS "CalificaciónMedia",
           COALESCE(rr."TotalReseñas", 0)                  AS "TotalReseñas"
         FROM "PRODUCTOS" p
         JOIN "CATEGORÍAS" c
           ON p."ID_Categoría" = c."ID_Categoría"
         LEFT JOIN "VARIANTES_PRODUCTO" v
           ON p."ID_Producto" = v."ID_Producto"
           AND v."Activo" = TRUE
         LEFT JOIN "IMÁGENES_PRODUCTO" i
           ON p."ID_Producto" = i."ID_Producto"
           AND i."Principal" = TRUE
         LEFT JOIN (
           SELECT
             "ID_Producto",
             ROUND(AVG("Valoración")::numeric,1) AS "CalificaciónMedia",
             COUNT(*)                          AS "TotalReseñas"
           FROM "RESEÑAS"
           GROUP BY "ID_Producto"
         ) rr
           ON p."ID_Producto" = rr."ID_Producto"
         WHERE p."ID_Producto" = $1
         GROUP BY
           p."ID_Producto", c."Nombre",
           v."ID_Variante_Producto", v."Nombre_Variante", v."Graduación",
           v."Precio", v."Precio_Oferta", v."Stock", i."URL",
           rr."CalificaciónMedia", rr."TotalReseñas"`,
        [id]
      );
      return Resultado.rows[0] || null;
    } catch (error) {
      console.error('Error al obtener producto por ID:', error);
      throw new Error('Error al obtener producto');
    }
  }

  /**
   * Obtiene productos que se compran juntos con la variante dada
   * @param {number} ID_Variante
   * @param {number} limite
   * @returns {Promise<Array>}
   */
  async obtenerProductosCompradosJuntos(ID_Variante, limite = 4) {
    try {
      const Resultado = await pool.query(
        `SELECT
           v2."ID_Producto"           AS "ID_Producto",
           COUNT(*)                   AS "VecesCompradoJunto"
         FROM "DETALLE_PEDIDO" dp1
         JOIN "DETALLE_PEDIDO" dp2
           ON dp1."ID_Pedido"   = dp2."ID_Pedido"
           AND dp2."ID_Variante" <> dp1."ID_Variante"
         JOIN "VARIANTES_PRODUCTO" v2
           ON dp2."ID_Variante" = v2."ID_Variante_Producto"
         WHERE dp1."ID_Variante" = $1
         GROUP BY v2."ID_Producto"
         ORDER BY "VecesCompradoJunto" DESC
         LIMIT $2`,
        [ID_Variante, limite]
      );
      return Resultado.rows;
    } catch (error) {
      console.error('Error al obtener productos comprados juntos:', error);
      throw new Error('Error al obtener productos comprados juntos');
    }
  }

  /**
   * Actualiza Calificación y TotalReseñas de un producto
   * @param {number} idProducto
   * @param {number} promedio
   * @param {number} total
   */
  async actualizarCalificacionYTotal(idProducto, promedio, total) {
    try {
      await pool.query(
        `UPDATE "PRODUCTOS"
           SET "Calificación" = $1,
               "TotalReseñas" = $2
         WHERE "ID_Producto" = $3`,
        [promedio, total, idProducto]
      );
    } catch (error) {
      console.error('Error al actualizar calificación y total de reseñas:', error);
      throw new Error('No se pudo actualizar la calificación del producto');
    }
  }

  /**
   * Crea un producto con los campos válidos y devuelve su ID
   * @param {Object} Datos
   * @returns {Promise<number>}
   */
  async Crear(Datos) {
    const Permitidos = [
      'ID_Categoría',
      'Nombre',
      'Descripción_Corta',
      'Slug',
      'Descripción',
      'Cómo_Disfrutarlo',
      'Origen',
      'Destacado',
      'Etiqueta',
      'Activo'
    ];
    const Claves = Object.keys(Datos).filter(k => Permitidos.includes(k));
    if (Claves.length === 0) {
      throw new Error('No se proporcionaron campos válidos para crear el producto');
    }

    const Columnas = Claves.map(k => `"${k}"`).join(', ');
    const Valores = Claves.map(k => Datos[k]);
    const placeholders = Valores.map((_, i) => `$${i + 1}`).join(', ');

    try {
      const Resultado = await pool.query(
        `INSERT INTO "PRODUCTOS" (${Columnas})
         VALUES (${placeholders})
         RETURNING "ID_Producto"`,
        Valores
      );
      return Resultado.rows[0]['ID_Producto'];
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw new Error('Error al crear el producto');
    }
  }

  /**
   * Actualiza un producto por su ID y devuelve filas afectadas
   * @param {number} idProducto
   * @param {Object} Cambios
   * @returns {Promise<number>}
   */
  async Actualizar(idProducto, Cambios) {
    const Campos = [];
    const Valores = [];
    Object.keys(Cambios).forEach((Clave, Índice) => {
      Campos.push(`"${Clave}" = $${Índice + 1}`);
      Valores.push(Cambios[Clave]);
    });
    Valores.push(idProducto);

    try {
      const Resultado = await pool.query(
        `UPDATE "PRODUCTOS"
           SET ${Campos.join(', ')}
         WHERE "ID_Producto" = $${Valores.length}`,
        Valores
      );
      return Resultado.rowCount;
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw new Error('Error al actualizar el producto');
    }
  }

  /**
   * Elimina un producto por su ID y devuelve filas afectadas
   * @param {number} idProducto
   * @returns {Promise<number>}
   */
  async Eliminar(idProducto) {
    try {
      const Resultado = await pool.query(
        `DELETE FROM "PRODUCTOS"
         WHERE "ID_Producto" = $1`,
        [idProducto]
      );
      return Resultado.rowCount;
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw new Error('Error al eliminar el producto');
    }
  }
}

module.exports = new ModeloProductos();