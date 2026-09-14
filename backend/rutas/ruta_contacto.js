const express = require('express');
const Ruta = express.Router();
const Controlador_Contacto = require('../controladores/controlador_contacto');
const { Verificar_Token } = require('../middleware/middleware_autenticación');

/**
 * @route   POST /api/Contacto
 * @desc    Crear y guardar un mensaje
 */
Ruta.post('/', Verificar_Token, Controlador_Contacto.Crear);

/**
 * @route   GET /api/Contacto
 * @desc    Obtener todos los mensajes
 */
Ruta.get('/', Verificar_Token, Controlador_Contacto.Listar);

module.exports = Ruta;