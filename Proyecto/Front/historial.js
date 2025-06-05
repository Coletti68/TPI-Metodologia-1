// Front/js/historial.js
document.addEventListener("DOMContentLoaded", async () => {
  const pacienteId = localStorage.getItem("pacienteId");
  if (!pacienteId) {
    alert("⚠️ No se ha iniciado sesión.");
    return;
  }

  try {
    const res = await fetch(`/api/historial/${pacienteId}`);
    const historial = await res.json();

    const tabla = document.getElementById("tabla-historial");

    if (!historial.length) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="6">No hay historial disponible.</td>`;
      tabla.appendChild(row);
      return;
    }

    historial.forEach(turno => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${new Date(turno.fecha).toLocaleDateString()}</td>
        <td>${turno.FechaTurno}</td>
        <td>${turno.HoraTurno}</td>
        <td>${turno.nombreEspecialidad}</td>
        <td>${turno.profesional}</td>
        <td>${turno.estado_nuevo}</td>
      `;
      tabla.appendChild(fila);
    });
  } catch (error) {
    console.error("❌ Error al cargar historial:", error);
    alert("Error al cargar historial de turnos.");
  }
});
