const Modelo_Lista_Deseos = require('../modelos/modelo_lista_deseos');

class Controlador_Lista_Deseos {
  /**
   * GET /api/Deseos
   * Obtener y devolver lista de deseos del usuario
   */
  async Obtener_Lista(req, res) {
    try {
      const Usuario_ID = req.Usuario.id;
      const Datos = await Modelo_Lista_Deseos.Obtener_Por_Usuario(Usuario_ID);
      res.status(200).json({ Éxito: true, Datos });
    } catch (error) {
      console.error('Error al obtener lista de deseos:', error);
      res.status(500).json({ Éxito: false, Mensaje: 'Error al obtener la lista de deseos' });
    }
  }

  /**
   * POST /api/Deseos
   * Agregar producto a la lista de deseos del usuario
   */
  async Agregar(req, res) {
    try {
      const Usuario_ID = req.Usuario.id;
      const { Producto_ID } = req.body;
      if (!Producto_ID) {
        return res.status(400).json({ Éxito: false, Mensaje: 'Falta el ID de producto' });
      }
      const Nuevo = await Modelo_Lista_Deseos.Agregar(Usuario_ID, Producto_ID);
      res.status(201).json({ Éxito: true, Datos: Nuevo });
    } catch (error) {
      console.error('Error al agregar a lista de deseos:', error);
      res.status(500).json({ Éxito: false, Mensaje: 'Error al agregar el producto a la lista de deseos' });
    }
  }

  /**
   * DELETE /api/Deseos/:Producto_ID
   * Eliminar producto específico de la lista de deseos del usuario
   */
  async Eliminar(req, res) {
    try {
      const Usuario_ID = req.Usuario.id;
      const Producto_ID = parseInt(req.params.Producto_ID, 10);
      if (isNaN(Producto_ID)) {
        return res.status(400).json({ Éxito: false, Mensaje: 'ID de producto inválido' });
      }
      await Modelo_Lista_Deseos.Eliminar(Usuario_ID, Producto_ID);
      res.status(200).json({ Éxito: true, Mensaje: 'Producto eliminado de la lista de deseos' });
    } catch (error) {
      console.error('Error al eliminar de lista de deseos:', error);
      res.status(500).json({ Éxito: false, Mensaje: 'Error al eliminar el producto de la lista de deseos' });
    }
  }
}

module.exports = new Controlador_Lista_Deseos();