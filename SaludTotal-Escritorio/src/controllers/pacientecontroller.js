const { getConnection } = require('../database/db');

async function obtenerPacientes() {
  try {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM Paciente ORDER BY nombre_completo ASC');
    return rows;
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    throw error;
  }
}

async function editarPaciente(id, datosActualizados) {
  try {
    const db = getConnection();
    const { nombre_completo, dni, sexo, email } = datosActualizados;
    const query = `
      UPDATE Paciente
      SET nombre_completo = ?, dni = ?, sexo = ?, email = ?
      WHERE id_paciente = ?
    `;
    await db.query(query, [nombre_completo, dni, sexo, email, id]);
    return { mensaje: 'Paciente actualizado correctamente' };
  } catch (error) {
    console.error('Error al editar paciente:', error);
    throw error;
  }
}

async function inactivarPaciente(id) {
  try {
    const db = getConnection();
    const query = `UPDATE Paciente SET estado = 'inactivo' WHERE id_paciente = ?`;
    await db.query(query, [id]);
    return { mensaje: 'Paciente inactivado correctamente' };
  } catch (error) {
    console.error('Error al inactivar paciente:', error);
    throw error;
  }
}

async function obtenerHistorialTurnos(pacienteId) {
  try {
    const db = getConnection();
    const query = `
      SELECT ht.*, t.fecha_turno
      FROM HistorialTurno ht
      JOIN Turno t ON ht.turno_id = t.id_turno
      WHERE ht.paciente_id = ?
      ORDER BY ht.fecha DESC
    `;
    const [rows] = await db.query(query, [pacienteId]);
    return rows;
  } catch (error) {
    console.error('Error al obtener historial de turnos:', error);
    throw error;
  }
}

module.exports = {
  obtenerPacientes,
  editarPaciente,
  inactivarPaciente,
  obtenerHistorialTurnos
};


