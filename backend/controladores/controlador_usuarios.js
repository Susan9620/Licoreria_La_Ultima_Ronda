const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const modeloUsuarios = require('../modelos/modelo_usuarios');

class ControladorUsuarios {
  /**
   * POST /api/usuarios/register
   * Crear un nuevo usuario con contraseña hasheada
   */
  async register(req, res) {
    try {
      const { Nombre_Completo, Correo_Electrónico, Contraseña } = req.body;
      // Validar campos
      if (!Nombre_Completo || !Correo_Electrónico || !Contraseña) {
        return res.status(400).json({ Éxito: false, Mensaje: 'Faltan Datos' });
      }
      // Hashear contraseña
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(Contraseña, salt);
      // Crear usuario
      const nuevo = await modeloUsuarios.crear({
        Nombre_Completo,
        Correo_Electrónico,
        Contraseña: hash
      });
      return res.status(201).json({ Éxito: true, Datos: { id: nuevo.insertId, Correo_Electrónico } });
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      // Duplicado de correo
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ Éxito: false, Mensaje: 'Ese correo ya está registrado' });
      }
      return res.status(500).json({ Éxito: false, Mensaje: 'Error al registrar usuario' });
    }
  }

  /**
   * POST /api/usuarios/login
   * Autentica usuario y devuelve JWT
   */
  async login(req, res) {
    try {
      // Aceptar ambas variantes de nombre de campo
      const correo = req.body.Correo_Electrónico || req.body.correo;
      const contraseña = req.body.Contraseña || req.body.contraseña;
      if (!correo || !contraseña) {
        return res.status(400).json({ Éxito: false, Mensaje: 'Faltan credenciales' });
      }
      // Buscar usuario activo
      const usuario = await modeloUsuarios.obtenerPorCorreo(correo);
      if (!usuario) {
        return res.status(401).json({ Éxito: false, Mensaje: 'Credenciales inválidas' });
      }
      // Verificar contraseña
      const match = await bcrypt.compare(contraseña, usuario.Contraseña);
      if (!match) {
        return res.status(401).json({ Éxito: false, Mensaje: 'Credenciales inválidas' });
      }
      // Generar token
      const payload = { id: usuario.ID_Usuario, email: usuario.Correo_Electrónico, rol: usuario.Rol };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
      return res.json({ Éxito: true, token });
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      return res.status(500).json({ Éxito: false, Mensaje: 'Error al iniciar sesión' });
    }
  }

  // GET /api/usuarios
  async listar(req, res) {
    try {
      const usuarios = await modeloUsuarios.listarTodos();
      res.json({ Éxito: true, Datos: usuarios });
    } catch (err) {
      console.error(err);
      res.status(500).json({ Éxito: false, Mensaje: 'Error al obtener usuarios' });
    }
  }

  /**
   * GET /api/usuarios/me 
   * Devuelve los datos básicos del usuario logueado 
   */
  async perfil(req, res) {
    try {
      // req.usuario.id lo pone tu middleware verificarToken 
      const usuario = await modeloUsuarios.obtenerPorId(req.usuario.id);
      if (!usuario) {
        return res
          .status(404)
          .json({ Éxito: false, Mensaje: 'Usuario no encontrado' });
      }
      // Extraemos solo los campos públicos 
      const { Nombre_Completo, Correo_Electrónico, Teléfono } = usuario;
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
   * POST /api/admin/usuarios
   * Crea un nuevo usuario (solo Admin)
   */
  async crearUsuario(req, res) {
    try {
      // Desestructura todos los campos
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
      const hash = await bcrypt.hash(Contraseña, 10);

      // Pasa un objeto con todas las claves a tu modelo
      const id = await modeloUsuarios.crear({
        Nombre_Completo,
        Correo_Electrónico,
        Contraseña: hash,
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
        Datos: { idUsuario: id }
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      return res.status(500).json({ Éxito: false, Mensaje: error.message });
    }
  }

  /**
   * PUT /api/admin/usuarios/:id
   * Actualiza un usuario existente (solo Admin)
   */
  async actualizarUsuario(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ Éxito: false, Mensaje: 'ID inválido.' });
      }
      const cambios = { ...req.body };
      // Si vienen contraseña, la hasheamos
      if (cambios.Contraseña) {
        cambios.Contraseña = await bcrypt.hash(cambios.Contraseña, 10);
      }
      const filas = await modeloUsuarios.actualizar(id, cambios);
      if (filas === 0) {
        return res.status(404).json({ Éxito: false, Mensaje: 'Usuario no encontrado.' });
      }
      return res.json({ Éxito: true, Mensaje: 'Usuario actualizado correctamente.' });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return res.status(500).json({ Éxito: false, Mensaje: error.message });
    }
  }

  /**
   * DELETE /api/admin/usuarios/:id
   * Elimina un usuario (solo Admin)
   */
  async eliminarUsuario(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ Éxito: false, Mensaje: 'ID inválido.' });
      }
      const filas = await modeloUsuarios.eliminar(id);
      if (filas === 0) {
        return res.status(404).json({ Éxito: false, Mensaje: 'Usuario no encontrado.' });
      }
      return res.json({ Éxito: true, Mensaje: 'Usuario eliminado correctamente.' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      return res.status(500).json({ Éxito: false, Mensaje: error.message });
    }
  }
}

module.exports = new ControladorUsuarios();