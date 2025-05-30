const express = require('express');
const router = express.Router();
const contactoController = require('../Controllers/contactoController');

// Ruta para enviar mensaje
router.post('/enviar', contactoController.enviarMensaje);

module.exports = router;