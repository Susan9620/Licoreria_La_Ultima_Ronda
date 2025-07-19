/**
 * Maneja errores 404 - Rutas no encontradas
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const notFoundHandler = (req, res, next) => {
  const Error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  res.status(404);
  next(Error);
};

/**
 * Maneja errores generales de la aplicación
 * @param {Error} err - Objeto de error
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Manejar errores específicos de base de datos
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      error: 'Entrada duplicada',
      Mensaje: 'Ya existe un registro con esa información'
    });
  }

  // Manejar errores de validación
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      error: 'Error de validación',
      Mensaje: err.message,
      detalles: err.errors
    });
  }

  // Manejar errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Error de autenticación',
      Mensaje: 'Token inválido o mal formado'
    });
  }

  // Manejar errores de permisos
  if (err.name === 'NotAuthorizedError') {
    return res.status(403).json({
      error: 'Acceso prohibido',
      Mensaje: 'No tiene permisos para realizar esta acción'
    });
  }

  // Log del error en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Respuesta de error genérica
  res.status(statusCode).json({
    Error: err.name || 'Error interno',
    Mensaje: err.message || 'Ha ocurrido un error inesperado',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};