const { getConnection } = require('../database/db');

async function login(email, password) {
  try {
    const db = getConnection();
    const [rows] = await db.query(`
      SELECT p.id_profesional AS id, p.nombre_completo, p.email, r.nombreRol, r.id_rol
      FROM Profesional p
      JOIN Rol r ON p.rol_id = r.id_rol
      WHERE p.email = ? AND p.password = ? AND (r.id_rol = 1 OR r.id_rol = 4)
    `, [email, password]);

    if (rows.length === 0) {
      return null; // No coincide o no tiene rol autorizado
    }

    return rows[0]; // Usuario válido
  } catch (err) {
    console.error('Error en login:', err.message);
    throw err;
  }
}

module.exports = { login };

