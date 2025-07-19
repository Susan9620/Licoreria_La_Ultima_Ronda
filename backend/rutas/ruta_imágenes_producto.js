const express = require("express")
const controladorImagenesProducto = require("../controladores/controlador_imágenes_producto")

const router = express.Router()

/**
 * @route   GET /api/imagenes/producto/:ID_Producto
 * @desc    Obtener todas las imágenes de un producto específico
 * @access  Público
 */
router.get("/producto/:ID_Producto", controladorImagenesProducto.Obtener_Por_Producto)

/**
 * @route   GET /api/imagenes/principal/:ID_Producto
 * @desc    Obtener la imagen principal de un producto
 * @access  Público
 */
router.get("/principal/:ID_Producto", controladorImagenesProducto.obtenerPrincipal)

// Ruta por defecto para testing
router.get("/", (req, res) => {
  res.json({ Mensaje: "API de imágenes de producto" })
})

module.exports = router