
// Front/js/turnos.js
const profesionalSelect = document.getElementById("profesional");
const especialidadSelect = document.getElementById("especialidad");
const fechaInput = document.getElementById("fecha");
const horarioSelect = document.getElementById("horario");


document.addEventListener("DOMContentLoaded", () => {


  cargarEspecialidades();
  
  especialidadSelect.addEventListener("change", cargarProfesionales);
  profesionalSelect.addEventListener("change", cargarHorarios);
  fechaInput.addEventListener("change", cargarHorarios);
  document.getElementById("form-turno").addEventListener("submit", enviarTurno);
});


async function cargarEspecialidades() {
  try {
    const res = await fetch("/api/turnos/especialidades");
    const data = await res.json();
    const select = document.getElementById("especialidad");
    select.innerHTML = '<option value="">Seleccione una especialidad</option>';
    data.forEach(e => {
      const opt = document.createElement("option");
      opt.value = e.id_especialidad;
      opt.textContent = e.nombreEspecialidad;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Error cargando especialidades:", err);
  }
}

async function cargarProfesionales() {
  try {
    const especialidadId = document.getElementById("especialidad").value;
    if (!especialidadId) return; // No hacer nada si no hay selección

    const res = await fetch(`/api/turnos/profesionales?especialidad_id=${especialidadId}`);

    if (!res.ok) {
      console.error("Error en respuesta al cargar profesionales");
      return;
    }

    const data = await res.json();

    if (!data.length) {
      console.log("No hay profesionales para esta especialidad");
    }

    const select = document.getElementById("profesional");
    select.innerHTML = '<option value="">Seleccione un profesional</option>';
    data.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id_profesional;
      opt.textContent = p.nombre_completo;
      select.appendChild(opt);
    });
  } catch (error) {
    console.error("Error cargando profesionales:", error);
  }
}

    async function cargarHorarios() {
    console.log("🚀 Ejecutando cargarHorarios...");  // 📌 Verificación
    const profesional_id = profesionalSelect.value;
    const especialidad_id = especialidadSelect.value;
    const fecha = fechaInput.value;

    if (!profesional_id || !especialidad_id || !fecha) return;

    try {
        const response = await fetch(`/api/turnos/horarios-disponibles?profesional_id=${profesional_id}&especialidad_id=${especialidad_id}&fecha=${fecha}`);
        console.log("🔄 Fetch realizado, esperando respuesta...");  // 📌 Verificación
        const data = await response.json();
        console.log("📊 Datos recibidos:", data);  // 📌 Aquí deberían aparecer los horarios

        horarioSelect.innerHTML = ''; // Limpiar select

        if (data.horarios.length === 0) {
            const option = document.createElement('option');
            option.textContent = "No hay horarios disponibles";
            option.disabled = true;
            option.selected = true;
            horarioSelect.appendChild(option);
        } else {
            data.horarios.forEach(hora => {
                const option = document.createElement('option');
                option.value = hora;
                option.textContent = hora;
                horarioSelect.appendChild(option);
            });
        }

    } catch (error) {
        console.error("❌ Error al cargar horarios:", error);
    }
}
  

async function enviarTurno(e) {
  e.preventDefault();

  const pacienteId = localStorage.getItem("pacienteId"); 
  const especialidadId = document.getElementById("especialidad").value;
  const profesionalId = document.getElementById("profesional").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("horario").value;

  try {
    const res = await fetch("/api/turnos/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paciente_id: parseInt(pacienteId), // opcional: parseInt para asegurarse
        especialidad_id: especialidadId,
        profesional_id: profesionalId,
        fecha,
        hora
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Turno confirmado");
      document.getElementById("form-turno").reset();
    } else if (res.status === 409) {
      alert("⚠️ Ese turno ya está ocupado. Elegí otro horario.");
    } else {
      alert("❌ Error al crear turno: " + data.error || "Error desconocido");
    }

  } catch (error) {
    console.error("Error al enviar turno:", error);
    alert("❌ Error de conexión con el servidor");
  }
}
