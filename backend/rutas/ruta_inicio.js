const express = require('express');
const modeloImagenesCarrusel = require('../modelos/modelo_imágenes_carrusel');
const modeloProductosDestacados = require('../modelos/modelo_productos');
const Modelo_Categorías = require('../modelos/modelo_categorías');

const Ruta = express.Router();

/**
 * @route   GET /api/Inicio
 * @desc    Obtener datos para la página de inicio (carrusel, destacados, etc.)
 * @access  Público
 */
Ruta.get('/', async (req, res) => {
  try {
    let Carrusel = [];
    let productosDestacados = [];
    let Categorías = [];

    // Obtener datos del carrusel con fallback
    try {
      Carrusel = await modeloImagenesCarrusel.Obtener_Imágenes_Carrusel();
    } catch (e) {
      console.warn('⚠️ No se pudo obtener carrusel desde BD, usando datos por defecto');
    }

    if (!Carrusel || Carrusel.length === 0) {
      Carrusel = [
        {
          ID_Imagen: 1,
          Título: 'LOS MEJORES LICORES',
          Subtítulo: 'Descubre nuestra selecta variedad de bebidas nacionales e importadas',
          URL_Imagen: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1600&auto=format&fit=crop',
          Enlace_Principal: '/html/productos.html',
          Orden: 1
        },
        {
          ID_Imagen: 2,
          Título: 'GRANIZADOS Y CÓCTELES',
          Subtítulo: 'Refrescantes combinaciones preparadas al instante para tus mejores momentos',
          URL_Imagen: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=1600&auto=format&fit=crop',
          Enlace_Principal: '/html/productos.html?Filtro=Granizados',
          Orden: 2
        },
        {
          ID_Imagen: 3,
          Título: 'DELIVERY RÁPIDO Y SEGURO',
          Subtítulo: 'Tus bebidas favoritas en la puerta de tu casa en minutos',
          URL_Imagen: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?q=80&w=1600&auto=format&fit=crop',
          Enlace_Principal: '/html/index.html#Delivery',
          Orden: 3
        }
      ];
    }

    // Obtener productos destacados con fallback
    try {
      productosDestacados = await modeloProductosDestacados.Obtener_Productos_Destacados(4);
    } catch (e) {
      console.warn('⚠️ No se pudieron obtener productos destacados desde BD');
      productosDestacados = [];
    }

    // Obtener categorías con fallback
    try {
      Categorías = await Modelo_Categorías.Obtener_Categorías();
    } catch (e) {
      console.warn('⚠️ No se pudieron obtener categorías desde BD, usando datos por defecto');
    }

    if (!Categorías || Categorías.length === 0) {
      Categorías = [
        {
          ID_Categoría: 1,
          Nombre: 'Licores',
          Descripción: 'Whiskys, rones, vodkas, tequilas, vinos y cervezas.',
          Ícono: 'fas fa-wine-bottle',
          Slug: 'licores'
        },
        {
          ID_Categoría: 2,
          Nombre: 'Granizados',
          Descripción: 'Bebidas granizadas con o sin licor, con sabores frutales.',
          Ícono: 'fas fa-cocktail',
          Slug: 'granizados'
        },
        {
          ID_Categoría: 3,
          Nombre: 'Postres',
          Descripción: 'Deliciosos postres con toques de licor para acompañar.',
          Ícono: 'fas fa-birthday-cake',
          Slug: 'postres'
        },
        {
          ID_Categoría: 4,
          Nombre: 'Packs y Regalos',
          Descripción: 'Combos especiales para celebraciones y fechas festivas.',
          Ícono: 'fas fa-gift',
          Slug: 'packs-regalos'
        }
      ];
    }
    
    res.status(200).json({
      Éxito: true,
      Mensaje: 'Datos de página de inicio obtenidos correctamente',
      Carrusel: Carrusel,
      productosDestacados: productosDestacados,
      Categorías: Categorías
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

module.exports = Ruta;