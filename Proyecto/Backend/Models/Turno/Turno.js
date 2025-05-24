const db = require('../../db');

const Turno = {
    // 👉 Solicitar un nuevo turno (creación)
    crear: async (paciente_id, profesional_id, especialidad_id, fechaTurno, horaTurno, motivo) => {
        try {
            if (!paciente_id || !profesional_id || !especialidad_id || !fechaTurno || !horaTurno || !motivo) {
                throw new Error('Todos los campos son obligatorios para solicitar un turno');
            }

            await db.execute(`
                INSERT INTO Turno (paciente_id, profesional_id, especialidad_id, FechaTurno, HoraTurno, motivo)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [paciente_id, profesional_id, especialidad_id, fechaTurno, horaTurno, motivo]);

            return { message: '✅ Turno solicitado correctamente' };
        } catch (error) {
            console.error('❌ Error al solicitar turno:', error.message);
            throw error;
        }
    },

    // 👉 Obtener historial de turnos de un paciente
    obtenerPorPaciente: async (paciente_id) => {
        try {
            const [turnos] = await db.execute(`
                SELECT T.id_turno, T.FechaTurno, T.HoraTurno, T.estado, T.motivo,
                       E.nombreEspecialidad, P.nombre_completo AS nombreProfesional
                FROM Turno T
                JOIN Especialidad E ON T.especialidad_id = E.id_especialidad
                JOIN Profesional P ON T.profesional_id = P.id_profesional
                WHERE T.paciente_id = ? AND T.estado IN ('En espera', 'Confirmado', 'Atendido')
                ORDER BY T.FechaTurno DESC, T.HoraTurno DESC
            `, [paciente_id]);

            return turnos;
        } catch (error) {
            console.error('❌ Error al obtener historial de turnos:', error.message);
            throw error;
        }
    },

    // 👉 Verificar si un turno específico está disponible
    estaDisponible: async (profesional_id, especialidad_id, fechaTurno, horaTurno) => {
        try {
            const [rows] = await db.execute(`
                SELECT * FROM Turno
                WHERE profesional_id = ? AND especialidad_id = ? AND DATE(FechaTurno) = ? AND HoraTurno = ?
                AND estado IN ('Confirmado', 'En espera', 'Atendido')
            `, [profesional_id, especialidad_id, fechaTurno, horaTurno]);

            return rows.length === 0;
        } catch (error) {
            console.error('❌ Error al verificar disponibilidad del turno:', error.message);
            throw error;
        }
    },

    // ✅ 👉 Obtener todos los horarios asignados al profesional para un día de la semana
    obtenerHorariosDisponibles: async (profesional_id, especialidad_id, diaSemana) => {
        try {
            const [horarios] = await db.execute(`
                SELECT HoraInicio, HoraFin 
                FROM HorariosDisponibles
                WHERE profesional_id = ? AND especialidad_id = ? AND DiaSemana = ?
            `, [profesional_id, especialidad_id, diaSemana]);

            return horarios;
        } catch (error) {
            console.error('❌ Error al obtener horarios del profesional:', error.message);
            throw error;
        }
    },

    // ✅ 👉 Obtener solo las horas ocupadas (por ejemplo: ['10:00:00', '10:30:00'])
    obtenerTurnosOcupados: async (profesional_id, especialidad_id, fechaTurno) => {
        try {
            const [ocupados] = await db.execute(`
                SELECT HoraTurno 
                FROM Turno 
                WHERE profesional_id = ? AND especialidad_id = ? AND DATE(FechaTurno) = ?
                AND estado IN ('Confirmado', 'En espera', 'Atendido')
            `, [profesional_id, especialidad_id, fechaTurno]);

            return ocupados.map(t => t.HoraTurno);
        } catch (error) {
            console.error('❌ Error al obtener turnos ocupados:', error.message);
            throw error;
        }
    }
}

module.exports = Turno;