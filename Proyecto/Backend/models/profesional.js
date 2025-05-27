//models/profesional.js
const db = require('../db');
const Profesional = {
    obtenerPorEspecialidad: async (especialidad_id) => {
        try {
            const [profesionales] = await db.execute(`
                SELECT P.id_profesional, P.nombre_completo
                FROM Profesionales P
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



