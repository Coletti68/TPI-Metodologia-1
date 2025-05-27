const db = require('../db');

const Turno = {
    // ✅ Verifica si un turno está disponible
    estaDisponible: async (profesional_id, especialidad_id, fecha, hora) => {
        try {
            const [result] = await db.execute(`
                SELECT COUNT(*) AS cantidad
                FROM Turno
                WHERE profesional_id = ? AND especialidad_id = ? AND FechaTurno = ? AND HoraTurno = ?
                AND estado IN ('Confirmado', 'En espera', 'Atendido')
            `, [profesional_id, especialidad_id, fecha, hora]);

            return result[0].cantidad === 0;
        } catch (error) {
            console.error("❌ Error al verificar disponibilidad:", error.message);
            throw error;
        }
    },

    // ✅ Crear un nuevo turno
    crear: async (paciente_id, profesional_id, especialidad_id, fecha, hora) => {
        try {
            const [resultado] = await db.execute(`
                INSERT INTO Turno (paciente_id, profesional_id, especialidad_id, FechaTurno, HoraTurno, estado)
                VALUES (?, ?, ?, ?, ?, 'En espera')
            `, [paciente_id, profesional_id, especialidad_id, fecha, hora]);

            return {
                id_turno: resultado.insertId,
                paciente_id,
                profesional_id,
                especialidad_id,
                FechaTurno: fecha,
                HoraTurno: hora,
                estado: 'En espera'
            };
        } catch (error) {
            console.error("❌ Error al crear turno:", error.message);
            throw error;
        }
    },

    // ✅ Obtener todos los turnos de un paciente
    obtenerPorPaciente: async (paciente_id) => {
        try {
            const [turnos] = await db.execute(`
                SELECT * FROM Turno 
                WHERE paciente_id = ?
                ORDER BY FechaTurno DESC, HoraTurno DESC
            `, [paciente_id]);

            return turnos;
        } catch (error) {
            console.error("❌ Error al obtener turnos del paciente:", error.message);
            throw error;
        }
    },

    // ✅ Obtener horarios disponibles de un profesional
    obtenerHorariosDisponibles: async (profesional_id, especialidad_id, fecha) => {
        try {
            const [horarios] = await db.execute(`
                SELECT HoraInicio, HoraFin  
                FROM HorariosDisponibles  
                WHERE profesional_id = ? AND especialidad_id = ?  
                AND DiaSemana = ELT(WEEKDAY(STR_TO_DATE(?, '%Y-%m-%d')) + 1, 
                    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')
            `, [profesional_id, especialidad_id, fecha]);

            return horarios;
        } catch (error) {
            console.error("❌ Error al obtener horarios disponibles:", error.message);
            throw error;
        }
    },

    // ✅ Obtener solo las horas ocupadas
    obtenerTurnosOcupados: async (profesional_id, especialidad_id, fecha) => {
        try {
            const [ocupados] = await db.execute(`
                SELECT HoraTurno 
                FROM Turno 
                WHERE profesional_id = ? AND especialidad_id = ? AND FechaTurno = ?
                AND estado IN ('Confirmado', 'En espera', 'Atendido')
            `, [profesional_id, especialidad_id, fecha]);

            return ocupados.map(t => t.HoraTurno);
        } catch (error) {
            console.error('❌ Error al obtener turnos ocupados:', error.message);
            throw error;
        }
    },

    // ✅ Cancelar turno
    cancelarTurno: async (id_turno, paciente_id) => {
        try {
            const [resultado] = await db.execute(`
                UPDATE Turno
                SET estado = 'Cancelado'
                WHERE id_turno = ? AND paciente_id = ?
            `, [id_turno, paciente_id]);

            if (resultado.affectedRows === 0) {
                throw new Error('No se encontró el turno o no pertenece al paciente');
            }

            return { message: '✅ Turno cancelado correctamente' };
        } catch (error) {
            console.error('❌ Error al cancelar turno:', error.message);
            throw error;
        }
    },

    // ✅ Obtener el próximo turno confirmado o en espera
    obtenerProximosTurnos: async (paciente_id) => {
        try {
            const [turnos] = await db.execute(`
                SELECT T.id_turno, T.FechaTurno, T.HoraTurno, T.estado, E.nombreEspecialidad, P.nombre_completo AS nombreProfesional
                FROM Turno T
                JOIN Especialidades E ON T.especialidad_id = E.id_especialidad
                JOIN Profesionales P ON T.profesional_id = P.id_profesional
                WHERE T.paciente_id = ? AND T.estado IN ('En espera', 'Confirmado')
                AND FechaTurno >= CURDATE()
                ORDER BY T.FechaTurno ASC, T.HoraTurno ASC
                LIMIT 1
            `, [paciente_id]);

            return turnos[0] || null;
        } catch (error) {
            console.error('❌ Error al obtener próximo turno:', error.message);
            throw error;
        }
    }
};

module.exports = Turno;
