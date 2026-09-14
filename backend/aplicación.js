const express = require('express');
const cors = require('cors');
const { configurarServidor } = require('./configuraciones/configuraciones_servidor');
const { testConnection } = require('./configuraciones/configuraciones_bd');
const { notFoundHandler, errorHandler: Error_Manajador } = require('./middleware/middleware_error');
const fs = require('fs');
const path = require('path');

// Crear la aplicación Express
const app = express();
app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

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
app.get('/api/Estado', (req, res) => {
  res.json({
    Estado: 'en línea',
    versión: '1.0.0',
    entorno: process.env.NODE_ENV,
    hora: new Date().toISOString()
  });
});

// Registrar rutas de la API
app.use(['/api/Categorías', '/api/Categorias', '/api/Categor%C3%ADas'], require('./rutas/ruta_categorías'));
app.use(['/api/Carrusel', '/api/carrusel'], require('./rutas/ruta_imágenes_carrusel'));
app.use(['/api/Productos', '/api/productos'], require('./rutas/ruta_productos'));
app.use(['/api/Variantes', '/api/variantes'], require('./rutas/ruta_variantes_producto'));
app.use(['/api/Imágenes', '/api/Imagenes', '/api/Im%C3%A1genes'], require('./rutas/ruta_imágenes_producto'));
app.use(['/api/Usuarios', '/api/usuarios'], require('./rutas/ruta_usuarios'));
app.use(['/api/Promociones', '/api/promociones', '/api/Promoci%C3%B3n', '/api/Promocion'], require('./rutas/ruta_promociones'));
app.use(['/api/Deseos', '/api/deseos'], require('./rutas/ruta_lista_deseos'));
app.use(['/api/Inicio', '/api/inicio'], require('./rutas/ruta_inicio'));
app.use(['/api/Reseñas', '/api/Resenas', '/api/Rese%C3%B1as'], require('./rutas/ruta_reseñas'));
app.use(['/api/Pedidos', '/api/pedidos'], require('./rutas/ruta_pedidos'));
app.use(['/api/Contacto', '/api/contacto'], require('./rutas/ruta_contacto'));
app.use(['/api/Administrador', '/api/administrador', '/api/Administración', '/api/Administraci%C3%B3n'], require('./rutas/ruta_administrador'));

// Servir frontend
const frontendDir = path.join(__dirname, '..', 'frontend');
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'html', 'index.html'));
});

// Enrutamiento SPA/estáticos para producción o desarrollo
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const possibleHtml = path.join(frontendDir, 'html', req.path.endsWith('.html') ? req.path : `${req.path}.html`);
  if (fs.existsSync(possibleHtml) && fs.statSync(possibleHtml).isFile()) {
    return res.sendFile(possibleHtml);
  }
  const directPath = path.join(frontendDir, req.path);
  if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
    return res.sendFile(directPath);
  }
  res.sendFile(path.join(frontendDir, 'html', 'index.html'));
});

// Middleware para manejar rutas no encontradas
app.use(notFoundHandler);

// Middleware para manejar errores
app.use(Error_Manajador);

module.exports = app;