const Modelo_Variantes_Producto = require("../modelos/modelo_variantes_producto")

/**
 * GET /api/Imágenes/Producto/:ID_Producto
 * Obtener variantes por ID
 */
const Obtener_Por_Producto = async (req, res) => {
  try {
    const { ID_Producto } = req.params
    const Variantes = await Modelo_Variantes_Producto.Obtener_Por_Producto(ID_Producto)

    res.json({
      Éxito: true,
      Datos: Variantes,
      Mensaje: "Variantes obtenidas exitosamente",
    })
  } catch (error) {
    console.error(
      "Error al obtener variantes:",
      error.message,
      "\nSQL:", error.sql
    )
    res.status(500).json({
      Éxito: false,
      Mensaje: error.message,
      SQL: error.sql
    })
  }
}

/**
 * GET /api/Productos/:id
 * Obtener variante específica por ID
 */
const Obtener_Por_ID = async (req, res) => {
  try {
    const { id } = req.params
    const Variante = await Modelo_Variantes_Producto.Obtener_Por_ID(id)

    if (!Variante) {
      return res.status(404).json({
        Éxito: false,
        Mensaje: "Variante no encontrada",
      })
    }

    res.json({
      Éxito: true,
      Datos: Variante,
      Mensaje: "Variante obtenida exitosamente",
    })
  } catch (error) {
    console.error(
      "Error al obtener variantes:",
      error.message,
      "\nSQL:", error.sql
    )
    res.status(500).json({
      Éxito: false,
      Mensaje: error.message,
      SQL: error.sql
    })
  }
}

module.exports = {
  Obtener_Por_Producto,
  Obtener_Por_ID,
}