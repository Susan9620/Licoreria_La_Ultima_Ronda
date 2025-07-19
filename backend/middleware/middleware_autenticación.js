const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Verifica si el token JWT es válido
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const verificarToken = (req, res, next) => {
  console.log('🔍 [verificarToken] Authorization header:', req.headers.authorization);
  try {
    // Obtener el token del encabezado
    const tokenHeader = req.headers.authorization;
    
    if (!tokenHeader) {
      return res.status(401).json({ 
        error: 'Acceso denegado',
        Mensaje: 'No se proporcionó token de autenticación' 
      });
    }

    // Verificar formato del token (Bearer token)
    const token = tokenHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        error: 'Acceso denegado',
        Mensaje: 'Formato de token inválido'
      });
    }

    // Verificar que el token sea válido
    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = verificado;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Sesión expirada',
        Mensaje: 'Su sesión ha expirado, inicie sesión nuevamente' 
      });
    }
    return res.status(401).json({ 
      error: 'Token inválido',
      Mensaje: 'Token de autenticación inválido'
    });
  }
};

/**
 * Verifica si el usuario tiene rol de administrador
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const esAdministrador = (req, res, next) => {
  console.log('🔒 esAdministrador — payload de token:', req.usuario);
  if (req.usuario && req.usuario.rol === 'Administrador') {
    return next();
  }
  return res.status(403).json({ 
    error: 'Acceso prohibido',
    Mensaje: 'No tiene permisos suficientes para esta acción'
  });
};

/**
 * Verifica si el usuario es propietario del recurso o administrador
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const esPropietarioOAdmin = (req, res, next) => {
  const usuarioId = parseInt(req.params.id) || parseInt(req.body.id_usuario);
  
  if (req.usuario && (req.usuario.id === usuarioId || req.usuario.rol === 'Administrador')) {
    next();
  } else {
    return res.status(403).json({ 
      error: 'Acceso prohibido',
      Mensaje: 'No tiene permisos para acceder a este recurso'
    });
  }
};

/**
 * Genera un token JWT para el usuario autenticado
 * @param {Object} usuario - Datos del usuario a incluir en el token
 * @returns {String} - Token JWT
 */
const generarToken = (usuario) => {
  // Crear el payload con los datos mínimos necesarios
  const payload = {
    ID: usuario.ID_Usuario,
    nombre: usuario.Nombre_Completo,
    correo: usuario.Correo_Electrónico,
    rol: usuario.Rol
  };

  // Generar y retornar el token
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

module.exports = {
  verificarToken,
  esAdministrador,
  esPropietarioOAdmin,
  generarToken
};