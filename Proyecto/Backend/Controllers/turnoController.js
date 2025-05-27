
//turnocontroller.js
const Turno = require('../models/Turno');
const Especialidad = require('../models/especialidad');
const Profesional = require('../models/profesional');
const HorariosDisponibles = require('../models/horariosdisponibles');

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

            const horarios = await HorariosDisponibles.obtenerHorariosDisponibles(profesional_id, especialidad_id, fecha);
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
    }
};

// 👉 Función auxiliar para generar los horarios disponibles en intervalos
function generarIntervalos(inicio, fin, ocupados, intervaloMin = 30) {
    const disponibles = [];
    const [hInicio, mInicio] = inicio.split(':').map(Number);
    const [hFin, mFin] = fin.split(':').map(Number);

    let actual = new Date(0, 0, 0, hInicio, mInicio);
    const finHora = new Date(0, 0, 0, hFin, mFin);

    while (actual < finHora) {
        const horaStr = actual.toTimeString().substring(0, 5) + ':00';

        if (!ocupados.includes(horaStr)) {
            disponibles.push(horaStr);
        }

        actual.setMinutes(actual.getMinutes() + intervaloMin);
    }

    return disponibles;
}

module.exports = turnoController;
