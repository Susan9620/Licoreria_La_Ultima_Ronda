const { pool } = require('../configuraciones/configuraciones_bd');

/**
 * Modelo para gestionar los productos (destacados y todos)
 */
class ModeloProductos {
  /**
   * Obtiene todos los productos marcados como destacados
   * @param {number} limite - Número máximo de productos a obtener
   * @returns {Promise<Array>} - Lista de productos destacados
   */
  async obtenerProductosDestacados(limite = 4) {
    try {
      const [productos] = await pool.query(
        `SELECT 
           p.ID_Producto,
           p.Nombre,
           p.Descripción_Corta,
           p.Slug,
           p.Etiqueta,
           c.Nombre AS Categoría,
           v.ID_Variante_Producto AS ID_Variante,
           v.Nombre_Variante,
           v.Graduación AS Graduacion,
           v.Precio,
           v.Precio_Oferta,
           v.Stock       AS Stock,
           i.URL AS Imagen_URL,

           -- Agregados de reseñas:
           COALESCE(AVG(r.Valoración), 0) AS CalificaciónMedia,
           COUNT(r.ID_Reseña)      AS TotalReseñas

         FROM PRODUCTOS p
         JOIN CATEGORÍAS c
           ON p.ID_Categoría = c.ID_Categoría

         LEFT JOIN VARIANTES_PRODUCTO v
           ON p.ID_Producto = v.ID_Producto
          AND v.Activo = 1
          AND v.Predeterminada = 1

         LEFT JOIN IMÁGENES_PRODUCTO i
           ON p.ID_Producto = i.ID_Producto
          AND i.Principal = 1

         LEFT JOIN RESEÑAS r
           ON p.ID_Producto = r.ID_Producto

         WHERE p.Destacado = 1
           AND p.Activo = 1

         GROUP BY p.ID_Producto
         ORDER BY p.Fecha_Actualización DESC
         LIMIT ?`,
        [limite]
      );
      return productos;
    } catch (error) {
      console.error('Error al obtener productos destacados:', error);
      throw new Error('Error al obtener los productos destacados');
    }
  }

  /**
   * Obtiene todos los productos activos (sin filtrar por destacados)
   * @returns {Promise<Array>}
   */
  async obtenerTodos() {
    try {
      const [productos] = await pool.query(`
        SELECT
          p.ID_Producto,
          p.Nombre,
          p.Descripción_Corta,
          p.Slug,
          COALESCE(r.calif, p.Calificación)   AS CalificaciónMedia,
          COALESCE(r.numReseñas, 0)           AS NumReseñas,
          p.Etiqueta,
          c.Nombre AS Categoría,
          v.ID_Variante_Producto AS ID_Variante,
          v.Nombre_Variante,
          v.Graduación     AS Graduacion,
          v.Precio,
          v.Precio_Oferta,
          v.Stock       AS Stock,
          i.URL            AS Imagen_URL
        FROM PRODUCTOS p
        JOIN CATEGORÍAS c
          ON p.ID_Categoría = c.ID_Categoría
        LEFT JOIN VARIANTES_PRODUCTO v
          ON p.ID_Producto = v.ID_Producto
          AND v.Activo = 1
          AND v.Predeterminada = 1
        LEFT JOIN IMÁGENES_PRODUCTO i
          ON p.ID_Producto = i.ID_Producto
          AND i.Principal = 1
        LEFT JOIN (
          SELECT
            ID_Producto,
            ROUND(AVG(Valoración),1) AS calif,
            COUNT(*)              AS numReseñas
          FROM RESEÑAS
          GROUP BY ID_Producto
        ) r
          ON p.ID_Producto = r.ID_Producto
        WHERE p.Activo = 1
        GROUP BY p.ID_Producto
        ORDER BY p.Nombre ASC
      `);
      return productos;
    } catch (error) {
      console.error('Error al obtener todos los productos:', error);
      throw new Error('Error al obtener todos los productos');
    }
  }

  /**
 * Obtiene los datos completos de un producto por su ID
 * @param {number} id - ID del producto
 * @returns {Promise<Object|null>} - Objeto con los datos o null si no existe
 */
  async obtenerPorId(id) {
    try {
      const [rows] = await pool.query(`
      SELECT
        p.ID_Producto,
        p.Nombre,
        p.Descripción,
        p.Descripción_Corta,
        p.Slug,
        p.Etiqueta,
        p.Cómo_Disfrutarlo      AS Cómo_Disfrutarlo,
        c.Nombre        AS Categoría,
        v.ID_Variante_Producto AS ID_Variante,
        v.Nombre_Variante,
        v.Graduación    AS Graduacion,
        v.Precio,
        v.Precio_Oferta,
        v.Stock         AS Stock,
        i.URL           AS Imagen_URL,
        -- Agregados de reseñas:
        COALESCE(rr.CalificaciónMedia, p.Calificación) AS CalificaciónMedia,
        COALESCE(rr.TotalReseñas, 0)                  AS TotalReseñas
      FROM PRODUCTOS p
      JOIN CATEGORÍAS c
        ON p.ID_Categoría = c.ID_Categoría
      LEFT JOIN VARIANTES_PRODUCTO v
        ON p.ID_Producto = v.ID_Producto
       AND v.Activo = 1
      LEFT JOIN IMÁGENES_PRODUCTO i
        ON p.ID_Producto = i.ID_Producto
       AND i.Principal = 1
      LEFT JOIN (
        SELECT
          ID_Producto,
          ROUND(AVG(Valoración),1) AS CalificaciónMedia,
          COUNT(*)                AS TotalReseñas
          FROM RESEÑAS
          GROUP BY ID_Producto
      ) rr
        ON p.ID_Producto = rr.ID_Producto
      WHERE p.ID_Producto = ?
      GROUP BY p.ID_Producto
    `, [id]);

      return rows[0] || null;
    } catch (error) {
      console.error('Error al obtener producto por ID:', error);
      throw new Error('Error al obtener producto');
    }
  }

