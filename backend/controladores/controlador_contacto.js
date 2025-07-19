const Modelo_Contacto = require('../modelos/modelo_contacto');

class Controlador_Contacto {
  /**
   * POST /api/contacto
   * Crear y guardar un nuevo mensaje
   */
  async Crear(req, res) {
    try {
      const ID_Usuario = req.usuario?.id || null;
      const { Mensaje } = req.body;

      if (!Mensaje || !Mensaje.trim()) {
        return res.status(400).json({ Éxito: false, Mensaje: 'El mensaje no puede estar vacío' });
      }

      const id = await Modelo_Contacto.Crear(ID_Usuario, Mensaje.trim());
      return res.status(201).json({ Éxito: true, Mensaje: 'Mensaje guardado', Datos: { id } });
    } catch (e) {
      console.error('Error creando mensaje de contacto:', e);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error interno al guardar el mensaje' });
    }
  }
 
  /**
   * GET /api/contacto
   * Obtener todos los mensajes
   */
  async Listar(req, res) {
    try {
      const Mensajes = await Modelo_Contacto.Obtener_Todos();
      return res.json({ Éxito: true, Datos: Mensajes });
    } catch (e) {
      console.error('Error listando mensajes de contacto:', e);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error interno al listar mensajes' });
    }
  }
}

module.exports = new Controlador_Contacto();