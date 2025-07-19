const ModeloContacto = require('../modelos/modelo_contacto');

class ControladorContacto {
  // POST /api/contacto
  async crear(req, res) {
    try {
      // Si el usuario está logueado, req.usuario.ID; si no, null
      const IDUsuario = req.usuario?.id || null;
      const { Mensaje } = req.body;

      if (!Mensaje || !Mensaje.trim()) {
        return res.status(400).json({ Éxito: false, Mensaje: 'El mensaje no puede estar vacío' });
      }

      const ID = await ModeloContacto.crear(IDUsuario, Mensaje.trim());
      return res.status(201).json({ Éxito: true, Mensaje: 'Mensaje guardado', Datos: { ID: ID } });
    } catch (e) {
      console.error('Error creando mensaje de contacto:', e);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error interno al guardar el mensaje' });
    }
  }

  // GET /api/contacto  (si quieres verlos desde un panel)
  async listar(req, res) {
    try {
      const Mensajes = await ModeloContacto.obtenerTodos();
      return res.json({ Éxito: true, Datos: Mensajes });
    } catch (e) {
      console.error('Error listando mensajes de contacto:', e);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error interno al listar mensajes' });
    }
  }
}

module.exports = new ControladorContacto();