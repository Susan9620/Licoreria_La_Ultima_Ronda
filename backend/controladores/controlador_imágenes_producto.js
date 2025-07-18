const modeloImagenesProducto = require("../modelos/modelo_imágenes_producto")

/**
 * Obtener todas las imágenes de un producto específico
 */
const obtenerPorProducto = async (req, res) => {
  try {
    const { idProducto } = req.params
    const imagenes = await modeloImagenesProducto.obtenerPorProducto(idProducto)

    res.json({
      éxito: true,
      Datos: imagenes,
      mensaje: "Imágenes obtenidas exitosamente",
    })
  } catch (error) {
    console.error(
      "Error al obtener imágenes:",
      error.message,
      "\nSQL:", error.sql
    )
    res.status(500).json({
      éxito: false,
      mensaje: error.message,
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
        éxito: false,
        mensaje: "Imagen principal no encontrada",
      })
    }

    res.json({
      éxito: true,
      Datos: imagen,
      mensaje: "Imagen principal obtenida exitosamente",
    })
  } catch (error) {
    console.error(
      "Error al obtener imágenes:",
      error.message,
      "\nSQL:", error.sql
    )
    res.status(500).json({
      éxito: false,
      mensaje: error.message,
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
    const id = await modeloImagenesProducto.crear(req.body)
    return res.status(201).json({
      éxito: true,
      mensaje: "Imagen de producto creada correctamente",
      Datos: { idImagen: id }
    })
  } catch (error) {
    console.error("Error al crear imagen de producto:", error)
    return res.status(500).json({ éxito: false, mensaje: error.message })
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
      return res.status(400).json({ éxito: false, mensaje: "ID inválido." })
    }
    const filas = await modeloImagenesProducto.actualizar(id, req.body)
    if (filas === 0) {
      return res.status(404).json({ éxito: false, mensaje: "Imagen no encontrada." })
    }
    return res.json({ éxito: true, mensaje: "Imagen de producto actualizada correctamente." })
  } catch (error) {
    console.error("Error al actualizar imagen de producto:", error)
    return res.status(500).json({ éxito: false, mensaje: error.message })
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
      return res.status(400).json({ éxito: false, mensaje: "ID inválido." })
    }
    const filas = await modeloImagenesProducto.eliminar(id)
    if (filas === 0) {
      return res.status(404).json({ éxito: false, mensaje: "Imagen no encontrada." })
    }
    return res.json({ éxito: true, mensaje: "Imagen de producto eliminada correctamente." })
  } catch (error) {
    console.error("Error al eliminar imagen de producto:", error)
    return res.status(500).json({ éxito: false, mensaje: error.message })
  }
}

module.exports = {
  obtenerPorProducto,
  obtenerPrincipal,
  crearImagenProducto,
  actualizarImagenProducto,
  eliminarImagenProducto
}