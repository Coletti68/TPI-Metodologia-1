window.addEventListener('DOMContentLoaded', () => {
  cargarProfesionales();
});

// Función para cargar profesionales en la tabla
async function cargarProfesionales() {
  try {
    const profesionales = await window.electronAPI.obtenerProfesionales();
    const tbody = document.querySelector('#tablaProfesionales tbody');
    tbody.innerHTML = '';

    console.log('👀 Profesionales cargados:', profesionales);

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
          <button onclick="editarProfesional(${p.id_profesional})" style="margin-right: 8px;">Editar</button>
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

// Mostrar el modal
document.getElementById('btnAgregarProfesional').addEventListener('click', () => {
  document.getElementById('modalAgregar').style.display = 'flex';
});

// Cerrar el modal
function cerrarModal() {
  document.getElementById('modalAgregar').style.display = 'none';
  document.getElementById('formNuevoProfesional').reset();
}

// Guardar nuevo profesional
document.getElementById('formNuevoProfesional').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nuevoProfesional = {
    dni: document.getElementById('dni').value.trim(),
    nombre_completo: document.getElementById('nombre_completo').value.trim(),
    sexo: document.getElementById('sexo').value,
    email: document.getElementById('email').value.trim(),
    especialidades: document.getElementById('especialidades').value.trim(),
    rol: document.getElementById('rol').value.trim()
  };

  // Validación mínima en JS
  if (!nuevoProfesional.dni || !nuevoProfesional.nombre_completo || !nuevoProfesional.sexo || !nuevoProfesional.email) {
    alert("Por favor complete todos los campos obligatorios.");
    return;
  }

  try {
    await window.electronAPI.agregarProfesional(nuevoProfesional);
    cerrarModal();
    await recargarTablaProfesionales(); // Evita reload completo
  } catch (error) {
    console.error("❌ Error al guardar profesional:", error);
    alert("Ocurrió un error al guardar el profesional.");
  }
});

// Recarga la tabla (destruye DataTable y vuelve a crearla)
async function recargarTablaProfesionales() {
  const tabla = $('#tablaProfesionales').DataTable();
  tabla.destroy();
  await cargarProfesionales();
}
