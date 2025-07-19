const { pool } = require('../configuraciones/configuraciones_bd');

class Modelo_Pedidos {
  /**
   * Crear un pedido con sus detalles, ajustar stock, y devolver número de pedido e ID.
   * @param {Object} Datos
   * @param {number} Datos.ID_Usuario
   * @param {Array<{ID_Variante:number,Cantidad:number,Precio_Unitario:number,Subtotal:number}>} Datos.Items
   * @param {number} Datos.Subtotal
   * @param {number} Datos.Envío
   * @param {number} Datos.Descuento
   * @param {number} Datos.Total
   * @param {string} Datos.Método_Pago
   * @param {string} Datos.Dirección_Envío
   * @param {string} Datos.Código_Postal
   * @param {string} Datos.Instrucciones_Envío
   */
  async Crear_Con_Detalles({
    ID_Usuario,
    Items,
    Subtotal,
    Envío,
    Descuento,
    Total,
    Método_Pago,
    Dirección_Envío,
    Código_Postal,
    Instrucciones_Envío
  }) {
    const Cliente = await pool.connect();
    try {
      await Cliente.query('BEGIN');

      // Generar número de pedido
      const { rows: Filas_Máximas } = await Cliente.query(
        `SELECT MAX(CAST(SUBSTRING("Número_Pedido", 4) AS INTEGER)) AS Número_Máximo
           FROM "PEDIDOS"`
      );
      const Siguiente = (Filas_Máximas[0].Número_Máximo || 0) + 1;
      const Número_Pedido = 'PED' + String(Siguiente).padStart(4, '0');

      // Insertar el pedido
      const Insertar_Pedido = await Cliente.query(
        `INSERT INTO "PEDIDOS"
           ("ID_Usuario","Número_Pedido","Subtotal","Envío","Descuento","Total",
            "Método_Pago","Dirección_Envío","Código_Postal","Instrucciones_Envío")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING "ID_Pedido"`,
        [
          ID_Usuario,
          Número_Pedido,
          Subtotal,
          Envío,
          Descuento,
          Total,
          Método_Pago,
          Dirección_Envío,
          Código_Postal,
          Instrucciones_Envío
        ]
      );
      const ID_Pedido = Insertar_Pedido.rows[0].ID_Pedido;

      // Descontar stock por cada línea y guardar detalle
      for (const { ID_Variante, Cantidad, Precio_Unitario, Subtotal: Subtotales } of Items) {
        const Actualizar_Stock = await Cliente.query(
          `UPDATE "VARIANTES_PRODUCTO"
             SET "Stock" = "Stock" - $1
           WHERE "ID_Variante_Producto" = $2
             AND "Stock" >= $1`,
          [Cantidad, ID_Variante]
        );
        if (Actualizar_Stock.rowCount === 0) {
          throw new Error(`Stock insuficiente para la variante ${ID_Variante}`);
        }

        await Cliente.query(
          `INSERT INTO "DETALLE_PEDIDO"
             ("ID_Pedido","ID_Variante","Cantidad","Precio_Unitario","Subtotal")
           VALUES ($1,$2,$3,$4,$5)`,
          [ID_Pedido, ID_Variante, Cantidad, Precio_Unitario, Subtotales]
        );
      }

      await Cliente.query('COMMIT');
      return { Número_Pedido, ID_Pedido };
    } catch (err) {
      await Cliente.query('ROLLBACK');
      console.error('Error en Crear_Con_Detalles:', err);
      throw err;
    } finally {
      Cliente.release();
    }
  }

  /**
   * Obtener un pedido por su ID, incluyendo los datos de usuario
   * @param {number} ID_Pedido
   * @returns {Promise<Object|null>}
   */
  async Obtener_Por_ID(ID_Pedido) {
    try {
      const { rows: Filas_Pedido } = await pool.query(
        `SELECT
           p.*, u."Nombre_Completo", u."Correo_Electrónico"
         FROM "PEDIDOS" p
         JOIN "USUARIOS" u
           ON p."ID_Usuario" = u."ID_Usuario"
         WHERE p."ID_Pedido" = $1`,
        [ID_Pedido]
      );
      if (!Filas_Pedido.length) return null;
      const Pedido = Filas_Pedido[0];

      const { rows: Detalle_Filas } = await pool.query(
        `SELECT
           d."ID_Detalle_Pedido" AS ID_Detalle,
           d."ID_Variante"       AS ID_Variante,
           d."Cantidad",
           d."Precio_Unitario",
           d."Subtotal"
         FROM "DETALLE_PEDIDO" d
         WHERE d."ID_Pedido" = $1`,
        [ID_Pedido]
      );

      Pedido.detalle = Detalle_Filas;
      return Pedido;
    } catch (error) {
      console.error('Error en Obtener_Por_ID:', error);
      throw error;
    }
  }

