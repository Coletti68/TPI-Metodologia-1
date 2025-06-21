document.addEventListener('DOMContentLoaded', () => {
  cargarProfesionales();
  cargarEspecialidades();
  cargarRoles();
});

// Cargar profesionales
async function cargarProfesionales() {
  try {
    const profesionales = await window.electronAPI.obtenerProfesionales();
    const tbody = document.querySelector('#tablaProfesionales tbody');
    tbody.innerHTML = '';

    profesionales.forEach(p => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${p.id_profesional}</td>
        <td>${p.dni}</td>
        <td>${p.nombre_completo}</td>
        <td>${p.sexo}</td>
        <td>${p.email}</td>
        <td>${p.especialidades?.trim() || 'Sin especialidad'}</td>
        <td>${p.rol || 'Sin rol'}</td>
        <td>${p.estado === 1 ? 'Activo' : 'Inactivo'}</td>
        <td>
          <button onclick="editarProfesional(${p.id_profesional})">Editar</button>
          <button onclick="eliminarProfesional(${p.id_profesional})" style="background-color:rgb(167, 37, 33); color: white;">Eliminar</button>
        </td>
      `;
      tbody.appendChild(fila);
    });

    if (!$.fn.DataTable.isDataTable('#tablaProfesionales')) {
      $('#tablaProfesionales').DataTable({
        language: {
          search: "Buscar:",
          lengthMenu: "Mostrar _MENU_ entradas",
          info: "Mostrando _START_ a _END_ de _TOTAL_ profesionales",
          paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior"
          },
          zeroRecords: "No se encontraron profesionales",
          infoEmpty: "Mostrando 0 a 0 de 0 profesionales",
          infoFiltered: "(filtrado de _MAX_ profesionales totales)"
        }
      });
    }

  } catch (err) {
    console.error('❌ Error al cargar profesionales:', err);
  }
}

// Mostrar modal
document.getElementById('btnAgregarProfesional').addEventListener('click', () => {
  document.getElementById('modalAgregar').style.display = 'flex';
});

// Cerrar modal
function cerrarModal() {
  document.getElementById('modalAgregar').style.display = 'none';
  document.getElementById('formNuevoProfesional').reset();
  document.getElementById('contenedorHorarios').innerHTML = '';
}

// Agregar horario dinámico
function agregarHorario() {
  const contenedor = document.getElementById('contenedorHorarios');
  const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

  const div = document.createElement('div');
  div.classList.add('horario-item');
  div.innerHTML = `
    <select name="diaSemana" required>
      <option value="">Día</option>
      ${dias.map(d => `<option value="${d}">${d}</option>`).join('')}
    </select>
    <input type="time" name="horaInicio" required />
    <input type="time" name="horaFin" required />
    <button type="button" onclick="this.parentElement.remove()">🗑️</button>
  `;
  contenedor.appendChild(div);
}

// Guardar nuevo profesional
document.getElementById('formNuevoProfesional').addEventListener('submit', async (e) => {
  e.preventDefault();

  const especialidades = Array.from(document.getElementById('especialidad').selectedOptions).map(opt => parseInt(opt.value));

  const nuevoProfesional = {
    dni: document.getElementById('dni').value.trim(),
    nombre_completo: document.getElementById('nombre_completo').value.trim(),
    sexo: document.getElementById('sexo').value,
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value.trim(),
    rol_id: parseInt(document.getElementById('rol').value),
    especialidades,
    horarios: []
  };

  // Validaciones
  if (!nuevoProfesional.dni || !nuevoProfesional.nombre_completo || !nuevoProfesional.sexo || !nuevoProfesional.email || !nuevoProfesional.password) {
    alert("Por favor complete todos los campos obligatorios.");
    return;
  }

  if (especialidades.length === 0 || isNaN(nuevoProfesional.rol_id)) {
    alert("Seleccione al menos una especialidad y un rol válido.");
    return;
  }

  // Capturar horarios
  document.querySelectorAll('.horario-item').forEach(item => {
    const DiaSemana = item.querySelector('select[name="diaSemana"]').value;
    const HoraInicio = item.querySelector('input[name="horaInicio"]').value;
    const HoraFin = item.querySelector('input[name="horaFin"]').value;

    if (DiaSemana && HoraInicio && HoraFin) {
      nuevoProfesional.horarios.push({
        especialidad_id: especialidades[0], // Asignamos la principal
        DiaSemana,
        HoraInicio,
        HoraFin
      });
    }
  });

  try {
    await window.electronAPI.agregarProfesional(nuevoProfesional);
    cerrarModal();
    await recargarTablaProfesionales();
  } catch (error) {
    console.error("❌ Error al guardar profesional:", error);
    alert("Ocurrió un error al guardar el profesional.");
  }
});

// Recargar tabla
async function recargarTablaProfesionales() {
  const tabla = $('#tablaProfesionales').DataTable();
  tabla.destroy();
  await cargarProfesionales();
}

// Cargar especialidades
async function cargarEspecialidades() {
  try {
    const especialidades = await window.electronAPI.obtenerEspecialidades();
    const select = document.getElementById('especialidad');
    select.innerHTML = `<option value="">Seleccione una o más especialidades</option>`;
    especialidades.forEach(esp => {
      const option = document.createElement('option');
      option.value = esp.id_especialidad;
      option.textContent = esp.nombreEspecialidad;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("❌ Error al cargar especialidades:", error);
  }
}

// Cargar roles
async function cargarRoles() {
  try {
    const roles = await window.electronAPI.obtenerRoles();
    const select = document.getElementById('rol');
    select.innerHTML = '<option value="">Seleccione un rol</option>';
    roles.forEach(rol => {
      const option = document.createElement('option');
      option.value = rol.id_rol;
      option.textContent = rol.nombreRol;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('❌ Error al cargar roles:', err);
  }
}
