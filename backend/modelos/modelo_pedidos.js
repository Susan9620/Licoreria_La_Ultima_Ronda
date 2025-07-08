const { pool } = require('../configuraciones/configuraciones_bd');

class ModeloPedidos {
  /**
   * Crea un pedido con sus detalles, ajusta stock, y devuelve número de pedido e ID.
   * @param {Object} datos
   * @param {number} datos.idUsuario
   * @param {Array<{idVariante:number,cantidad:number,precioUnitario:number,subtotal:number}>} datos.items
   * @param {number} datos.subtotal
   * @param {number} datos.envio
   * @param {number} datos.descuento
   * @param {number} datos.total
   * @param {string} datos.metodoPago
   * @param {string} datos.direccionEnvio
   * @param {string} datos.codigoPostal
   * @param {string} datos.instruccionesEnvio
   */
  async crearConDetalles({
    idUsuario,
    items,
    subtotal,
    envio,
    descuento,
    total,
    metodoPago,
    direccionEnvio,
    codigoPostal,
    instruccionesEnvio
  }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1) Generar número de pedido
      const { rows: maxRows } = await client.query(
        `SELECT MAX(CAST(SUBSTRING("Número_Pedido", 4) AS INTEGER)) AS maxnum
           FROM "PEDIDOS"`
      );
      const siguiente = (maxRows[0].maxnum || 0) + 1;
      const numeroPedido = 'PED' + String(siguiente).padStart(4, '0');

      // 2) Insertar el pedido
      const insertPedido = await client.query(
        `INSERT INTO "PEDIDOS"
           ("ID_Usuario","Número_Pedido","Subtotal","Envío","Descuento","Total",
            "Método_Pago","Dirección_Envío","Código_Postal","Instrucciones_Envío")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING "ID_Pedido"`,
        [
          idUsuario,
          numeroPedido,
          subtotal,
          envio,
          descuento,
          total,
          metodoPago,
          direccionEnvio,
          codigoPostal,
          instruccionesEnvio
        ]
      );
      const idPedido = insertPedido.rows[0].ID_Pedido;

      // 3) Por cada línea: descontar stock y guardar detalle
      for (const { idVariante, cantidad, precioUnitario, subtotal: sub } of items) {
        const updateStock = await client.query(
          `UPDATE "VARIANTES_PRODUCTO"
             SET "Stock" = "Stock" - $1
           WHERE "ID_Variante_Producto" = $2
             AND "Stock" >= $1`,
          [cantidad, idVariante]
        );
        if (updateStock.rowCount === 0) {
          throw new Error(`Stock insuficiente para la variante ${idVariante}`);
        }

        await client.query(
          `INSERT INTO "DETALLE_PEDIDO"
             ("ID_Pedido","ID_Variante","Cantidad","Precio_Unitario","Subtotal")
           VALUES ($1,$2,$3,$4,$5)`,
          [idPedido, idVariante, cantidad, precioUnitario, sub]
        );
      }

      await client.query('COMMIT');
      return { numeroPedido, idPedido };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error en crearConDetalles:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Obtiene un pedido por su ID, incluyendo datos de usuario.
   * @param {number} idPedido
   * @returns {Promise<Object|null>}
   */
  async obtenerPorId(idPedido) {
    try {
      const { rows: pedidoRows } = await pool.query(
        `SELECT
           p.*, u."Nombre_Completo", u."Correo_Electrónico"
         FROM "PEDIDOS" p
         JOIN "USUARIOS" u
           ON p."ID_Usuario" = u."ID_Usuario"
         WHERE p."ID_Pedido" = $1`,
        [idPedido]
      );
      if (!pedidoRows.length) return null;
      const pedido = pedidoRows[0];

      const { rows: detalleRows } = await pool.query(
        `SELECT
           d."ID_Detalle_Pedido" AS idDetalle,
           d."ID_Variante"       AS idVariante,
           d."Cantidad",
           d."Precio_Unitario",
           d."Subtotal"
         FROM "DETALLE_PEDIDO" d
         WHERE d."ID_Pedido" = $1`,
        [idPedido]
      );

      pedido.detalle = detalleRows;
      return pedido;
    } catch (error) {
      console.error('Error en obtenerPorId:', error);
      throw error;
    }
  }

