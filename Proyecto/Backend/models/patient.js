const db = require('../db'); // Importa el pool de conexiones
const bcrypt = require('bcryptjs');

const Patient = {
  create: async (nombre_completo, dni, sexo, email, password) => {
    try {
      if (!nombre_completo || !dni || !sexo || !email || !password) {
        throw new Error('Todos los campos son obligatorios');
      }

      if (!/^\d{8}$/.test(dni)) {
        throw new Error('El DNI debe tener exactamente 8 números');
      }

      if (!['M', 'F'].includes(sexo)) {
        throw new Error('El sexo debe ser "M" o "F"');
      }

      if (!/^[a-zA-ZáéíóúñÑ\s]+$/.test(nombre_completo)) {
        throw new Error('El nombre solo puede contener letras y espacios');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Formato de email inválido');
      }

      const pool = db.getPool(); // ✅ Importante

      const [existingPatients] = await pool.execute(
        `SELECT * FROM Paciente WHERE dni = ? OR email = ?`,
        [dni, email]
      );

      if (existingPatients.length > 0) {
        throw new Error('El DNI o el email ya están registrados');
      }

      const passwordHash = await bcrypt.hash(password, 10);

      await pool.execute( // ✅ corregido
        `INSERT INTO Paciente (nombre_completo, dni, sexo, email, password) VALUES (?, ?, ?, ?, ?)`,
        [nombre_completo, dni, sexo, email, passwordHash]
      );

      return { message: '✅ Paciente registrado correctamente' };
    } catch (error) {
      console.error('❌ Error al registrar paciente:', error.message);
      throw error;
    }
  },

  login: async (dni, password) => {
    try {
      if (!/^\d{8}$/.test(dni)) {
        throw new Error('El DNI debe tener exactamente 8 números');
      }

      const pool = db.getPool(); // ✅ agregado aquí también

      const [rows] = await pool.execute( // ✅ corregido
        `SELECT id_paciente, nombre_completo, dni, password FROM Paciente WHERE dni = ?`,
        [dni]
      );

      if (rows.length === 0) {
        throw new Error('El paciente no está registrado');
      }

      const patient = rows[0];

      const isMatch = await bcrypt.compare(password, patient.password);
      if (!isMatch) {
        throw new Error('Contraseña incorrecta');
      }

      return {
        message: '✅ Login exitoso',
        id_paciente: patient.id_paciente,
        nombre_completo: patient.nombre_completo
      };
    } catch (error) {
      console.error('❌ Error en el login:', error.message);
      throw error;
    }
  }
};

module.exports = Patient;
