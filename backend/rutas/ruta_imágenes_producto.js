const express = require("express")
const controladorImagenesProducto = require("../controladores/controlador_imágenes_producto")

const Ruta = express.Router()

/**
 * @route   GET /api/Imágenes/Producto/:ID_Producto
 * @desc    Obtener todas las imágenes de un producto específico
 * @access  Público
 */
Ruta.get("/Producto/:ID_Producto", controladorImagenesProducto.Obtener_Por_Producto)

/**
 * @route   GET /api/Imágenes/principal/:ID_Producto
 * @desc    Obtener la imagen principal de un producto
 * @access  Público
 */
Ruta.get("/principal/:ID_Producto", controladorImagenesProducto.Obtener_Principal)

// Ruta por defecto para testing
Ruta.get("/", (req, res) => {
  res.json({ Mensaje: "API de imágenes de producto" })
})

module.exports = Ruta