const Turno = require('../models/Turno');
const { generarBloquesDeTurno } = require('../utils/timeSlots');

//  Crear un nuevo turno
const crearTurno = async (req, res) => {
  try {
    const { paciente_id, profesional_id, especialidad_id, fechaTurno, horaTurno, motivo } = req.body;

    const disponible = await Turno.estaDisponible(profesional_id, especialidad_id, fechaTurno, horaTurno);

    if (!disponible) {
      return res.status(409).json({ error: ' Ese turno ya está ocupado' });
    }

    const result = await Turno.crear(paciente_id, profesional_id, especialidad_id, fechaTurno, horaTurno, motivo);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Obtener historial de turnos de un paciente
const historialTurnos = async (req, res) => {
  try {
    const { paciente_id } = req.params;
    const turnos = await Turno.obtenerPorPaciente(paciente_id);
    res.status(200).json(turnos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Ver horarios disponibles de un profesional para un día
const horariosDisponibles = async (req, res) => {
  try {
    const { profesional_id, especialidad_id, fechaTurno } = req.query;

    if (!profesional_id || !especialidad_id || !fechaTurno) {

      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }

    // Obtener el día de la semana (0: domingo, 1: lunes, ..., 6: sábado)
    const diaSemana = new Date(fechaTurno).getDay();

    const horarios = await Turno.obtenerHorariosDisponibles(profesional_id, especialidad_id, diaSemana);

    if (horarios.length === 0) {
      return res.status(404).json({ error: 'No hay horarios configurados para ese día' });
    }

    // Generar bloques por cada rango horario
    const bloques = horarios.flatMap(h =>
      generarBloquesDeTurno(h.HoraInicio, h.HoraFin)
    );

    // Obtener horas ya ocupadas
    const ocupados = await Turno.obtenerTurnosOcupados(profesional_id, especialidad_id, fechaTurno);

    // Filtrar bloques disponibles
    const disponibles = bloques.filter(b => !ocupados.includes(b.horaInicio));

    res.status(200).json(disponibles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Cancelar turno
const cancelarTurno = async (req, res) => {
  try {
    const { id_turno, paciente_id } = req.body;
    const result = await Turno.cancelarTurno(id_turno, paciente_id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ⏭ Obtener próximo turno confirmado o en espera
const proximoTurno = async (req, res) => {
  try {
    const { paciente_id } = req.params;
    const turno = await Turno.obtenerProximosTurnos(paciente_id);
    res.status(200).json(turno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearTurno,
  historialTurnos,
  horariosDisponibles,
  cancelarTurno,
  proximoTurno,
}