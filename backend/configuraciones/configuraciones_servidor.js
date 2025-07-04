require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

/**
 * Configura el servidor Express con middleware común
 * @param {Object} app - Instancia de la aplicación Express
 */
function configurarServidor(app) {
  // Configurar CORS
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }));

  // Parser para JSON y URL-encoded
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Configurar logging en desarrollo
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Limitar peticiones para prevenir ataques
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // límite de 1000 peticiones por ventana
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas peticiones, intente más tarde' }
  });
  
  // Aplicar limitador a las rutas /api
  app.use('/api', apiLimiter);

  // Configurar directorio estático para uploads
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
  
  return app;
}

module.exports = {
  configurarServidor
};