const modeloImagenesProducto = require("../modelos/modelo_imágenes_producto")

/**
 * Obtener todas las imágenes de un producto específico
 */
const obtenerPorProducto = async (req, res) => {
  try {
    const { idProducto } = req.params
    const imagenes = await modeloImagenesProducto.obtenerPorProducto(idProducto)

    res.json({
      Éxito: true,
      Datos: imagenes,
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
 * Obtener la imagen principal de un producto
 */
const obtenerPrincipal = async (req, res) => {
  try {
    const { idProducto } = req.params
    const imagen = await modeloImagenesProducto.obtenerPrincipal(idProducto)

    if (!imagen) {
      return res.status(404).json({
        Éxito: false,
        Mensaje: "Imagen principal no encontrada",
      })
    }

    res.json({
      Éxito: true,
      Datos: imagen,
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
 * POST /api/admin/imagenes
 * Crea una nueva imagen de producto (solo Admin)
 */
const crearImagenProducto = async (req, res) => {
  try {
    const id = await modeloImagenesProducto.Crear(req.body)
    return res.status(201).json({
      Éxito: true,
      Mensaje: "Imagen de producto creada correctamente",
      Datos: { idImagen: id }
    })
  } catch (error) {
    console.error("Error al crear imagen de producto:", error)
    return res.status(500).json({ Éxito: false, Mensaje: error.message })
  }
}

/**
 * PUT /api/admin/imagenes/:id
 * Actualiza una imagen de producto (solo Admin)
 */
const actualizarImagenProducto = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ Éxito: false, Mensaje: "ID inválido." })
    }
    const Filas = await modeloImagenesProducto.Actualizar(id, req.body)
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
 * DELETE /api/admin/imagenes/:id
 * Elimina una imagen de producto (solo Admin)
 */
const eliminarImagenProducto = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ Éxito: false, Mensaje: "ID inválido." })
    }
    const Filas = await modeloImagenesProducto.eliminar(id)
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
  obtenerPorProducto,
  obtenerPrincipal,
  crearImagenProducto,
  actualizarImagenProducto,
  eliminarImagenProducto
}