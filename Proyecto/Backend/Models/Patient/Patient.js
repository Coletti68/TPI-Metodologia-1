const db = require('../../db'); // Conexión a la base de datos
const bcrypt = require('bcryptjs');

const Patient = {
    // 👉 Registrar un nuevo paciente con validaciones mejoradas
    create: async (nombre_completo, dni, sexo, email, password) => {
        try {
            // Validación de campos obligatorios
            if (!nombre_completo || !dni || !sexo || !email || !password) {
                throw new Error('Todos los campos son obligatorios');
            }

            // Validación de formato de DNI (8 dígitos numéricos)
            if (!/^\d{8}$/.test(dni)) {
                throw new Error('El DNI debe tener exactamente 8 números');
            }

            // Validación del sexo (solo 'M' o 'F')
            if (!['M', 'F'].includes(sexo)) {
                throw new Error('El sexo debe ser "M" o "F"');
            }

            // Validación del nombre (evita caracteres inválidos)
            if (!/^[a-zA-ZáéíóúñÑ\s]+$/.test(nombre_completo)) {
                throw new Error('El nombre solo puede contener letras y espacios');
            }

            // Validación de formato de email
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                throw new Error('Formato de email inválido');
            }

            // Verificar si el paciente ya existe
            const [existingPatient] = await db.execute(
                `SELECT * FROM Paciente WHERE dni = ? OR email = ?`,
                [dni, email]
            );

            if (existingPatient.length > 0) {
                throw new Error('El DNI o el email ya están registrados');
            }

            // Encriptar contraseña
            const passwordHash = await bcrypt.hash(password, 10);

            await db.execute(
                `INSERT INTO Paciente (nombre_completo, dni, sexo, email, password) VALUES (?, ?, ?, ?, ?)`,
                [nombre_completo, dni, sexo, email, passwordHash]
            );

            return { message: '✅ Paciente registrado correctamente' };
        } catch (error) {
            console.error('❌ Error al registrar paciente:', error.message);
            throw error;
        }
    },

    // 👉 Login de paciente con más detalles en la respuesta
    login: async (dni, password) => {
        try {
            // Validación de formato de DNI
            if (!/^\d{8}$/.test(dni)) {
                throw new Error('El DNI debe tener exactamente 8 números');
            }

            // Buscar paciente por DNI
            const [rows] = await db.execute(
                `SELECT id_paciente, nombre_completo, dni, password FROM Paciente WHERE dni = ?`,
                [dni]
            );

            if (rows.length === 0) {
                throw new Error('El paciente no está registrado');
            }

            const patient = rows[0];

            // Validar contraseña
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



