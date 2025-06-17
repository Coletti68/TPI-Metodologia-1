document.addEventListener('DOMContentLoaded', () => {
  cargarMensajesContacto();
});

async function cargarMensajesContacto() {
  const tbody = document.querySelector('#tablaContacto tbody');
  tbody.innerHTML = '';

  try {
    const mensajes = await window.electronAPI.obtenerMensajesContacto();

    mensajes.forEach(msg => {
      const tr = document.createElement('tr');
      tr.className = msg.respondido ? 'respondido' : 'pendiente';

      tr.innerHTML = `
        <td>${new Date(msg.fecha).toLocaleString()}</td>
        <td>${msg.email}</td>
        <td>${msg.motivo}</td>
        <td>${msg.mensaje}</td>
        <td>${msg.respondido ? 'Respondido' : 'Pendiente'}</td>
        <td>
          ${msg.respondido
            ? '—'
            : `<button onclick="marcarRespondido(${msg.id_contacto})">Marcar como respondido</button>`}
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error('Error cargando mensajes:', error);
    alert('Error cargando mensajes de contacto');
  }
}

async function marcarRespondido(id) {
  const confirmar = confirm('¿Estás seguro de marcar este mensaje como respondido?');
  if (!confirmar) return;

  try {
    await window.electronAPI.marcarContactoRespondido(id);
    cargarMensajesContacto();
  } catch (error) {
    console.error('Error actualizando estado:', error);
    alert('No se pudo marcar como respondido');
  }
}
