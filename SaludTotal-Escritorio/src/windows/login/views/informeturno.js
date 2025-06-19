document.addEventListener('DOMContentLoaded', async () => {
    await cargarProfesionales();
    establecerFechasPorDefecto();

    document.getElementById('btnGenerar').addEventListener('click', async () => {
        const desde = document.getElementById('fechaDesde').value;
        const hasta = document.getElementById('fechaHasta').value;
        const profesionalId = document.getElementById('profesionalFiltro').value || null;

        if (desde > hasta) {
            alert('La fecha "desde" no puede ser mayor que la fecha "hasta".');
            return;
        }

        try {
            const turnos = await window.electronAPI.obtenerTurnosPorProfesional(desde, hasta, profesionalId);
            cargarTabla(turnos);
        } catch (error) {
            console.error('Error al obtener turnos:', error);
        }
    });
});

async function cargarProfesionales() {
    try {
        const profesionales = await window.electronAPI.obtenerProfesionales();
        const select = document.getElementById('profesionalFiltro');
        select.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Todos los profesionales';
        select.appendChild(defaultOption);

        profesionales.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id_profesional;
            option.textContent = p.nombre_completo;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando profesionales:', error);
    }
}

function establecerFechasPorDefecto() {
    const hoy = new Date();
    const fechaHasta = hoy.toISOString().split('T')[0];

    const hace30dias = new Date();
    hace30dias.setDate(hoy.getDate() - 30);
    const fechaDesde = hace30dias.toISOString().split('T')[0];

    const inputDesde = document.getElementById('fechaDesde');
    const inputHasta = document.getElementById('fechaHasta');

    inputDesde.value = fechaDesde;
    inputDesde.max = fechaHasta;

    inputHasta.value = fechaHasta;
    inputHasta.max = fechaHasta;
}

function cargarTabla(turnos) {
    const tbody = document.getElementById('tbodyTurnos');
    tbody.innerHTML = '';

    let confirmados = 0, cancelados = 0, espera = 0, atendidos = 0;

    turnos.forEach(t => {
        const fecha = new Date(t.fecha).toLocaleDateString('es-AR');
        const hora = t.hora?.slice(0, 5) || ''; // Formato HH:MM

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${fecha}</td>
            <td>${hora}</td>
            <td>${t.paciente}</td>
            <td>${t.profesional}</td>
            <td>${t.especialidad}</td>
            <td>${t.estado}</td>
        `;
        tbody.appendChild(fila);

        switch (t.estado) {
            case 'Confirmado': confirmados++; break;
            case 'Cancelado': cancelados++; break;
            case 'En espera': espera++; break;
            case 'Atendido': atendidos++; break;
        }
    });

    const total = turnos.length;
    document.getElementById('resumen').textContent =
        `Total: ${total} | Confirmados: ${confirmados} | Cancelados: ${cancelados} | En espera: ${espera} | Atendidos: ${atendidos}`;
}
