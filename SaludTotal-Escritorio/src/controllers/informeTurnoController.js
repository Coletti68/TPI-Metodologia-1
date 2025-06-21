const { getPool } = require('../database/db');

async function obtenerTurnosPorProfesional(desde, hasta, profesionalId = null) {
    const pool = await getPool();

    let query = `
        SELECT 
            t.FechaTurno AS fecha,
            t.HoraTurno AS hora,
            p.nombre_completo AS paciente,
            pr.nombre_completo AS profesional,
            e.nombreEspecialidad AS especialidad,
            t.estado
        FROM Turno t
        JOIN Paciente p ON t.paciente_id = p.id_paciente
        JOIN Profesional pr ON t.profesional_id = pr.id_profesional
        JOIN Especialidad e ON t.especialidad_id = e.id_especialidad
        WHERE t.FechaTurno BETWEEN ? AND ?
    `;

    const params = [desde, hasta];

    if (profesionalId) {
        query += ` AND t.profesional_id = ?`;
        params.push(profesionalId);
    }

    query += ` ORDER BY t.FechaTurno`;

    const [rows] = await pool.query(query, params);
    return rows;
}

module.exports = {
    obtenerTurnosPorProfesional
};
