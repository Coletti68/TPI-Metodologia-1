document.addEventListener('DOMContentLoaded', () => {
  cargarContactos();
});

async function cargarContactos() {
  const contactos = await window.electronAPI.obtenerContactos();
  const tbody = document.getElementById('tbodyContacto');
  tbody.innerHTML = '';

  contactos.forEach(contacto => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${contacto.id_contacto}</td>
      <td>${contacto.paciente_id || '-'}</td>
      <td>${contacto.email}</td>
      <td>${contacto.motivo}</td>
      <td>${contacto.mensaje}</td>
      <td>${new Date(contacto.fecha).toLocaleString()}</td>
      <td>${contacto.respondido ? 'Sí' : 'No'}</td>
      <td>
        ${contacto.respondido ? '-' : `<button onclick="marcarRespondido(${contacto.id_contacto})">Marcar como respondido</button>`}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function marcarRespondido(id) {
  try {
    await window.electronAPI.responderContacto(id);

    // Actualizar directamente la fila afectada
    const fila = [...document.querySelectorAll('#tbodyContacto tr')]
      .find(tr => tr.firstElementChild.textContent == id);

    if (fila) {
      fila.children[6].textContent = 'Sí'; // Columna "Respondido"
      fila.children[7].innerHTML = '-';    // Quitar botón
    }

    alert("Contacto marcado como respondido.");
  } catch (e) {
    console.error(e);
    alert("Error al actualizar estado.");
  }
}
