const path = require('path');
const express = require('express');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./aplicación');
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.get('/páginas/index/undefined', (req, res) => {
  res.sendStatus(204);
});
const http = require('http');

// Obtener puerto del entorno o usar el predeterminado
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// Mostrar variables de entorno cargadas (solo en desarrollo)
console.log(`🔧 Variables de entorno cargadas: NODE_ENV=${process.env.NODE_ENV || 'no definido'}`);

// Crear servidor HTTP
const server = http.createServer(app);

// Manejo de errores del servidor
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Error: Puerto ${PORT} ya está en uso`);
  } else {
    console.error('❌ Error en el servidor:', error);
  }
  process.exit(1);
});

// Iniciar el servidor
server.listen(PORT, HOST, () => {
  console.log(`
🍹 API de Licorería corriendo en:
📡 http://${HOST}:${PORT}/
🌐 Entorno: ${process.env.NODE_ENV}
⏱️ ${new Date().toLocaleString()}
  `);
});

// Manejar señales de terminación
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Manejar excepciones no capturadas
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  
  // Cerrar el servidor graciosamente
  server.close(() => {
    process.exit(1);
  });
  
  // Si el cierre gracioso tarda demasiado, forzar salida
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});