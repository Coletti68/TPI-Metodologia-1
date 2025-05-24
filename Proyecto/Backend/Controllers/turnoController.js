
const turnoModel = require('../Models/turno');
const { generarBloquesDeTurno } = require('../../utils/timeSlots');

const obtenerTurnosDisponibles = async (req, res) => {
  const { profesional_id, especialidad_id, diaSemana, fecha } = req.query;

  try {
    const horarios = await turnoModel.obtenerHorariosDisponibles(profesional_id, especialidad_id, diaSemana);
    const turnosOcupados = await turnoModel.obtenerTurnosOcupados(profesional_id, especialidad_id, fecha);

    let bloquesDisponibles = [];

    for (const horario of horarios) {
      const bloques = generarBloquesDeTurno(horario.HoraInicio, horario.HoraFin);
      const filtrados = bloques.filter(b =>
        !turnosOcupados.includes(b.horaInicio + ':00') // porque HoraTurno es TIME
      );
      bloquesDisponibles = bloquesDisponibles.concat(filtrados);
    }

    res.json(bloquesDisponibles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener turnos disponibles' });
  }
};