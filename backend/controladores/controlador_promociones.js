const Modelo_Promociones = require('../modelos/modelo_promociones');

class Controlador_Promociones {
  /**
   * GET /api/Promociones
   * Devuelve todas las promociones activas y vigentes
   */
  async Obtener_Promociones(req, res) {
    try {
      let Promociones = [];
      try {
        Promociones = await Modelo_Promociones.Obtener_Promociones_Activas();
      } catch (dbErr) {
        console.warn('⚠️ No se pudieron obtener promociones desde BD, usando datos por defecto');
      }

      if (!Promociones || Promociones.length === 0) {
        Promociones = [
          {
            ID_Promoción: 1,
            Título: '2x1 en Granizados',
            Descripción: 'Todos los jueves aprovecha nuestra promo 2x1 en todos los sabores de granizados artesanales.'
          },
          {
            ID_Promoción: 2,
            Título: 'Combo Fiesta Fin de Semana',
            Descripción: 'Llévate 1 Botella de Ron + 2 Refrescos + Hielo a precio especial de promoción.'
          }
        ];
      }

      res.status(200).json({
        Éxito: true,
        Mensaje: 'Promociones obtenidas correctamente',
        Datos: Promociones
      });
    } catch (error) {
      console.error('Error en controlador de promociones:', error);
      res.status(500).json({
        Éxito: false,
        Mensaje: 'Error al obtener las promociones',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }

  /**
   * POST /api/Administrador/Promociones
   * Crea una nueva promoción (solo Administrador)
   */
  async Crear_Promoción(req, res) {
    try {
      const id = await Modelo_Promociones.Crear(req.body);
      return res.status(201).json({
        Éxito: true,
        Mensaje: 'Promoción creada correctamente',
        Datos: { idPromoción: id }
      });
    } catch (error) {
      console.error('Error al crear promoción:', error);
      return res.status(500).json({ Éxito: false, Mensaje: error.message });
    }
  }

  /**
   * PUT /api/Administrador/Promociones/:id
   * Actualiza una promoción existente (solo Administrador)
   */
  async Actualizar_Promoción(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ Éxito: false, Mensaje: 'ID inválido.' });
      }

      const Filas = await Modelo_Promociones.Actualizar(id, req.body);
      if (Filas === 0) {
        return res.status(404).json({ Éxito: false, Mensaje: 'Promoción no encontrada.' });
      }

      return res.json({ Éxito: true, Mensaje: 'Promoción actualizada correctamente.' });
    } catch (error) {
      console.error('Error al actualizar promoción:', error);
      return res.status(500).json({ Éxito: false, Mensaje: error.message });
    }
  }

  /**
   * DELETE /api/Administrador/Promociones/:id
   * Elimina una promoción (solo Administrador)
   */
  async Eliminar_Promoción(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ Éxito: false, Mensaje: 'ID inválido.' });
      }

      const Filas = await Modelo_Promociones.eliminar(id);
      if (Filas === 0) {
        return res.status(404).json({ Éxito: false, Mensaje: 'Promoción no encontrada.' });
      }

      return res.json({ Éxito: true, Mensaje: 'Promoción eliminada correctamente.' });
    } catch (error) {
      console.error('Error al eliminar promoción:', error);
      return res.status(500).json({ Éxito: false, Mensaje: error.message });
    }
  }
}

module.exports = new Controlador_Promociones();