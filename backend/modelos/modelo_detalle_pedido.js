const { pool } = require('../configuraciones/configuraciones_bd');

class ModeloDetallePedido {
  /**
   * Inserta un detalle de pedido
   * @param {{ idPedido:number, idVariante:number, cantidad:number, precioUnitario:number, subtotal:number }} datos
   */
  async insertar({ idPedido, idVariante, cantidad, precioUnitario, subtotal }) {
    const sql = `
      INSERT INTO DETALLE_PEDIDO
        (ID_Pedido, ID_Variante, Cantidad, Precio_Unitario, Subtotal)
      VALUES (?, ?, ?, ?, ?)
    `;
    await pool.query(sql, [idPedido, idVariante, cantidad, precioUnitario, subtotal]);
  }
}

module.exports = new ModeloDetallePedido();