  /**
   * Obtener un pedido con detalle e información de productos
   * @param {number} ID_Pedido
   * @returns {Promise<{Pedido:Object, Items:Array}>}
   */
  async Obtener_Con_Detalles(ID_Pedido) {
    try {
      const { rows: Encabezado_Filas } = await pool.query(
        `SELECT
           p."ID_Pedido"           AS "ID_Pedido",
           p."Número_Pedido"       AS "Número_Pedido",
           p."Fecha_Creación"      AS "Fecha",
           p."Subtotal"            AS "Subtotal",
           p."Envío"               AS "Envío",
           p."Descuento"           AS "Descuento",
           p."Total"               AS "Total",
           p."Método_Pago"         AS "Método_Pago",
           p."Estado_Pedido"       AS "Estado_Pedido",
           p."Dirección_Envío"     AS "Dirección_Envío",
           p."Código_Postal"       AS "Código_Postal",
           p."Instrucciones_Envío" AS "Instrucciones_Envío",
           u."Nombre_Completo"     AS "Nombre_Cliente",
           u."Correo_Electrónico"  AS "Correo_Cliente"
         FROM "PEDIDOS" p
         JOIN "USUARIOS" u
           ON u."ID_Usuario" = p."ID_Usuario"
         WHERE p."ID_Pedido" = $1`,
        [ID_Pedido]
      );
      if (!Encabezado_Filas.length) {
        throw new Error('Pedido no encontrado');
      }
      const Pedido = Encabezado_Filas[0];

      const { rows: Items_Filas } = await pool.query(
        `SELECT
           dp."ID_Variante"     AS "ID_Variante",
           dp."Cantidad"        AS "Cantidad",
           dp."Precio_Unitario" AS "Precio_Unitario",
           dp."Subtotal"        AS "Subtotal",
           vp."ID_Producto"     AS "ID_Producto",
           prod."Nombre"        AS "Nombre_Producto",
           vp."Nombre_Variante" AS "Nombre_Variante",
           img."URL"            AS "URL_Imagen"
         FROM "DETALLE_PEDIDO" dp
         JOIN "VARIANTES_PRODUCTO" vp
           ON vp."ID_Variante_Producto" = dp."ID_Variante"
         JOIN "PRODUCTOS" prod
           ON prod."ID_Producto" = vp."ID_Producto"
         LEFT JOIN (
           SELECT "ID_Producto", "URL"
             FROM "IMÁGENES_PRODUCTO"
            WHERE "Principal" = TRUE
            GROUP BY "ID_Producto","URL"
         ) img
           ON img."ID_Producto" = prod."ID_Producto"
         WHERE dp."ID_Pedido" = $1`,
        [ID_Pedido]
      );

      return { Pedido, Items: Items_Filas };
    } catch (error) {
      console.error('Error en Obtener_Con_Detalles:', error);
      throw error;
    }
  }

  /**
   * Devolver todos los pedidos de un usuario
   * @param {number} ID_Usuario
   * @returns {Promise<Array>}
   */
  async Obtener_Por_Usuario(ID_Usuario) {
    try {
      const { rows: Filas_Usuario } = await pool.query(
        `SELECT
           p."ID_Pedido"       AS "ID_Pedido",
           p."Número_Pedido"   AS "Número_Pedido",
           p."Fecha_Creación"  AS "Fecha",
           p."Total",
           p."Estado_Pedido"   AS "Estado_Pedido"
         FROM "PEDIDOS" p
         WHERE p."ID_Usuario" = $1
         ORDER BY p."Fecha_Creación" DESC`,
        [ID_Usuario]
      );
      return Filas_Usuario;
    } catch (error) {
      console.error('Error en Obtener_Por_Usuario:', error);
      throw error;
    }
  }

  /**
   * Actualizar el estado de un pedido
   * @param {number} ID_Pedido
   * @param {string} Nuevo_Estado
   * @returns {Promise<number>}
   */
  async Actualizar_Estado(ID_Pedido, Nuevo_Estado) {
    try {
      const Resultado = await pool.query(
        `UPDATE "PEDIDOS"
           SET "Estado_Pedido" = $1
         WHERE "ID_Pedido" = $2`,
        [Nuevo_Estado, ID_Pedido]
      );
      return Resultado.rowCount;
    } catch (error) {
      console.error('Error en Actualizar_Estado:', error);
      throw error;
    }
  }

  /**
   * Devolver todos los pedidos (solo administrador)
   * @returns {Promise<Array>}
   */
  async Obtener_Todos() {
    try {
      const { rows: Filas_Pedidos } = await pool.query(
        `SELECT
           "ID_Pedido"       AS "ID_Pedido",
           "Número_Pedido"   AS "Número_Pedido",
           "Fecha_Creación"  AS "Fecha",
           "Total",
           "Estado_Pedido"   AS "Estado_Pedido",
           "ID_Usuario"      AS "ID_Usuario"
         FROM "PEDIDOS"
         ORDER BY "Fecha_Creación" DESC`
      );
      return Filas_Pedidos;
    } catch (error) {
      console.error('Error en Obtener_Todos:', error);
      throw error;
    }
  }
}

module.exports = new Modelo_Pedidos();