document.addEventListener('DOMContentLoaded', () => {
    cargarTurnos();
});

async function cargarTurnos() {
    try {
        const turnos = await window.electronAPI.obtenerTurnos();

        const tbody = document.getElementById('tbodyTurnos');
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
    await window.electronAPI.actualizarEstadoTurno(id, 'Confirmado');
    cargarTurnos();
}

async function cancelarTurno(id) {
    await window.electronAPI.actualizarEstadoTurno(id, 'Cancelado');
    cargarTurnos();
}

async function reprogramarTurno(id) {
    const nuevaFecha = prompt('Nueva fecha (YYYY-MM-DD):');
    const nuevaHora = prompt('Nueva hora (HH:MM:SS):');
    if (nuevaFecha && nuevaHora) {
        await window.electronAPI.reprogramarTurno(id, nuevaFecha, nuevaHora);
        cargarTurnos();
    }
}
