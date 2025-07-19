const express = require('express');
const modeloImagenesCarrusel = require('../modelos/modelo_imágenes_carrusel');
const modeloProductosDestacados = require('../modelos/modelo_productos');
const Modelo_Categorías = require('../modelos/modelo_categorías');

const router = express.Router();

/**
 * @route   GET /api/inicio
 * @desc    Obtener datos para la página de inicio (carrusel, destacados, etc.)
 * @access  Público
 */
router.get('/', async (req, res) => {
  try {
    // Obtener datos del carrusel
    const carrusel = await modeloImagenesCarrusel.Obtener_Imágenes_Carrusel();
    
    // Obtener productos destacados (limitar a 4)
    const productosDestacados = await modeloProductosDestacados.obtenerProductosDestacados(4);

    // Obtener categorías de productos
    const Categorías = await Modelo_Categorías.Obtener_Categorías();

    
    res.status(200).json({
      Éxito: true,
      Mensaje: 'Datos de página de inicio obtenidos correctamente',
      carrusel: carrusel,
      productosDestacados: productosDestacados,
      Categorías
    });
  } catch (error) {
    console.error('Error al obtener datos de la página de inicio:', error);
    res.status(500).json({
      Éxito: false,
      Mensaje: 'Error al cargar los datos de la página de inicio',
      Error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

module.exports = router;