const ModeloContacto = require('../modelos/modelo_contacto');

class ControladorContacto {
  // POST /api/contacto
  async crear(req, res) {
    try {
      // Si el usuario está logueado, req.usuario.id; si no, null
      const idUsuario = req.usuario?.id || null;
      const { mensaje } = req.body;

      if (!mensaje || !mensaje.trim()) {
        return res.status(400).json({ éxito: false, mensaje: 'El mensaje no puede estar vacío' });
      }

      const id = await ModeloContacto.crear(idUsuario, mensaje.trim());
      return res.status(201).json({ éxito: true, mensaje: 'Mensaje guardado', datos: { id } });
    } catch (e) {
      console.error('Error creando mensaje de contacto:', e);
      return res.status(500).json({ éxito: false, mensaje: 'Error interno al guardar el mensaje' });
    }
  }

  // GET /api/contacto  (si quieres verlos desde un panel)
  async listar(req, res) {
    try {
      const mensajes = await ModeloContacto.obtenerTodos();
      return res.json({ éxito: true, datos: mensajes });
    } catch (e) {
      console.error('Error listando mensajes de contacto:', e);
      return res.status(500).json({ éxito: false, mensaje: 'Error interno al listar mensajes' });
    }
  }
}

module.exports = new ControladorContacto();