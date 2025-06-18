const { getPool } = require('../database/db');
const nodemailer = require('nodemailer');

// Configurar tu transportador (puede ser Gmail u otro SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tuemail@gmail.com',
    pass: 'tu_contraseña_o_app_password'
  }
});

async function obtenerTodos() {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM Contacto ORDER BY fecha DESC');
  return rows;
}

async function responder(id_contacto, mensajeRespuesta) {
  const pool = await getPool();

  const [rows] = await pool.query('SELECT email FROM Contacto WHERE id_contacto = ?', [id_contacto]);
  if (rows.length === 0) throw new Error("Contacto no encontrado");

  const emailDestino = rows[0].email;

  await transporter.sendMail({
    from: 'tuemail@gmail.com',
    to: emailDestino,
    subject: 'Respuesta a tu mensaje',
    text: mensajeRespuesta
  });

  await pool.query('UPDATE Contacto SET respondido = TRUE WHERE id_contacto = ?', [id_contacto]);
  return true;
}

module.exports = {
  obtenerTodos,
  responder
};
