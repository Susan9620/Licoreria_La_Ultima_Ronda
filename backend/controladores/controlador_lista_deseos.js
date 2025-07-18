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
      const usuarioId = req.usuario.id;
      const Datos = await modeloListaDeseos.obtenerPorUsuario(usuarioId);
      res.status(200).json({ éxito: true, Datos });
    } catch (error) {
      console.error('Error al obtener lista de deseos:', error);
      res.status(500).json({ éxito: false, mensaje: 'Error al obtener la lista de deseos' });
    }
  }

  /**
   * POST /api/deseos
   */
  async agregar(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { productoId } = req.body;
      if (!productoId) {
        return res.status(400).json({ éxito: false, mensaje: 'Falta el ID de producto' });
      }
      const nuevo = await modeloListaDeseos.agregar(usuarioId, productoId);
      res.status(201).json({ éxito: true, Datos: nuevo });
    } catch (error) {
      console.error('Error al agregar a lista de deseos:', error);
      res.status(500).json({ éxito: false, mensaje: 'Error al agregar el producto a la lista de deseos' });
    }
  }

  /**
   * DELETE /api/deseos/:productoId
   */
  async eliminar(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const productoId = parseInt(req.params.productoId, 10);
      if (isNaN(productoId)) {
        return res.status(400).json({ éxito: false, mensaje: 'ID de producto inválido' });
      }
      await modeloListaDeseos.eliminar(usuarioId, productoId);
      res.status(200).json({ éxito: true, mensaje: 'Producto eliminado de la lista de deseos' });
    } catch (error) {
      console.error('Error al eliminar de lista de deseos:', error);
      res.status(500).json({ éxito: false, mensaje: 'Error al eliminar el producto de la lista de deseos' });
    }
  }
}

module.exports = new ControladorListaDeseos();