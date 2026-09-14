const express = require('express');
const ctrl = require('../controladores/controlador_usuarios');
const { Verificar_Token } = require('../middleware/middleware_autenticación');
const Ruta = express.Router();

Ruta.post('/Registro', ctrl.Registro);
Ruta.post('/Login',    ctrl.Login);

// Listar todos los usuarios
Ruta.get('/',           ctrl.Listar);

// PERFIL del usuario logueado
Ruta.get(
  '/me',
  Verificar_Token,  // valida JWT y pone req.usuario.id
  ctrl.Perfil     // aquí usamos directamente tu método perfil
);

module.exports = Ruta;