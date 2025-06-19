//turnocontroller.js
const Turno = require('../models/Turno');
const Especialidad = require('../models/especialidad');
const Profesional = require('../models/profesional');
const HorarioDisponible = require('../models/horariosdisponibles');

const turnoController = {

    // 👉 Traer especialidades para el combo
    obtenerEspecialidades: async (req, res) => {
        try {
            const especialidades = await Especialidad.obtenerTodas();
            res.json(especialidades);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener especialidades' });
        }
    },

    // 👉 Traer profesionales según especialidad
    obtenerProfesionalesPorEspecialidad: async (req, res) => {
        const { especialidad_id } = req.query;
        try {
            const profesionales = await Profesional.obtenerPorEspecialidad(especialidad_id);
            res.json(profesionales);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener profesionales' });
        }
    },

    // 👉 Ver horarios disponibles reales para un profesional y día
     horariosDisponibles: async (req, res) => {
        try {
            const { profesional_id, especialidad_id, fecha } = req.query;

            if (!profesional_id || !especialidad_id || !fecha) {
                return res.status(400).json({ error: 'Faltan parámetros para obtener horarios' });
            }

            const horarios = await HorarioDisponible.obtenerHorariosDisponibles(profesional_id, especialidad_id, fecha);
            const turnosOcupados = await Turno.obtenerTurnosOcupados(profesional_id, especialidad_id, fecha);

            const disponibles = [];

            horarios.forEach(h => {
                const inicio = h.HoraInicio;
                const fin = h.HoraFin;
                let current = new Date(`1970-01-01T${inicio}`);
                const end = new Date(`1970-01-01T${fin}`);

                while (current < end) {
                    const horaStr = current.toTimeString().slice(0, 5); // "HH:MM"
                    if (!turnosOcupados.includes(horaStr)) {
                        disponibles.push(horaStr);
                    }
                    current = new Date(current.getTime() + 30 * 60000);
                }
            });

            res.json({ horarios: disponibles });

        } catch (error) {
            res.status(500).json({ error: 'Error al obtener horarios disponibles' });
        }
    },

    // 👉 Crear turno si está disponible
    crearTurno: async (req, res) => {
    const { paciente_id, profesional_id, especialidad_id, fecha, hora } = req.body;

    if (!paciente_id || !profesional_id || !especialidad_id || !fecha || !hora) {
        return res.status(400).json({ error: 'Faltan datos para crear el turno' });
    }

    try {
        // Primero validar que no se pueda crear en fecha y hora pasada
        const ahora = new Date();
        const fechaHoraTurno = new Date(`${fecha}T${hora}:00`); // crea fecha+hora

        if (fechaHoraTurno < ahora) {
            return res.status(400).json({ error: 'No se puede agendar un turno en fecha y hora pasada' });
        }

        // Validar disponibilidad
        const disponible = await Turno.estaDisponible(profesional_id, especialidad_id, fecha, hora);
        if (!disponible) {
            return res.status(409).json({ error: 'Ya existe un turno en esa fecha y hora' });
        }

        const nuevoTurno = await Turno.crear(paciente_id, profesional_id, especialidad_id, fecha, hora);
        res.status(201).json({ message: 'Turno creado correctamente', turno: nuevoTurno });

    } catch (error) {
        res.status(500).json({ error: 'Error al crear el turno' });
    }
},

    // 👉 Historial de turnos
    obtenerHistorialTurnos: async (req, res) => {
        const { paciente_id } = req.params;
        try {
            const historial = await Turno.obtenerPorPaciente(paciente_id);
            res.json(historial);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener historial de turnos' });
        }
    },

  // 👉 Cancelar turno
cancelarTurno: async (req, res) => {
    console.log('Llega petición para cancelar turno:', req.params.id_turno, req.body);
    const { id_turno } = req.params;
    const { paciente_id } = req.body;

    try {
        const resultado = await Turno.cancelarTurno(id_turno, paciente_id);

        if (resultado && resultado.affectedRows > 0) {
            const pool = require('../db').getPool(); // ✅ corregido aquí
            await pool.execute(`
                INSERT INTO HistorialTurno (turno_id, paciente_id, estado_nuevo, fecha)
                VALUES (?, ?, ?, NOW())
            `, [id_turno, paciente_id, 'Cancelado']);
        }

        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
};

module.exports = turnoController;