  /**
   * Obtiene un pedido con detalle e información de productos, aliased a camelCase.
   * @param {number} idPedido
   * @returns {Promise<{pedido:Object, items:Array}>}
   */
  async obtenerConDetalles(idPedido) {
    try {
      const { rows: headerRows } = await pool.query(
        `SELECT
           p."ID_Pedido"           AS "idPedido",
           p."Número_Pedido"       AS "numeroPedido",
           p."Fecha_Creación"      AS "fecha",
           p."Subtotal"            AS "subtotal",
           p."Envío"               AS "envio",
           p."Descuento"           AS "descuento",
           p."Total"               AS "total",
           p."Método_Pago"         AS "metodoPago",
           p."Estado_Pedido"       AS "estadoPedido",
           p."Dirección_Envío"     AS "direccionEnvio",
           p."Código_Postal"       AS "codigoPostal",
           p."Instrucciones_Envío" AS "instruccionesEnvio",
           u."Nombre_Completo"     AS "nombreCliente",
           u."Correo_Electrónico"  AS "correoCliente"
         FROM "PEDIDOS" p
         JOIN "USUARIOS" u
           ON u."ID_Usuario" = p."ID_Usuario"
         WHERE p."ID_Pedido" = $1`,
        [idPedido]
      );
      if (!headerRows.length) {
        throw new Error('Pedido no encontrado');
      }
      const pedido = headerRows[0];

      const { rows: itemsRows } = await pool.query(
        `SELECT
           dp."ID_Variante"     AS "idVariante",
           dp."Cantidad"        AS "cantidad",
           dp."Precio_Unitario" AS "precioUnitario",
           dp."Subtotal"        AS "subtotal",
           vp."ID_Producto"     AS "idProducto",
           prod."Nombre"        AS "nombreProducto",
           vp."Nombre_Variante" AS "nombreVariante",
           img."URL"            AS "imagenUrl"
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
        [idPedido]
      );

      return { pedido, items: itemsRows };
    } catch (error) {
      console.error('Error en obtenerConDetalles:', error);
      throw error;
    }
  }

  /**
   * Devuelve todos los pedidos de un usuario.
   * @param {number} idUsuario
   * @returns {Promise<Array>}
   */
  async obtenerPorUsuario(idUsuario) {
    try {
      const { rows } = await pool.query(
        `SELECT
           p."ID_Pedido"       AS "idPedido",
           p."Número_Pedido"   AS "numeroPedido",
           p."Fecha_Creación"  AS "fecha",
           p."Total",
           p."Estado_Pedido"   AS "estadoPedido"
         FROM "PEDIDOS" p
         WHERE p."ID_Usuario" = $1
         ORDER BY p."Fecha_Creación" DESC`,
        [idUsuario]
      );
      return rows;
    } catch (error) {
      console.error('Error en obtenerPorUsuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de un pedido.
   * @param {number} idPedido
   * @param {string} nuevoEstado
   * @returns {Promise<number>} filas afectadas
   */
  async actualizarEstado(idPedido, nuevoEstado) {
    try {
      const result = await pool.query(
        `UPDATE "PEDIDOS"
           SET "Estado_Pedido" = $1
         WHERE "ID_Pedido" = $2`,
        [nuevoEstado, idPedido]
      );
      return result.rowCount;
    } catch (error) {
      console.error('Error en actualizarEstado:', error);
      throw error;
    }
  }

  /**
   * Devuelve todos los pedidos (para admin).
   * @returns {Promise<Array>}
   */
  async obtenerTodos() {
    try {
      const { rows } = await pool.query(
        `SELECT
           "ID_Pedido"       AS "idPedido",
           "Número_Pedido"   AS "numeroPedido",
           "Fecha_Creación"  AS "fecha",
           "Total",
           "Estado_Pedido"   AS "estadoPedido",
           "ID_Usuario"      AS "idUsuario"
         FROM "PEDIDOS"
         ORDER BY "Fecha_Creación" DESC`
      );
      return rows;
    } catch (error) {
      console.error('Error en obtenerTodos:', error);
      throw error;
    }
  }
}

module.exports = new ModeloPedidos();