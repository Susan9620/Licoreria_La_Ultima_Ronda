const modeloListaDeseos = require('../modelos/modelo_lista_deseos');

/**
 * Controlador para gestionar la lista de deseos
 */
class ControladorListaDeseos {
  /**
   * GET /api/deseos
   */
  async obtenerLista(req, res) {
    try {
      const Usuario_ID = req.usuario.id;
      const Datos = await modeloListaDeseos.Obtener_Por_Usuario(Usuario_ID);
      res.status(200).json({ Éxito: true, Datos });
    } catch (error) {
      console.error('Error al obtener lista de deseos:', error);
      res.status(500).json({ Éxito: false, Mensaje: 'Error al obtener la lista de deseos' });
    }
  }

  /**
   * POST /api/deseos
   */
  async agregar(req, res) {
    try {
      const Usuario_ID = req.usuario.id;
      const { Producto_ID } = req.body;
      if (!Producto_ID) {
        return res.status(400).json({ Éxito: false, Mensaje: 'Falta el ID de producto' });
      }
      const nuevo = await modeloListaDeseos.agregar(Usuario_ID, Producto_ID);
      res.status(201).json({ Éxito: true, Datos: nuevo });
    } catch (error) {
      console.error('Error al agregar a lista de deseos:', error);
      res.status(500).json({ Éxito: false, Mensaje: 'Error al agregar el producto a la lista de deseos' });
    }
  }

  /**
   * DELETE /api/deseos/:Producto_ID
   */
  async Eliminar(req, res) {
    try {
      const Usuario_ID = req.usuario.id;
      const Producto_ID = parseInt(req.params.Producto_ID, 10);
      if (isNaN(Producto_ID)) {
        return res.status(400).json({ Éxito: false, Mensaje: 'ID de producto inválido' });
      }
      await modeloListaDeseos.Eliminar(Usuario_ID, Producto_ID);
      res.status(200).json({ Éxito: true, Mensaje: 'Producto eliminado de la lista de deseos' });
    } catch (error) {
      console.error('Error al eliminar de lista de deseos:', error);
      res.status(500).json({ Éxito: false, Mensaje: 'Error al eliminar el producto de la lista de deseos' });
    }
  }
}

module.exports = new ControladorListaDeseos();