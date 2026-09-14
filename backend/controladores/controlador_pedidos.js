const Modelo_Pedidos = require('../modelos/modelo_pedidos');

class Controlador_Pedidos {
  /**
   * POST /api/Pedidos
   * Crear pedido con todos sus detalles
   */
  async Crear_Pedido(req, res) {
    try {
      const ID_Usuario = req.Usuario.id;

      const {
        Items,
        Subtotal,
        Envío,
        Descuento,
        Total,
        Método_Pago,
        Dirección_Envío,
        Código_Postal,
        Instrucciones_Envío
      } = req.body;

      if (!Array.isArray(Items) || Items.length === 0) {
        return res.status(400).json({ Éxito: false, Mensaje: 'No hay ítems en el pedido' });
      }

      const Ítems_Sin_Variante = Items.filter(Item =>
        !Item.ID_Variante ||
        Item.ID_Variante === null ||
        Item.ID_Variante === undefined ||
        Item.ID_Variante === "null" ||
        Item.ID_Variante === "undefined"
      );

      if (Ítems_Sin_Variante.length > 0) {
        return res.status(400).json({
          Éxito: false,
          Mensaje: 'Algunos items no tienen ID_Variante válido',
          itemsProblematicos: Ítems_Sin_Variante
        });
      }

      const { Número_Pedido, ID_Pedido } = await Modelo_Pedidos.Crear_Con_Detalles({
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

  /**
   * Obtener información detallada de un pedido específico
   */
  async Obtener_Pedido_Por_ID(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ Éxito: false, Mensaje: 'ID inválido' });

      const Pedido = await Modelo_Pedidos.Obtener_Por_ID(id);
      if (!Pedido) return res.status(404).json({ Éxito: false, Mensaje: 'Pedido no encontrado' });

      res.json({ Éxito: true, Datos: Pedido });
    } catch (err) {
      console.error('Error al obtener pedido:', err);
      res.status(500).json({ Éxito: false, Mensaje: 'Error al recuperar pedido' });
    }
  }

  /**
   * Obtener detalles de un pedido específico
   */
  async Obtener_Pedido(req, res) {
    try {
      const ID_Pedido = parseInt(req.params.id, 10);
      const { Pedido, Items } = await Modelo_Pedidos.Obtener_Con_Detalles(ID_Pedido);
      return res.json({ Éxito: true, Datos: { Pedido, Items } });
    } catch (err) {
      console.error(err);
      return res.status(404).json({ Éxito: false, Mensaje: err.message });
    }
  }

  /**
 * GET /api/Pedidos/Usuario
 * Obtener pedidos del usuario autenticado
 */
  async Obtener_Pedidos_Por_Usuario(req, res) {
    try {
      const ID_Usuario = req.Usuario.id;
      const Pedidos = await Modelo_Pedidos.Obtener_Por_Usuario(ID_Usuario);
      return res.json({ Éxito: true, Datos: Pedidos });
    } catch (err) {
      console.error('Error al obtener historial de pedidos:', err);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error al recuperar historial de pedidos' });
    }
  }

  /**
   * PUT /api/Administrador/Pedidos/:id/Estado
   * Cambiar estado de un pedido (solo Administrador)
   */
  async Cambiar_Estado(req, res) {
    try {
      const ID_Pedido = parseInt(req.params.id, 10);
      const { Nuevo_Estado } = req.body;

      // Validar ID
      if (isNaN(ID_Pedido)) {
        return res.status(400).json({ Éxito: false, Mensaje: 'ID de pedido inválido.' });
      }

      // Validar estado
      const Estados_Permitidos = ['Pendiente', 'Pagado', 'Entregado', 'Cancelado'];
      if (!Estados_Permitidos.includes(Nuevo_Estado)) {
        return res.status(400).json({ Éxito: false, Mensaje: 'Estado inválido.' });
      }

      // Llamada al modelo
      const Filas_Afectadas = await Modelo_Pedidos.Actualizar_Estado(ID_Pedido, Nuevo_Estado);
      if (Filas_Afectadas === 0) {
        return res.status(404).json({ Éxito: false, Mensaje: 'Pedido no encontrado.' });
      }

      return res.json({ Éxito: true, Mensaje: 'Estado del pedido actualizado correctamente.' });
    } catch (error) {
      console.error('Error al cambiar estado de pedido:', error);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error interno del servidor.' });
    }
  }

  /**
   * GET /api/Administrador/Pedidos
   * Listar todos los pedidos (solo Administrador)
   */
  async Obtener_Todos(req, res) {
    try {
      const Pedidos = await Modelo_Pedidos.Obtener_Todos();
      return res.json({ Éxito: true, Datos: Pedidos });
    } catch (error) {
      console.error('Error al listar pedidos:', error);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error interno del servidor.' });
    }
  }
}

module.exports = new Controlador_Pedidos();