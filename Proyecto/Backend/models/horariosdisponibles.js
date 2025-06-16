//models/horariodisponible.js
const pool = require('../db').getPool();

const HorarioDisponible = {
    obtenerHorariosDisponibles: async (profesional_id, especialidad_id, fecha) => {
        try {
            const [horarios] = await pool.execute(`
                SELECT HoraInicio, HoraFin  
                FROM HorarioDisponible 
                WHERE profesional_id = ? AND especialidad_id = ?
                AND DiaSemana = ELT(WEEKDAY(STR_TO_DATE(?, '%Y-%m-%d')) + 1, 
                    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')
            `, [profesional_id, especialidad_id, fecha]);

            return horarios;
        } catch (error) {
            console.error("❌ Error al obtener horarios:", error.message);
            throw error;
        }
    }
};

module.exports = HorarioDisponible;
