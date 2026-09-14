const JWT = require('jsonwebtoken');
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
    const Token = tokenHeader.split(' ')[1];
    if (!Token) {
      return res.status(401).json({ 
        error: 'Acceso denegado',
        Mensaje: 'Formato de token inválido'
      });
    }

    // Verificar que el token sea válido
    const secret = process.env.JWT_SECRET || 'licoreria_secret_key_muy_segura_2025';
    const verificado = JWT.verify(Token, secret);
    req.Usuario = verificado;
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
  console.log('🔒 esAdministrador — Carga de Datos de token:', req.Usuario);
  if (req.Usuario && req.Usuario.Rol === 'Administrador') {
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
  const Usuario_ID = parseInt(req.params.id) || parseInt(req.body.id_usuario);
  
  if (req.Usuario && (req.Usuario.id === Usuario_ID || req.Usuario.Rol === 'Administrador')) {
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
 * @param {Object} Usuario - Datos del usuario a incluir en el token
 * @returns {String} - Token JWT
 */
const generarToken = (Usuario) => {
  // Crear la carga de datos con los datos mínimos necesarios
  const Carga_Datos = {
    id: Usuario.ID_Usuario,
    nombre: Usuario.Nombre_Completo,
    Correo: Usuario.Correo_Electrónico,
    Rol: Usuario.Rol
  };

  // Generar y retornar el token
  const secret = process.env.JWT_SECRET || 'licoreria_secret_key_muy_segura_2025';
  return JWT.sign(
    Carga_Datos,
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

module.exports = {
  verificarToken,
  Verificar_Token: verificarToken,
  esAdministrador,
  Es_Administrador: esAdministrador,
  esPropietarioOAdmin,
  Es_Propietario_O_Admin: esPropietarioOAdmin,
  generarToken,
  Generar_Token: generarToken
};