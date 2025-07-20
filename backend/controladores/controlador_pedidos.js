const modeloPedidos = require('../modelos/modelo_pedidos');

class ControladorPedidos {
  /**
   * POST /api/pedidos
   */
  async crearPedido(req, res) {
    try {
      const ID_Usuario = req.usuario.id;

      // 🔍 DEBUG: Ver qué llega en el body
      console.log("📥 Datos recibidos en el backend:");
      console.log("   - Body completo:", JSON.stringify(req.body, null, 2));

      const {
        Items: Items,
        Subtotal,
        Envío,
        Descuento,
        Total,
        Método_Pago,
        Dirección_Envío,
        Código_Postal,
        Instrucciones_Envío
      } = req.body;

      // 🔍 DEBUG: Verificar items específicamente
      console.log("📋 Items recibidos:", Items);
      if (Array.isArray(Items)) {
        Items.forEach((item, index) => {
          console.log(`📦 Item ${index + 1}:`);
          console.log(`   - ID_Variante: ${item.ID_Variante} (Tipo: ${typeof item.ID_Variante})`);
          console.log(`   - Cantidad: ${item.Cantidad}`);
          console.log(`   - Precio_Unitario: ${item.Precio_Unitario}`);
          console.log(`   - Subtotal: ${item.Subtotal}`);
        });
      }

      if (!Array.isArray(Items) || Items.length === 0) {
        return res.status(400).json({ Éxito: false, Mensaje: 'No hay ítems en el pedido' });
      }

      // 🔍 Verificar que todos los items tengan ID_Variante válido
      const itemsSinVariante = Items.filter(item =>
        !item.ID_Variante ||
        item.ID_Variante === null ||
        item.ID_Variante === undefined ||
        item.ID_Variante === "null" ||
        item.ID_Variante === "undefined"
      );

      if (itemsSinVariante.length > 0) {
        console.error("❌ Items sin ID_Variante válido encontrados:", itemsSinVariante);
        return res.status(400).json({
          Éxito: false,
          Mensaje: 'Algunos items no tienen ID_Variante válido',
          itemsProblematicos: itemsSinVariante
        });
      }

      const { Número_Pedido, ID_Pedido } = await modeloPedidos.Crear_Con_Detalles({
        ID_Usuario,
        Items: Items,
        Subtotal,
        Envío,
        Descuento,
        Total,
        Método_Pago,
        Dirección_Envío,
        Código_Postal,
        Instrucciones_Envío
      });

      return res.status(201).json({
        Éxito: true,
        Mensaje: 'Pedido y detalle guardados',
        Datos: { ID_Pedido, númeroPedido: Número_Pedido }
      });
    } catch (err) {
      console.error('Error al crear pedido con detalle:', err);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error al procesar el pedido' });
    }
  }

  async obtenerPedidoPorId(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ Éxito: false, Mensaje: 'ID inválido' });

      const Pedido = await modeloPedidos.Obtener_Por_ID(id);
      if (!Pedido) return res.status(404).json({ Éxito: false, Mensaje: 'Pedido no encontrado' });

      res.json({ Éxito: true, Datos: Pedido });
    } catch (err) {
      console.error('Error al obtener pedido:', err);
      res.status(500).json({ Éxito: false, Mensaje: 'Error al recuperar pedido' });
    }
  }

  async obtenerPedido(req, res) {
    try {
      const ID_Pedido = parseInt(req.params.id, 10);
      const { Pedido, Items } = await modeloPedidos.Obtener_Con_Detalles(ID_Pedido);
      return res.json({ Éxito: true, Datos: { Pedido, Items } });
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
      const ID_Usuario = req.usuario.id;
      const pedidos = await modeloPedidos.Obtener_Por_Usuario(ID_Usuario);
      return res.json({ Éxito: true, Datos: pedidos });
    } catch (err) {
      console.error('Error al obtener historial de pedidos:', err);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error al recuperar historial de pedidos' });
    }
  }

  /**
   * PUT /api/admin/pedidos/:id/estado
   * Cambia el Estado_Pedido de un pedido (solo Admin)
   */
  async cambiarEstado(req, res) {
    try {
      const ID_Pedido = parseInt(req.params.id, 10);
      const { Nuevo_Estado } = req.body;

      // Validar ID
      if (isNaN(ID_Pedido)) {
        return res.status(400).json({ Éxito: false, Mensaje: 'ID de pedido inválido.' });
      }

      // Validar estado
      const estadosPermitidos = ['Pendiente', 'Pagado', 'Entregado', 'Cancelado'];
      if (!estadosPermitidos.includes(Nuevo_Estado)) {
        return res.status(400).json({ Éxito: false, Mensaje: 'Estado inválido.' });
      }

      // Llamada al modelo
      const filasAfectadas = await modeloPedidos.Actualizar_Estado(ID_Pedido, Nuevo_Estado);
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
  async Obtener_Todos(req, res) {
    try {
      const pedidos = await modeloPedidos.Obtener_Todos();
      return res.json({ Éxito: true, Datos: pedidos });
    } catch (error) {
      console.error('Error al listar pedidos:', error);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error interno del servidor.' });
    }
  }
}

module.exports = new ControladorPedidos();