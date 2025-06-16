const pool = require('../db').getPool();

const Profesional = {
    obtenerPorEspecialidad: async (especialidad_id) => {
        try {
            const [profesionales] = await pool.execute(`
                SELECT P.id_profesional, P.nombre_completo
                FROM Profesional P
                JOIN ProfesionalEspecialidad PE ON P.id_profesional = PE.profesional_id
                WHERE PE.especialidad_id = ?
            `, [especialidad_id]);

            return profesionales;
        } catch (error) {
            console.error("❌ Error al obtener profesionales:", error.message);
            throw error;
        }
    }
};

module.exports = Profesional;
