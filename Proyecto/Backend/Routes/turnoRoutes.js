const express = require('express');
const router = express.Router();
const turnoController = require('../Controllers/turnoController');

//Creacion de turno
router.post('/crear', turnoController.crearTurno);

//obtener historial de turnos por paciente
router.get('/historial/:paciente_id',turnoController.historialTurnos);

//obtener horarios disponibles de profesional
router.get('/disponibles', turnoController.horariosDisponibles);

//Cancelar turno
router.put('/cancelar', turnoController.cancelarTurno);

//Obtener proximo turno del paciente
router.get('/proximo/:paciente_id', turnoController.proximoTurno);

module.exports = router;