const { pool } = require('../configuraciones/configuraciones_bd');
const modeloDetalle = require('./modelo_detalle_pedido');

class ModeloPedidos {
  async crearConDetalles({
    idUsuario,
    items,          // [{ idVariante, cantidad, precioUnitario, subtotal }, …]
    subtotal,
    envio,
    descuento,
    total,
    metodoPago,
    direccionEnvio,
    codigoPostal,
    instruccionesEnvio
  }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1) Generar número de pedido
      const [maxRow] = await conn.query(
        `SELECT MAX(CAST(SUBSTRING(Número_Pedido,4) AS UNSIGNED)) AS maxNum FROM PEDIDOS`
      );
      const siguiente = (maxRow[0].maxNum || 0) + 1;
      const numeroPedido = 'PED' + String(siguiente).padStart(4, '0');

      // 2) Insertar el pedido
      const [res] = await conn.query(
        `INSERT INTO PEDIDOS
           (ID_Usuario, Número_Pedido, Subtotal, Envío, Descuento, Total, Método_Pago,
            Dirección_Envío, \`Código_Postal\`, Instrucciones_Envío)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          idUsuario, numeroPedido,
          subtotal, envio, descuento, total, metodoPago,
          direccionEnvio, codigoPostal, instruccionesEnvio
        ]
      );
      const idPedido = res.insertId;

      // 3) Por cada línea, descontar stock y luego guardar el detalle
      for (const { idVariante, cantidad, precioUnitario, subtotal } of items) {
        // 3.1) Restar stock (y verificar que hay suficiente)
        const [updateResult] = await conn.query(
          `UPDATE VARIANTES_PRODUCTO
           SET Stock = Stock - ?
         WHERE ID_Variante_Producto = ?
           AND Stock >= ?`,
          [cantidad, idVariante, cantidad]
        );
        if (updateResult.affectedRows === 0) {
          throw new Error(`Stock insuficiente para la variante ${idVariante}`);
        }

        // 3.2) Insertar línea de detalle
        await conn.query(
          `INSERT INTO DETALLE_PEDIDO
           (ID_Pedido, ID_Variante, Cantidad, Precio_Unitario, Subtotal)
         VALUES (?, ?, ?, ?, ?)`,
          [idPedido, idVariante, cantidad, precioUnitario, subtotal]
        );
      }

      await conn.commit();
      return { numeroPedido, idPedido };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  async obtenerPorId(idPedido) {
    // 1) Traer cabecera del pedido
    const [rowsPedido] = await pool.query(
      `SELECT p.*, u.Nombre_Completo, u.Correo_Electrónico
     FROM PEDIDOS p
     JOIN USUARIOS u ON p.ID_Usuario = u.ID_Usuario
     WHERE p.ID_Pedido = ?`,
      [idPedido]
    );
    if (rowsPedido.length === 0) return null;
    const pedido = rowsPedido[0];

    // 2) Traer líneas de detalle
    const [rowsDetalle] = await pool.query(
      `SELECT d.ID_Detalle_Pedido, d.ID_Variante, d.Cantidad, d.Precio_Unitario, d.Subtotal
     FROM DETALLE_PEDIDO d
     WHERE d.ID_Pedido = ?`,
      [idPedido]
    );

    pedido.detalle = rowsDetalle;
    return pedido;
  }

  async obtenerConDetalles(idPedido) {
    // 1) Cabecera del pedido, con alias a camelCase
    const [rowsPedido] = await pool.query(
      `SELECT
       p.ID_Pedido            AS idPedido,
       p.Número_Pedido        AS numeroPedido,
       p.Fecha_Creación       AS fecha,
       p.Subtotal             AS subtotal,
       p.Envío                AS envio,
       p.Descuento            AS descuento,
       p.Total                AS total,
       p.\`Método_Pago\`      AS metodoPago,
       p.\`Estado_Pedido\`    AS estadoPedido,
       p.Dirección_Envío      AS direccionEnvio,
       p.\`Código_Postal\`    AS codigoPostal,
       p.Instrucciones_Envío  AS instruccionesEnvio,
       u.Nombre_Completo      AS nombreCliente,
       u.Correo_Electrónico   AS correoCliente
     FROM PEDIDOS p
     JOIN USUARIOS u ON u.ID_Usuario = p.ID_Usuario
     WHERE p.ID_Pedido = ?`,
      [idPedido]
    );
    if (!rowsPedido.length) throw new Error('Pedido no encontrado');
    const pedido = rowsPedido[0];

    // 2) Detalle de líneas, con alias a camelCase
    const [rowsItems] = await pool.query(
      `SELECT
      dp.ID_Variante      AS idVariante,
      dp.Cantidad         AS cantidad,
      dp.Precio_Unitario  AS precioUnitario,
      dp.Subtotal         AS subtotal,
      vp.ID_Producto      AS idProducto,
      prod.Nombre         AS nombreProducto,
      vp.Nombre_Variante  AS nombreVariante,
      img.URL             AS imagenUrl
    FROM DETALLE_PEDIDO dp
    JOIN VARIANTES_PRODUCTO vp ON vp.ID_Variante_Producto = dp.ID_Variante
    JOIN PRODUCTOS prod       ON prod.ID_Producto        = vp.ID_Producto
    LEFT JOIN (
      SELECT ID_Producto, URL
      FROM IMÁGENES_PRODUCTO
      WHERE Principal = 1
      GROUP BY ID_Producto
    ) img ON img.ID_Producto = prod.ID_Producto
    WHERE dp.ID_Pedido = ?`,
      [idPedido]
    );

    return { pedido, items: rowsItems };
  }

  /**
   * Devuelve todos los pedidos de un usuario dado
   */
  async obtenerPorUsuario(idUsuario) {
    const [rows] = await pool.query(
      `SELECT 
         p.ID_Pedido            AS idPedido,
         p.Número_Pedido        AS numeroPedido,
         p.Fecha_Creación       AS fecha,
         p.Total                AS total,
         p.Estado_Pedido        AS estadoPedido
       FROM PEDIDOS p
       WHERE p.ID_Usuario = ?
       ORDER BY p.Fecha_Creación DESC`,
      [idUsuario]
    );
    return rows;
  }

  /**
   * Actualiza el Estado_Pedido de un pedido dado.
   * @param {number} idPedido 
   * @param {string} nuevoEstado
   * @returns {number} Número de filas afectadas
   */
  async actualizarEstado(idPedido, nuevoEstado) {
    const [resultado] = await pool.query(
      'UPDATE PEDIDOS SET Estado_Pedido = ? WHERE ID_Pedido = ?',
      [nuevoEstado, idPedido]
    );
    return resultado.affectedRows;
  }

  /**
   * Devuelve todos los pedidos (solo Admin)
   */
  async obtenerTodos() {
    const [rows] = await pool.query(
      `SELECT 
         ID_Pedido         AS idPedido,
         Número_Pedido     AS numeroPedido,
         Fecha_Creación    AS fecha,
         Total             AS total,
         Estado_Pedido     AS estadoPedido,
         ID_Usuario        AS idUsuario
       FROM PEDIDOS
       ORDER BY Fecha_Creación DESC`
    );
    return rows;
  }
}

module.exports = new ModeloPedidos();