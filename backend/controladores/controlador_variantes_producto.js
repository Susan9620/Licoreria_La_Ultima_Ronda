const modeloVariantesProducto = require("../modelos/modelo_variantes_producto")

/**
 * Obtener todas las variantes de un producto específico
 */
const Obtener_Por_Producto = async (req, res) => {
  try {
    const { ID_Producto } = req.params
    const variantes = await modeloVariantesProducto.Obtener_Por_Producto(ID_Producto)

    res.json({
      Éxito: true,
      Datos: variantes,
      Mensaje: "Variantes obtenidas exitosamente",
    })
  } catch (error) {
    // imprime en consola el mensaje y la consulta que falló
    console.error(
      "Error al obtener variantes:",
      error.message,
      "\nSQL:", error.sql
    )
    // devuelve al cliente el mensaje real para depuración
    res.status(500).json({
      Éxito: false,
      Mensaje: error.message,
      sql: error.sql
    })
  }
}

/**
 * Obtener una variante específica por ID
 */
const Obtener_Por_ID = async (req, res) => {
  try {
    const { id } = req.params
    const variante = await modeloVariantesProducto.Obtener_Por_ID(id)

    if (!variante) {
      return res.status(404).json({
        Éxito: false,
        Mensaje: "Variante no encontrada",
      })
    }

    res.json({
      Éxito: true,
      Datos: variante,
      Mensaje: "Variante obtenida exitosamente",
    })
  } catch (error) {
    // imprime en consola el mensaje y la consulta que falló
    console.error(
      "Error al obtener variantes:",
      error.message,
      "\nSQL:", error.sql
    )
    // devuelve al cliente el mensaje real para depuración
    res.status(500).json({
      Éxito: false,
      Mensaje: error.message,
      sql: error.sql
    })
  }
}

module.exports = {
  Obtener_Por_Producto,
  Obtener_Por_ID,
}