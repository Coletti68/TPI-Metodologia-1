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

module.exports = { obtenerPacientes };

