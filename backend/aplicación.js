const express = require('express');
const { configurarServidor } = require('./configuraciones/configuraciones_servidor');
const { testConnection } = require('./configuraciones/configuraciones_bd');
const { notFoundHandler, errorHandler } = require('./middleware/middleware_error');
const fs = require('fs');
const path = require('path');

// Crear la aplicación Express
const app = express();

// Aplicar configuraciones iniciales del servidor
configurarServidor(app);

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Verificar conexión a base de datos
testConnection().then(connected => {
  if (connected) {
    console.log('🛢️ Base de datos lista para operar');
  } else {
    console.warn('⚠️ La aplicación continuará funcionando sin base de datos');
    console.warn('⚠️ Algunas funciones pueden no estar disponibles');
  }
}).catch(err => {
  console.error('❌ Error crítico al conectar a la base de datos:', err);
  console.warn('⚠️ La aplicación continuará funcionando en modo limitado');
});

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ruta de estado de la API
app.get('/api/estado', (req, res) => {
  res.json({
    estado: 'en línea',
    versión: '1.0.0',
    entorno: process.env.NODE_ENV,
    hora: new Date().toISOString()
  });
});

// Registrar rutas de la API
app.use('/api/categorias', require('./rutas/ruta_categorías'));
app.use('/api/carrusel', require('./rutas/ruta_imágenes_carrusel'));
app.use('/api/productos', require('./rutas/ruta_productos'));
app.use('/api/variantes', require('./rutas/ruta_variantes_producto'));
app.use('/api/imagenes', require('./rutas/ruta_imágenes_producto'));
app.use('/api/usuarios', require('./rutas/ruta_usuarios'));
app.use('/api/promociones', require('./rutas/ruta_promociones'));
app.use('/api/deseos', require('./rutas/ruta_lista_deseos'));
app.use('/api/inicio', require('./rutas/ruta_inicio'));
app.use('/api/reseñas', require('./rutas/ruta_reseñas'));
app.use('/api/pedidos', require('./rutas/ruta_pedidos'));
app.use('/api/contacto', require('./rutas/ruta_contacto'));
app.use('/api/admin', require('./rutas/ruta_administrador'));

// Rutas temporales para endpoints que aún no están implementados
// app.use('/api/pedidos', express.Router().get('/', (req, res) => res.json({ mensaje: 'API de pedidos' })));
// app.use('/api/contacto', express.Router().get('/', (req, res) => res.json({ mensaje: 'API de contacto' })));

// Servir frontend en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '..', 'frontend', 'páginas', 'index', 'index.html'))
  );
}

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  const frontendDir = path.join(__dirname, '..', 'frontend');
  
  // Todas las rutas no-API serán dirigidas al frontend
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDir, 'páginas', 'index', 'index.html'));
    }
  });
}

// Middleware para manejar rutas no encontradas
app.use(notFoundHandler);

// Middleware para manejar errores
app.use(errorHandler);

module.exports = app;