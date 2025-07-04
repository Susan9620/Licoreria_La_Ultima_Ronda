const express = require('express');
const router = express.Router();
const ControladorContacto = require('../controladores/controlador_contacto');
const { verificarToken } = require('../middleware/middleware_autenticación');

// Si quieres permitir envíos anónimos, comenta la línea de verificarToken
router.post('/', verificarToken, ControladorContacto.crear);
// Opcional: sólo para admins o ver los mensajes
router.get('/', verificarToken, ControladorContacto.listar);

module.exports = router;