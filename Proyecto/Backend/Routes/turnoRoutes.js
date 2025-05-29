//turnoRoutes.js:
const express = require('express');
const router = express.Router();
const turnoController = require('../Controllers/turnoController');

// Endpoints
router.get('/especialidades', turnoController.obtenerEspecialidades);
router.get('/profesionales', turnoController.obtenerProfesionalesPorEspecialidad);
router.get('/historial/:paciente_id', turnoController.obtenerHistorialTurnos);
router.get('/horarios-disponibles', turnoController.horariosDisponibles);
router.post('/crear', turnoController.crearTurno);
router.put('/cancelar/:id_turno', turnoController.cancelarTurno);



module.exports = router;
