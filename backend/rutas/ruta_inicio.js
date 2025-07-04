const express = require('express');
const modeloImagenesCarrusel = require('../modelos/modelo_imágenes_carrusel');
const modeloProductosDestacados = require('../modelos/modelo_productos');
const modeloCategorias = require('../modelos/modelo_categorías');

const router = express.Router();

/**
 * @route   GET /api/inicio
 * @desc    Obtener datos para la página de inicio (carrusel, destacados, etc.)
 * @access  Público
 */
router.get('/', async (req, res) => {
  try {
    // Obtener datos del carrusel
    const carrusel = await modeloImagenesCarrusel.obtenerImagenesCarrusel();
    
    // Obtener productos destacados (limitar a 4)
    const productosDestacados = await modeloProductosDestacados.obtenerProductosDestacados(4);

    // Obtener categorías de productos
    const categorias = await modeloCategorias.obtenerCategorias();

    
    res.status(200).json({
      éxito: true,
      mensaje: 'Datos de página de inicio obtenidos correctamente',
      carrusel: carrusel,
      productosDestacados: productosDestacados,
      categorias
      // Otros datos que podrías incluir en el futuro:
      // categorias: categorias,
      // promociones: promociones
    });
  } catch (error) {
    console.error('Error al obtener datos de la página de inicio:', error);
    res.status(500).json({
      éxito: false,
      mensaje: 'Error al cargar los datos de la página de inicio',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

module.exports = router;