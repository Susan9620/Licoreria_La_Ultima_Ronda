const { pool } = require('../configuraciones/configuraciones_bd');

class ModeloDetallePedido {
  /**
   * Inserta un detalle de pedido
   * @param {{ idPedido:number, idVariante:number, cantidad:number, precioUnitario:number, subtotal:number }} Datos
   * @returns {Promise<number>} número de filas afectadas
   */
  async insertar({ idPedido, idVariante, cantidad, precioUnitario, subtotal }) {
    try {
      const result = await pool.query(
        `INSERT INTO "DETALLE_PEDIDO"
           ("ID_Pedido", "ID_Variante", "Cantidad", "Precio_Unitario", "Subtotal")
         VALUES ($1, $2, $3, $4, $5)`,
        [idPedido, idVariante, cantidad, precioUnitario, subtotal]
      );
      return result.rowCount;
    } catch (error) {
      console.error('Error al insertar detalle de pedido:', error);
      throw new Error('Error al insertar el detalle de pedido');
    }
  }
}

module.exports = new ModeloDetallePedido();