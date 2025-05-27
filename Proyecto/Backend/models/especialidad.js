const db = require('../db');

const Especialidad = {
    obtenerTodas: async () => {
        try {
            const [especialidades] = await db.execute(`SELECT * FROM Especialidades ORDER BY nombreEspecialidad`);
            return especialidades;
        } catch (error) {
            console.error('❌ Error al obtener especialidades:', error.message);
            throw error;
        }
    }
};

module.exports = Especialidad;