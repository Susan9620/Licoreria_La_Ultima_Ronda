const express = require("express")
const controladorImagenesProducto = require("../controladores/controlador_imágenes_producto")

const router = express.Router()

/**
 * @route   GET /api/imagenes/producto/:idProducto
 * @desc    Obtener todas las imágenes de un producto específico
 * @access  Público
 */
router.get("/producto/:idProducto", controladorImagenesProducto.obtenerPorProducto)

/**
 * @route   GET /api/imagenes/principal/:idProducto
 * @desc    Obtener la imagen principal de un producto
 * @access  Público
 */
router.get("/principal/:idProducto", controladorImagenesProducto.obtenerPrincipal)

// Ruta por defecto para testing
router.get("/", (req, res) => {
  res.json({ mensaje: "API de imágenes de producto" })
})

module.exports = router