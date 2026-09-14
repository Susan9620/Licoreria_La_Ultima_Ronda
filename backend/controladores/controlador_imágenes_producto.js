const Modelo_Imágenes_Producto = require("../modelos/modelo_imágenes_producto")

/**
 * GET /api/Imágenes/producto/:ID_Producto
 * Obtener imágenes de un producto específico
 */
const Obtener_Por_Producto = async (req, res) => {
  try {
    const { ID_Producto } = req.params
    const Imágenes = await Modelo_Imágenes_Producto.Obtener_Por_Producto(ID_Producto)

    res.json({
      Éxito: true,
      Datos: Imágenes,
      Mensaje: "Imágenes obtenidas exitosamente",
    })
  } catch (error) {
    console.error(
      "Error al obtener imágenes:",
      error.message,
      "\nSQL:", error.sql
    )
    res.status(500).json({
      Éxito: false,
      Mensaje: error.message,
      sql: error.sql
    })
  }
}

/**
 * GET /api/Imágenes/principal/:ID_Producto
 * Obtener imagen principal de un producto
 */
const Obtener_Principal = async (req, res) => {
  try {
    const { ID_Producto } = req.params
    const Imagen = await Modelo_Imágenes_Producto.Obtener_Principal(ID_Producto)

    if (!Imagen) {
      return res.status(404).json({
        Éxito: false,
        Mensaje: "Imagen principal no encontrada",
      })
    }

    res.json({
      Éxito: true,
      Datos: Imagen,
      Mensaje: "Imagen principal obtenida exitosamente",
    })
  } catch (error) {
    console.error(
      "Error al obtener imágenes:",
      error.message,
      "\nSQL:", error.sql
    )
    res.status(500).json({
      Éxito: false,
      Mensaje: error.message,
      sql: error.sql
    })
  }
}

/**
 * POST /api/Administrador/Imágenes
 * Crear imagen de producto (solo Administrador)
 */
const Crear_Imagen_Producto = async (req, res) => {
  try {
    const id = await Modelo_Imágenes_Producto.Crear(req.body)
    return res.status(201).json({
      Éxito: true,
      Mensaje: "Imagen de producto creada correctamente",
      Datos: { ID_Imagen: id }
    })
  } catch (error) {
    console.error("Error al crear imagen de producto:", error)
    return res.status(500).json({ Éxito: false, Mensaje: error.message })
  }
}

/**
 * PUT /api/Administrador/Imágenes/:id
 * Actualiza una imagen de producto (solo Administrador)
 */
const Actualizar_Imagen_Producto = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ Éxito: false, Mensaje: "ID inválido." })
    }
    const Filas = await Modelo_Imágenes_Producto.Actualizar(id, req.body)
    if (Filas === 0) {
      return res.status(404).json({ Éxito: false, Mensaje: "Imagen no encontrada." })
    }
    return res.json({ Éxito: true, Mensaje: "Imagen de producto actualizada correctamente." })
  } catch (error) {
    console.error("Error al actualizar imagen de producto:", error)
    return res.status(500).json({ Éxito: false, Mensaje: error.message })
  }
}

/**
 * DELETE /api/Administrador/Imágenes/:id
 * Elimina una imagen de producto (solo Administrador)
 */
const Eliminar_Imagen_Producto = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ Éxito: false, Mensaje: "ID inválido." })
    }
    const Filas = await Modelo_Imágenes_Producto.Eliminar(id)
    if (Filas === 0) {
      return res.status(404).json({ Éxito: false, Mensaje: "Imagen no encontrada." })
    }
    return res.json({ Éxito: true, Mensaje: "Imagen de producto eliminada correctamente." })
  } catch (error) {
    console.error("Error al eliminar imagen de producto:", error)
    return res.status(500).json({ Éxito: false, Mensaje: error.message })
  }
}

module.exports = {
  Obtener_Por_Producto,
  Obtener_Principal,
  Crear_Imagen_Producto,
  Actualizar_Imagen_Producto,
  Eliminar_Imagen_Producto
}