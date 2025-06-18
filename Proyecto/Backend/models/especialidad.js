const pool = require('../db').getPool();

const Especialidad = {
    obtenerTodas: async () => {
        try {
            const [especialidades] = await pool.execute(`
                SELECT * FROM Especialidad ORDER BY nombreEspecialidad
            `);
            return especialidades;
        } catch (error) {
            console.error('❌ Error al obtener especialidades:', error.message);
            throw error;
        }
    }
};

module.exports = Especialidad;
