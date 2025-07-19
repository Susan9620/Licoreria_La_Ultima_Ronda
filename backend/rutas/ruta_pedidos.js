const express = require('express');
const { verificarToken } = require('../middleware/middleware_autenticación');
const ctrl = require('../controladores/controlador_pedidos');

const router = express.Router();

/**
 * @route   POST /api/pedidos
 * @desc    Crear pedido
 */
router.post('/', verificarToken, ctrl.crearPedido);

/**
 * @route   GET /api/pedidos/usuario
 * @desc    Historial de pedidos del usuario autenticado
 */
router.get(
    '/usuario',
    verificarToken,
    (req, res, next) => {
        console.log(`→ [Pedidos] Llega GET /api/pedidos/usuario (usuario ${req.usuario.id})`);
        next();
    },
    ctrl.obtenerPedidosPorUsuario
);

/**
 * @route   GET /api/pedidos/:id
 * @desc    Obtener pedido con detalle
 */
router.get(
    '/:id',
    verificarToken,
    (req, res, next) => {
        console.log(`→ [Pedidos] Llega GET /api/pedidos/${req.params.id}`);
        next();
    },
    ctrl.obtenerPedido
);

module.exports = router;