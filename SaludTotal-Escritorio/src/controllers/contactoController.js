const { getPool } = require('../database/db');

// Obtener todos los mensajes con datos del paciente (si existe)
async function obtenerMensajesContacto() {
  const pool = await getPool();

  const [rows] = await pool.query(`
    SELECT 
      c.id_contacto,
      c.email,
      c.motivo,
      c.mensaje,
      c.fecha,
      c.respondido
    FROM Contacto c
    ORDER BY c.fecha DESC
  `);

  return rows;
}

// Marcar como respondido un mensaje
async function marcarMensajeRespondido(id_contacto) {
  const pool = await getPool();

  const [resultado] = await pool.query(`
    UPDATE Contacto 
    SET respondido = TRUE 
    WHERE id_contacto = ?;
  `, [id_contacto]);

  return resultado;
}

module.exports = {
  obtenerMensajesContacto,
  marcarMensajeRespondido
};
