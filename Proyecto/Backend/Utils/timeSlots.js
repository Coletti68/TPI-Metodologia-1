// backend/utils/timeSlots.js

function generarBloquesDeTurno(horaInicio, horaFin, intervaloMin = 30) {
  const bloques = [];
  let inicio = new Date(`1970-01-01T${horaInicio}`);
  const fin = new Date(`1970-01-01T${horaFin}`);

  while (inicio < fin) {
    const siguiente = new Date(inicio.getTime() + intervaloMin * 60000);
    if (siguiente <= fin) {
      bloques.push({
        horaInicio: inicio.toTimeString().substring(0, 5),
        horaFin: siguiente.toTimeString().substring(0, 5),
      });
    }
    inicio = siguiente;
  }

  return bloques;
}

module.exports = { generarBloquesDeTurno };