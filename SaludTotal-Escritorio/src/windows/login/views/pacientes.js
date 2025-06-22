window.addEventListener('DOMContentLoaded', async () => {
  try {
    const usuario = await window.electronAPI.getUsuario();
    const rol = usuario.nombreRol.toLowerCase();

    // 👉 Agregamos la clase del rol al body dinámicamente
    document.body.classList.add(rol);

    const pacientes = await window.electronAPI.obtenerPacientes();
    const tbody = document.querySelector('#tablaPacientes tbody');
    const thead = document.querySelector('#tablaPacientes thead tr');

    // Limpiamos las cabeceras por si acaso
    thead.innerHTML = '';

    // Cabeceras dinámicas según el rol
    if (rol === 'admin') {
      thead.innerHTML = `
        <th>ID</th>
        <th>DNI</th>
        <th>Nombre</th>
        <th>Sexo</th>
        <th>Email</th>
        <th>Estado</th>
        <th>Acciones</th>
      `;
    } else {
      thead.innerHTML = `
        <th>DNI</th>
        <th>Nombre</th>
        <th>Acciones</th>
      `;
    }

    pacientes.forEach(p => {
      let fila = '<tr>';

      if (rol === 'admin') {
        fila += `
          <td>${p.id_paciente}</td>
          <td>${p.dni}</td>
          <td>${p.nombre_completo}</td>
          <td>${p.sexo}</td>
          <td>${p.email}</td>
          <td>${p.estado === 'activo' ? 'Activo' : 'Inactivo'}</td>
        `;
      } else {
        fila += `
          <td>${p.dni}</td>
          <td>${p.nombre_completo}</td>
        `;
      }

      fila += `
        <td>
          <button onclick="editarPaciente(${p.id_paciente})">Editar</button>
          <button onclick="eliminarPaciente(${p.id_paciente})" style="background-color:rgb(167, 37, 33); color: white; border: none; padding: 8px 10px; font-size: 15px; border-radius: 4px;">Eliminar</button>
          <button onclick="verHistorial(${p.id_paciente})">Ver Historial</button>
        </td>
      `;

      fila += '</tr>';
      tbody.innerHTML += fila;
    });

    $('#tablaPacientes').DataTable({
      language: {
        search: "Buscar:",
        lengthMenu: "Mostrar _MENU_ entradas",
        info: "Mostrando _START_ a _END_ de _TOTAL_ pacientes",
        paginate: {
          first: "Primero",
          last: "Último",
          next: "Siguiente",
          previous: "Anterior"
        },
        zeroRecords: "No se encontraron pacientes",
        infoEmpty: "Mostrando 0 a 0 de 0 pacientes",
        infoFiltered: "(filtrado de _MAX_ pacientes totales)"
      }
    });

  } catch (err) {
    console.error("Error al cargar pacientes:", err);
  }
});

// Función para editar paciente
async function editarPaciente(id) {
  const nombre = prompt("Nuevo nombre:");
  const dni = prompt("Nuevo DNI:");
  const sexo = prompt("Nuevo sexo (M/F):");
  const email = prompt("Nuevo email:");

  if (!nombre || !dni || !sexo || !email) return alert("Todos los campos son obligatorios");

  try {
    await window.electronAPI.editarPaciente(id, { nombre_completo: nombre, dni, sexo, email });
    alert("Paciente actualizado correctamente");
    location.reload();
  } catch (error) {
    console.error("Error al editar paciente:", error);
    alert("Error al editar paciente");
  }
}

// Función para inactivar paciente
async function eliminarPaciente(id) {
  if (!confirm("¿Estás seguro de que querés inactivar este paciente?")) return;

  try {
    await window.electronAPI.inactivarPaciente(id);
    alert("Paciente inactivado correctamente");
    location.reload();
  } catch (error) {
    console.error("Error al inactivar paciente:", error);
    alert("Error al inactivar paciente");
  }
}

// Función para ver historial de turnos
async function verHistorial(id) {
  try {
    const historial = await window.electronAPI.obtenerHistorialTurnos(id);
    let mensaje = "Historial de turnos:\n\n";
    historial.forEach(h => {
      mensaje += `Turno ID: ${h.turno_id}, Estado: ${h.estado_nuevo}, Fecha: ${new Date(h.fecha).toLocaleString()}\n`;
    });
    alert(mensaje);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    alert("Error al obtener historial");
  }
}
