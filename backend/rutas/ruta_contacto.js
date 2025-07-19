const express = require('express');
const router = express.Router();
const Controlador_Contacto = require('../controladores/controlador_contacto');
const { verificarToken } = require('../middleware/middleware_autenticación');

// Si quieres permitir envíos anónimos, comenta la línea de verificarToken
router.post('/', verificarToken, Controlador_Contacto.Crear);
// Opcional: sólo para admins o ver los mensajes
router.get('/', verificarToken, Controlador_Contacto.Listar);

module.exports = router;