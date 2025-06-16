// Routes/historialRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET historial de turnos por paciente
router.get('/:paciente_id', async (req, res) => {
  const { paciente_id } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT 
        h.id_historial,
        h.fecha,
        h.estado_nuevo,
        t.FechaTurno,
        t.HoraTurno,
        e.nombreEspecialidad,
        p.nombre_completo AS profesional
      FROM HistorialTurno h
      JOIN Turno t ON h.turno_id = t.id_turno
      JOIN Profesionales p ON t.profesional_id = p.id_profesional
      JOIN Especialidades e ON t.especialidad_id = e.id_especialidad
      WHERE h.paciente_id = ?
      ORDER BY h.fecha DESC
    `, [paciente_id]);

    res.json(rows);
  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);
    res.status(500).json({ mensaje: 'Error interno al obtener historial' });
  }
});

module.exports = router;