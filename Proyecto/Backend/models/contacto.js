const db = require('../db');

const Contacto = {
  crear: async (paciente_id, email, motivo, mensaje) => {
    const conn = db.getConnection(); // ✅ obtenemos el pool
    const query = `
      INSERT INTO Contacto (paciente_id, email, motivo, mensaje)
      VALUES (?, ?, ?, ?)
    `;
    await conn.execute(query, [paciente_id, email, motivo, mensaje]);
    return { message: '✅ Mensaje enviado correctamente' };
  },
};

module.exports = Contacto;