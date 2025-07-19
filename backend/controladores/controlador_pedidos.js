const modeloPedidos = require('../modelos/modelo_pedidos');

class ControladorPedidos {
  /**
   * POST /api/pedidos
   */
  async crearPedido(req, res) {
    try {
      const idUsuario = req.usuario.id;

      // 🔍 DEBUG: Ver qué llega en el body
      console.log("📥 Datos recibidos en el backend:");
      console.log("   - Body completo:", JSON.stringify(req.body, null, 2));

      const {
        items,
        subtotal,
        envio,
        descuento,
        total,
        metodoPago,
        direccionEnvio,
        codigoPostal,
        instruccionesEnvio
      } = req.body;

      // 🔍 DEBUG: Verificar items específicamente
      console.log("📋 Items recibidos:", items);
      if (Array.isArray(items)) {
        items.forEach((item, index) => {
          console.log(`📦 Item ${index + 1}:`);
          console.log(`   - idVariante: ${item.idVariante} (tipo: ${typeof item.idVariante})`);
          console.log(`   - cantidad: ${item.cantidad}`);
          console.log(`   - precioUnitario: ${item.precioUnitario}`);
          console.log(`   - subtotal: ${item.subtotal}`);
        });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ Éxito: false, Mensaje: 'No hay ítems en el pedido' });
      }

      // 🔍 Verificar que todos los items tengan idVariante válido
      const itemsSinVariante = items.filter(item =>
        !item.idVariante ||
        item.idVariante === null ||
        item.idVariante === undefined ||
        item.idVariante === "null" ||
        item.idVariante === "undefined"
      );

      if (itemsSinVariante.length > 0) {
        console.error("❌ Items sin idVariante válido encontrados:", itemsSinVariante);
        return res.status(400).json({
          Éxito: false,
          Mensaje: 'Algunos items no tienen ID_Variante válido',
          itemsProblematicos: itemsSinVariante
        });
      }

      const { numeroPedido, idPedido } = await modeloPedidos.crearConDetalles({
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
      });

      return res.status(201).json({
        Éxito: true,
        Mensaje: 'Pedido y detalle guardados',
        Datos: { idPedido, númeroPedido: numeroPedido }
      });
    } catch (err) {
      console.error('Error al crear pedido con detalle:', err);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error al procesar el pedido' });
    }
  }

  async obtenerPedidoPorId(req, res) {
    try {
      const ID = parseInt(req.params.id, 10);
      if (isNaN(ID)) return res.status(400).json({ Éxito: false, Mensaje: 'ID inválido' });

      const pedido = await modeloPedidos.obtenerPorId(ID);
      if (!pedido) return res.status(404).json({ Éxito: false, Mensaje: 'Pedido no encontrado' });

      res.json({ Éxito: true, Datos: pedido });
    } catch (err) {
      console.error('Error al obtener pedido:', err);
      res.status(500).json({ Éxito: false, Mensaje: 'Error al recuperar pedido' });
    }
  }

  async obtenerPedido(req, res) {
    try {
      const idPedido = parseInt(req.params.id, 10);
      const { pedido, items } = await modeloPedidos.obtenerConDetalles(idPedido);
      return res.json({ Éxito: true, Datos: { pedido, items } });
    } catch (err) {
      console.error(err);
      return res.status(404).json({ Éxito: false, Mensaje: err.message });
    }
  }

  /**
 * GET /api/pedidos/usuario
 * Devuelve todos los pedidos del usuario autenticado
 */
  async obtenerPedidosPorUsuario(req, res) {
    try {
      const idUsuario = req.usuario.id;
      const pedidos = await modeloPedidos.obtenerPorUsuario(idUsuario);
      return res.json({ Éxito: true, Datos: pedidos });
    } catch (err) {
      console.error('Error al obtener historial de pedidos:', err);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error al recuperar historial de pedidos' });
    }
  }

  /**
   * PUT /api/admin/pedidos/:ID/estado
   * Cambia el Estado_Pedido de un pedido (solo Admin)
   */
  async cambiarEstado(req, res) {
    try {
      const idPedido = parseInt(req.params.id, 10);
      const { nuevoEstado } = req.body;

      // Validar ID
      if (isNaN(idPedido)) {
        return res.status(400).json({ Éxito: false, Mensaje: 'ID de pedido inválido.' });
      }

      // Validar estado
      const estadosPermitidos = ['Pendiente', 'Pagado', 'Entregado', 'Cancelado'];
      if (!estadosPermitidos.includes(nuevoEstado)) {
        return res.status(400).json({ Éxito: false, Mensaje: 'Estado inválido.' });
      }

      // Llamada al modelo
      const filasAfectadas = await modeloPedidos.actualizarEstado(idPedido, nuevoEstado);
      if (filasAfectadas === 0) {
        return res.status(404).json({ Éxito: false, Mensaje: 'Pedido no encontrado.' });
      }

      return res.json({ Éxito: true, Mensaje: 'Estado del pedido actualizado correctamente.' });
    } catch (error) {
      console.error('Error al cambiar estado de pedido:', error);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error interno del servidor.' });
    }
  }

  /**
   * GET /api/admin/pedidos
   * Lista todos los pedidos (solo Admin)
   */
  async obtenerTodos(req, res) {
    try {
      const pedidos = await modeloPedidos.obtenerTodos();
      return res.json({ Éxito: true, Datos: pedidos });
    } catch (error) {
      console.error('Error al listar pedidos:', error);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error interno del servidor.' });
    }
  }
}

module.exports = new ControladorPedidos();