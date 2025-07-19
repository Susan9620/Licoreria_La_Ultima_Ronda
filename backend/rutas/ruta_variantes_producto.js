const express = require("express")
const controladorVariantesProducto = require("../controladores/controlador_variantes_producto")

const router = express.Router()

/**
 * @route   GET /api/variantes/producto/:idProducto
 * @desc    Obtener todas las variantes de un producto específico
 * @access  Público
 */
router.get("/producto/:idProducto", controladorVariantesProducto.obtenerPorProducto)

/**
 * @route   GET /api/variantes/:ID
 * @desc    Obtener una variante específica por su ID
 * @access  Público
 */
router.get("/:ID", controladorVariantesProducto.obtenerPorId)

// Ruta por defecto para testing
router.get("/", (req, res) => {
  res.json({ Mensaje: "API de variantes de producto" })
})

module.exports = router