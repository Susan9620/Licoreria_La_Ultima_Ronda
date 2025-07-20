const express = require("express")
const controladorVariantesProducto = require("../controladores/controlador_variantes_producto")

const router = express.Router()

/**
 * @route   GET /api/variantes/producto/:ID_Producto
 * @desc    Obtener todas las variantes de un producto específico
 * @access  Público
 */
router.get("/producto/:ID_Producto", controladorVariantesProducto.Obtener_Por_Producto)

/**
 * @route   GET /api/variantes/:id
 * @desc    Obtener una variante específica por su ID
 * @access  Público
 */
router.get("/:id", controladorVariantesProducto.Obtener_Por_ID)

// Ruta por defecto para testing
router.get("/", (req, res) => {
  res.json({ Mensaje: "API de variantes de producto" })
})

module.exports = router