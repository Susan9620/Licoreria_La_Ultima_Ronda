const express = require('express');
const { Verificar_Token } = require('../middleware/middleware_autenticación');
const ctrl = require('../controladores/controlador_pedidos');

const Ruta = express.Router();

/**
 * @route   POST /api/Pedidos
 * @desc    Crear pedido
 */
Ruta.post('/', Verificar_Token, ctrl.Crear_Pedido);

/**
 * @route   GET /api/Pedidos/usuario
 * @desc    Historial de pedidos del usuario autenticado
 */
Ruta.get(
    '/usuario',
    Verificar_Token,
    (req, res, next) => {
        console.log(`→ [Pedidos] Llega GET /api/Pedidos/usuario (usuario ${req.usuario.id})`);
        next();
    },
    ctrl.Obtener_Pedidos_Por_Usuario
);

/**
 * @route   GET /api/Pedidos/:id
 * @desc    Obtener pedido con detalle
 */
Ruta.get(
    '/:id',
    Verificar_Token,
    (req, res, next) => {
        console.log(`→ [Pedidos] Llega GET /api/Pedidos/${req.params.id}`);
        next();
    },
    ctrl.Obtener_Pedido
);

module.exports = Ruta;