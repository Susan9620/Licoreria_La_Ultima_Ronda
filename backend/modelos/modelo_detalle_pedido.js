const { pool } = require('../configuraciones/configuraciones_bd');

class Modelo_Detalle_Pedido {
  /**
   * Insertar un detalle de pedido
   * @param {{ ID_Pedido:number, ID_Variante:number, Cantidad:number, Precio_Unitario:number, Subtotal:number }} Datos
   * @returns {Promise<number>}
   */
  async Insertar({ ID_Pedido, ID_Variante, Cantidad, Precio_Unitario, Subtotal }) {
    try {
      const Resultado = await pool.query(
        `INSERT INTO "DETALLE_PEDIDO"
           ("ID_Pedido", "ID_Variante", "Cantidad", "Precio_Unitario", "Subtotal")
         VALUES ($1, $2, $3, $4, $5)`,
        [ID_Pedido, ID_Variante, Cantidad, Precio_Unitario, Subtotal]
      );
      return Resultado.rowCount;
    } catch (error) {
      console.error('Error al insertar detalle de pedido:', error);
      throw new Error('Error al insertar el detalle de pedido');
    }
  }
}

module.exports = new Modelo_Detalle_Pedido();