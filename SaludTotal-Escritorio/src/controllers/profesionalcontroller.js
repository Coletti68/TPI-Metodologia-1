const { getConnection, getPool } = require('../database/db');
const bcrypt = require('bcrypt');

// Obtener todos los profesionales
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
  const db = getConnection();
  const [rows] = await db.query('SELECT id_especialidad, nombreEspecialidad FROM Especialidad');
  return rows;
}

async function obtenerRoles() {
  const db = getConnection();
  const [rows] = await db.query('SELECT id_rol, nombreRol FROM Rol');
  return rows;
}


// Crear profesional
async function crearProfesional(profesionalData) {
  const {
    nombre_completo,
    dni,
    sexo,
    email,
    password,
    especialidades = [], // array de especialidades
    rol_id = 2,
    horarios = [] // array de horarios opcional
  } = profesionalData;

  const db = getConnection();
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Validar duplicados
    const [dniCheck] = await conn.query('SELECT id_profesional FROM Profesional WHERE dni = ?', [dni]);
    if (dniCheck.length > 0) throw new Error('El DNI ya está registrado.');

    const [emailCheck] = await conn.query('SELECT id_profesional FROM Profesional WHERE email = ?', [email]);
    if (emailCheck.length > 0) throw new Error('El email ya está registrado.');

    // Validar especialidades
    for (const espId of especialidades) {
      const [espCheck] = await conn.query('SELECT id_especialidad FROM Especialidad WHERE id_especialidad = ?', [espId]);
      if (espCheck.length === 0) throw new Error(`Especialidad con ID ${espId} no existe.`);
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar en Profesional (usamos la primera especialidad como principal)
    const [result] = await conn.query(
      `INSERT INTO Profesional (nombre_completo, dni, sexo, email, password, especialidad_id, rol_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre_completo, dni, sexo, email, hashedPassword, especialidades[0], rol_id]
    );

    const profesional_id = result.insertId;

    // Insertar en ProfesionalEspecialidad
    for (const espId of especialidades) {
      await conn.query(
        `INSERT INTO ProfesionalEspecialidad (profesional_id, especialidad_id)
         VALUES (?, ?)`,
        [profesional_id, espId]
      );
    }

    // Insertar horarios disponibles (si se proporcionan)
    for (const horario of horarios) {
      const { especialidad_id, DiaSemana, HoraInicio, HoraFin } = horario;
      await conn.query(
        `INSERT INTO HorarioDisponible (profesional_id, especialidad_id, DiaSemana, HoraInicio, HoraFin)
         VALUES (?, ?, ?, ?, ?)`,
        [profesional_id, especialidad_id, DiaSemana, HoraInicio, HoraFin]
      );
    }

    await conn.commit();
    return { success: true, profesional_id };
  } catch (error) {
    await conn.rollback();
    console.error('Error al crear profesional:', error.message);
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = {
  obtenerProfesionales,
  crearProfesional,
  obtenerEspecialidades,
  obtenerRoles
};
