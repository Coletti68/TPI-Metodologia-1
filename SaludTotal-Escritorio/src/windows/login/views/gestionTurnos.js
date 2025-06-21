document.addEventListener('DOMContentLoaded', () => {
    selectFiltro.addEventListener('change', () => {
        cargarTurnos(selectFiltro.value); // recarga al cambiar filtro
    });

    cargarTurnos(); // carga inicial sin filtro
});

const selectFiltro = document.getElementById('filtroEstado');
const tbody = document.getElementById('tbodyTurnos');

async function cargarTurnos(estado = "") {
    try {
        const turnos = await window.electronAPI.obtenerTurnos(estado || null);

        tbody.innerHTML = '';

        turnos.forEach(turno => {
            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>${turno.id_turno}</td>
                <td>${turno.paciente}</td>
                <td>${turno.profesional}</td>
                <td>${turno.fecha}</td>
                <td>${turno.hora}</td>
                <td>${turno.estado}</td>
                <td>
                    <button onclick="confirmarTurno(${turno.id_turno})">Confirmar</button>
                    <button onclick="cancelarTurno(${turno.id_turno})">Cancelar</button>
                    <button onclick="marcarAtendidoTurno(${turno.id_turno})">Atendido</button>
                    <button onclick="reprogramarTurno(${turno.id_turno})">Reprogramar</button>
                </td>
            `;

            tbody.appendChild(fila);
        });

    } catch (err) {
        console.error('Error al cargar turnos:', err);
    }
}


async function confirmarTurno(id) {
    const confirmar = confirm('¿Estás seguro que deseas confirmar este turno?');
    if (!confirmar) return;

    await window.electronAPI.actualizarEstadoTurno(id, 'Confirmado');
    cargarTurnos();
}

async function cancelarTurno(id) {
    const confirmar = confirm('¿Estás seguro que deseas cancelar este turno?');
    if (!confirmar) return;

    await window.electronAPI.actualizarEstadoTurno(id, 'Cancelado');
    cargarTurnos();
}

async function marcarAtendidoTurno(id) {
    const confirmar = confirm('¿Estás seguro que deseas marcar como atendido este turno?');
    if (!confirmar) return;

    await window.electronAPI.actualizarEstadoTurno(id, 'Atendido');
    cargarTurnos();
}

async function reprogramarTurno(id) {
  try {
    const { value: formValues } = await Swal.fire({
      title: 'Reprogramar turno',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Fecha (YYYY-MM-DD)">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Hora (HH:MM)">',
      focusConfirm: false,
      preConfirm: () => {
        const fecha = document.getElementById('swal-input1').value;
        const hora = document.getElementById('swal-input2').value;
        if (!fecha || !hora) {
          Swal.showValidationMessage('Ambos campos son obligatorios');
          return;
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
          Swal.showValidationMessage('Formato de fecha inválido');
          return;
        }
        if (!/^\d{2}:\d{2}:\d{2}$/.test(hora)) {
          Swal.showValidationMessage('Formato de hora inválido');
          return;
        }
        return { fecha, hora };
      }
    });

    if (!formValues) return; // Si canceló

    const confirmacion = await Swal.fire({
      title: '¿Confirmar reprogramación?',
      text: `Fecha: ${formValues.fecha} Hora: ${formValues.hora}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, reprogramar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      await window.electronAPI.reprogramarTurno(id, formValues.fecha, formValues.hora);
        cargarTurnos();
      Swal.fire('Reprogramado', 'El turno fue reprogramado correctamente', 'success');
    }

  } catch (error) {
    console.error('Error reprogramando turno:', error);
    Swal.fire('Error', 'Ocurrió un error al reprogramar el turno: ' + (error.message || error), 'error');
    }
}