  /**
   * Obtiene hasta `límite` productos que suelen comprarse junto
   * con la variante dada (ID_Variante_Producto).
   * @param {number} idVariante - El ID de la variante actual.
   * @param {number} límite - Máximo de productos a devolver (por defecto 4).
   * @returns {Promise<Array<{ ID_Producto: number, vecesCompradoJunto: number }>>}
   */
  async obtenerProductosCompradosJuntos(idVariante, límite = 4) {
    try {
      const [rows] = await pool.query(
        `
        SELECT 
          v2.ID_Producto AS ID_Producto,
          COUNT(*)          AS VecesCompradoJunto
        FROM DETALLE_PEDIDO dp1
        JOIN DETALLE_PEDIDO dp2
          ON dp1.ID_Pedido = dp2.ID_Pedido
         AND dp2.ID_Variante <> dp1.ID_Variante
        JOIN VARIANTES_PRODUCTO v2
          ON dp2.ID_Variante = v2.ID_Variante_Producto
        WHERE dp1.ID_Variante = ?
        GROUP BY v2.ID_Producto
        ORDER BY VecesCompradoJunto DESC
        LIMIT ?
        `,
        [idVariante, límite]
      );
      return rows; // Array de objetos { ID_Producto, VecesCompradoJunto }
    } catch (error) {
      console.error('Error al obtener productos comprados juntos:', error);
      throw new Error('Error al obtener productos comprados juntos');
    }
  }

  /**
   * Actualiza las columnas Calificación (media) y TotalReseñas en la tabla PRODUCTOS.
   * @param {number} idProducto
   * @param {number} promedio    // el nuevo valor promedio de todas las valoraciones
   * @param {number} total       // el nuevo total de reseñas
   * @returns {Promise<void>}
   */
  async actualizarCalificacionYTotal(idProducto, promedio, total) {
    try {
      const query = `
        UPDATE PRODUCTOS
        SET Calificación    = ?,
            TotalReseñas    = ?
        WHERE ID_Producto = ?
      `;
      await pool.query(query, [promedio, total, idProducto]);
    } catch (error) {
      console.error('Error al actualizar calificación y total de reseñas:', error);
      throw new Error('No se pudo actualizar la calificación del producto');
    }
  }

  /**
   * Crea un producto usando solo los campos válidos pasados en `datos`
   * y devuelve el nuevo ID.
   */
  async crear(datos) {
    // Define aquí qué campos de PRODUCTOS permites insertar
    const permitidos = [
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

    // Filtra las claves de `datos` para quedarnos solo con las permitidas
    const keys = Object.keys(datos).filter(k => permitidos.includes(k));

    if (keys.length === 0) {
      throw new Error('No se proporcionaron campos válidos para crear el producto');
    }

    // Construye la lista de columnas y placeholders
    const columns = keys.map(k => `\`${k}\``).join(', ');
    const placeholders = keys.map(_ => '?').join(', ');
    const values = keys.map(k => datos[k]);

    const sql = `INSERT INTO PRODUCTOS (${columns}) VALUES (${placeholders})`;

    const [result] = await pool.query(sql, values);
    return result.insertId;
  }

  async actualizar(idProducto, cambios) {
    // Monta dinámicamente SET según claves de `cambios`
    // Oponte a inyecciones y valida claves permitidas
    const campos = [];
    const valores = [];
    for (const key of Object.keys(cambios)) {
      campos.push(`\`${key}\` = ?`);
      valores.push(cambios[key]);
    }
    valores.push(idProducto);
    const [res] = await pool.query(
      `UPDATE PRODUCTOS SET ${campos.join(', ')} WHERE ID_Producto = ?`,
      valores
    );
    return res.affectedRows;
  }

  async eliminar(idProducto) {
    const [res] = await pool.query(
      `DELETE FROM PRODUCTOS WHERE ID_Producto = ?`,
      [idProducto]
    );
    return res.affectedRows;
  }
}

module.exports = new ModeloProductos();