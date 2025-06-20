const { getConnection } = require('../database/db');

async function obtenerProfesionales() {
  try {
    const db = getConnection();
    const query = `
      SELECT 
        p.*,
        GROUP_CONCAT(e.nombreEspecialidad SEPARATOR ', ') AS especialidades,
        r.nombreRol AS rol
      FROM Profesional p
      LEFT JOIN ProfesionalEspecialidad pe ON p.id_profesional = pe.profesional_id
      LEFT JOIN Especialidad e ON pe.especialidad_id = e.id_especialidad
      LEFT JOIN Rol r ON p.rol_id = r.id_rol
      GROUP BY p.id_profesional
      ORDER BY p.nombre_completo ASC;
    `;
    const [rows] = await db.query(query);
    return rows;
  } catch (error) {
    console.error('Error al obtener profesionales:', error);
    throw error;
  }
}

async function obtenerEspecialidades() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT id_especialidad, nombreEspecialidad FROM Especialidad');
  return rows;
}

async function obtenerRoles() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT id_rol, nombreRol FROM Rol');
  return rows;
}

module.exports = {
  obtenerProfesionales,
  obtenerEspecialidades,
  obtenerRoles
};
