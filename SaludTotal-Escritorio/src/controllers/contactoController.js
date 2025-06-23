const { getPool } = require('../database/db');

async function obtenerTodos() {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM Contacto ORDER BY fecha DESC');
  return rows;
}

async function responder(id_contacto) {
  const pool = await getPool();

  // Verificamos que el contacto exista (opcional pero recomendable)
  const [rows] = await pool.query('SELECT id_contacto FROM Contacto WHERE id_contacto = ?', [id_contacto]);
  if (rows.length === 0) throw new Error("Contacto no encontrado");

  // Actualizamos el estado a respondido = 1
  await pool.query('UPDATE Contacto SET respondido = 1 WHERE id_contacto = ?', [id_contacto]);
  return true;
}

module.exports = {
  obtenerTodos,
  responder
};
