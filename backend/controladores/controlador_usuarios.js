const Bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const Modelo_Usuarios = require('../modelos/modelo_usuarios');

class Controlador_Usuarios {
  /**
   * POST /api/Usuarios/Registro
   * Crear nuevo usuario con contraseña hasheada
   */
  async Registro(req, res) {
    try {
      const { Nombre_Completo, Correo_Electrónico, Contraseña } = req.body;
      // Validar campos
      if (!Nombre_Completo || !Correo_Electrónico || !Contraseña) {
        return res.status(400).json({ Éxito: false, Mensaje: 'Faltan Datos' });
      }
      // Hashear contraseña
      const Salt = await Bcrypt.genSalt(10);
      const Hash = await Bcrypt.hash(Contraseña, Salt);
      // Crear usuario
      const Nuevo = await Modelo_Usuarios.Crear({
        Nombre_Completo,
        Correo_Electrónico,
        Contraseña: Hash
      });
      return res.status(201).json({ Éxito: true, Datos: { id: Nuevo.Insertar_ID, Correo_Electrónico } });
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      // Duplicado de correo
      if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
        return res.status(409).json({ Éxito: false, Mensaje: 'Ese correo ya está registrado' });
      }
      return res.status(500).json({ Éxito: false, Mensaje: 'Error al registrar usuario' });
    }
  }

  /**
   * POST /api/Usuarios/Login
   * Autenticar usuario y obtener JWT
   */
  async Login(req, res) {
    try {
      // Aceptar ambas variantes de nombre de campo
      const Correo = req.body.Correo_Electrónico || req.body.Correo;
      const Contraseña = req.body.Contraseña || req.body.Contraseña;
      if (!Correo || !Contraseña) {
        return res.status(400).json({ Éxito: false, Mensaje: 'Faltan credenciales' });
      }
      // Buscar usuario activo
      const Usuario = await Modelo_Usuarios.Obtener_Por_Correo(Correo);
      if (!Usuario) {
        return res.status(401).json({ Éxito: false, Mensaje: 'Credenciales inválidas' });
      }
      // Verificar contraseña
      const Match = await Bcrypt.compare(Contraseña, Usuario.Contraseña);
      if (!Match) {
        return res.status(401).json({ Éxito: false, Mensaje: 'Credenciales inválidas' });
      }
      // Generar token
      const Carga_Datos = { id: Usuario.ID_Usuario, Email: Usuario.Correo_Electrónico, Rol: Usuario.Rol };
      const secret = process.env.JWT_SECRET || 'licoreria_secret_key_muy_segura_2025';
      const Token = JWT.sign(Carga_Datos, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
      return res.json({ Éxito: true, Token: Token });
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error al iniciar sesión' });
    }
  }

  /**
   * GET /api/Usuarios
   * Obtener usuarios registrados
   */
  async Listar(req, res) {
    try {
      const Usuarios = await Modelo_Usuarios.Listar_Todos();
      res.json({ Éxito: true, Datos: Usuarios });
    } catch (err) {
      console.error(err);
      res.status(500).json({ Éxito: false, Mensaje: 'Error al obtener usuarios' });
    }
  }

  /**
   * GET /api/Usuarios/me 
   * Obtener datos básicos del usuario logueado 
   */
  async Perfil(req, res) {
    try {
      const Usuario = await Modelo_Usuarios.Obtener_Por_ID(req.Usuario.id);
      if (!Usuario) {
        return res
          .status(404)
          .json({ Éxito: false, Mensaje: 'Usuario no encontrado' });
      }
      // Extraer solo los campos públicos 
      const { Nombre_Completo, Correo_Electrónico, Teléfono } = Usuario;
      res.json({
        Éxito: true,
        Datos: { Nombre_Completo, Correo_Electrónico, Teléfono }
      });
    } catch (err) {
      console.error('Error al obtener perfil:', err);
      res
        .status(500)
        .json({ Éxito: false, Mensaje: 'Error al obtener perfil' });
    }
  }

  /**
   * POST /api/Administrador/Usuarios
   * Crear usuario (solo Administrador)
   */
  async Crear_Usuario(req, res) {
    try {
      const {
        Nombre_Completo,
        Correo_Electrónico,
        Contraseña,
        Fecha_Nacimiento,
        Teléfono,
        Dirección,
        'Código Postal': Codigo_Postal,
        Rol = 'Cliente',
        Activo = 1
      } = req.body;

      if (!Nombre_Completo || !Correo_Electrónico || !Contraseña) {
        return res.status(400).json({ Éxito: false, Mensaje: 'Faltan campos obligatorios.' });
      }

      // Hash de la contraseña
      const Hash = await Bcrypt.Hash(Contraseña, 10);

      // Pasar un objeto con todas las claves al modelo
      const id = await Modelo_Usuarios.Crear({
        Nombre_Completo,
        Correo_Electrónico,
        Contraseña: Hash,
        Fecha_Nacimiento,
        Teléfono,
        Dirección,
        'Código Postal': Codigo_Postal,
        Rol,
        Activo
      });

      return res.status(201).json({
        Éxito: true,
        Mensaje: 'Usuario creado correctamente',
        Datos: { ID_Usuario: id }
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      return res.status(500).json({ Éxito: false, Mensaje: error.message });
    }
  }

  /**
   * PUT /api/Administrador/Usuarios/:id
   * Actualizar usuario existente (solo Administrador)
   */
  async Actualizar_Usuario(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ Éxito: false, Mensaje: 'ID inválido.' });
      }
      const Cambios = { ...req.body };
      if (Cambios.Contraseña) {
        Cambios.Contraseña = await Bcrypt.Hash(Cambios.Contraseña, 10);
      }
      const Filas = await Modelo_Usuarios.Actualizar(id, Cambios);
      if (Filas === 0) {
        return res.status(404).json({ Éxito: false, Mensaje: 'Usuario no encontrado.' });
      }
      return res.json({ Éxito: true, Mensaje: 'Usuario actualizado correctamente.' });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return res.status(500).json({ Éxito: false, Mensaje: error.message });
    }
  }

  /**
   * DELETE /api/Administrador/Usuarios/:id
   * Eliminar usuario (solo Administrador)
   */
  async Eliminar_Usuario(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ Éxito: false, Mensaje: 'ID inválido.' });
      }
      const Filas = await Modelo_Usuarios.Eliminar(id);
      if (Filas === 0) {
        return res.status(404).json({ Éxito: false, Mensaje: 'Usuario no encontrado.' });
      }
      return res.json({ Éxito: true, Mensaje: 'Usuario eliminado correctamente.' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      return res.status(500).json({ Éxito: false, Mensaje: error.message });
    }
  }
}

module.exports = new Controlador_Usuarios();