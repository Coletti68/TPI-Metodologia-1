const { getPool } = require('../database/db');

// Obtener todos los turnos
async function obtenerTurnos() {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT t.id_turno, t.FechaTurno AS fecha, t.HoraTurno AS hora, t.estado, 
           p.nombre_completo AS paciente, 
           prof.nombre_completo AS profesional 
    FROM Turno t
    JOIN Paciente p ON t.paciente_id = p.id_paciente
    JOIN Profesional prof ON t.profesional_id = prof.id_profesional
  `);
  return rows;
}

// Cambiar estado de turno
async function actualizarEstadoTurno(idTurno, nuevoEstado) {
  const pool = getPool();
  await pool.execute('UPDATE Turno SET estado = ? WHERE id_turno = ?', [nuevoEstado, idTurno]);
  return { success: true };
}

// Reprogramar turno
async function reprogramarTurno(idTurno, nuevaFecha, nuevaHora) {
  const pool = getPool();
  await pool.execute('UPDATE Turno SET FechaTurno = ?, HoraTurno = ? WHERE id_turno = ?', [nuevaFecha, nuevaHora, idTurno]);
  return { success: true };
}

module.exports = {
  obtenerTurnos,
  actualizarEstadoTurno,
  reprogramarTurno
};

