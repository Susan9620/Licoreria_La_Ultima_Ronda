const express = require("express")
const controladorVariantesProducto = require("../controladores/controlador_variantes_producto")

const Ruta = express.Router()

/**
 * @route   GET /api/Variantes/Producto/:ID_Producto
 * @desc    Obtener todas las variantes de un producto específico
 * @access  Público
 */
Ruta.get("/Producto/:ID_Producto", controladorVariantesProducto.Obtener_Por_Producto)

/**
 * @route   GET /api/Variantes/:id
 * @desc    Obtener una variante específica por su ID
 * @access  Público
 */
Ruta.get("/:id", controladorVariantesProducto.Obtener_Por_ID)

// Ruta por defecto para testing
Ruta.get("/", (req, res) => {
  res.json({ Mensaje: "API de variantes de producto" })
})

module.exports = Ruta