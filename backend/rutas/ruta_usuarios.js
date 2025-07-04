const express = require('express');
const ctrl = require('../controladores/controlador_usuarios');
const { verificarToken } = require('../middleware/middleware_autenticación');
const router = express.Router();

router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);

// Listar todos los usuarios
router.get('/',           ctrl.listar);

// PERFIL del usuario logueado
router.get(
  '/me',
  verificarToken,  // valida JWT y pone req.usuario.id
  ctrl.perfil     // aquí usamos directamente tu método perfil
);

module.exports = router;