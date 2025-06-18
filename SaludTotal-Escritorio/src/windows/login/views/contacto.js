document.addEventListener('DOMContentLoaded', () => {
  cargarContactos();
});

let contactoSeleccionado = null;

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
        ${contacto.respondido ? '-' : `<button onclick="mostrarFormulario(${contacto.id_contacto}, '${contacto.email}')">Responder</button>`}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function mostrarFormulario(id, email) {
  contactoSeleccionado = { id, email };
  document.getElementById('infoContacto').innerText = `Responder a: ${email}`;
  document.getElementById('respuestaMensaje').value = '';
  document.getElementById('formRespuesta').style.display = 'block';
}

function cancelar() {
  contactoSeleccionado = null;
  document.getElementById('formRespuesta').style.display = 'none';
}

async function enviarRespuesta() {
  const respuesta = document.getElementById('respuestaMensaje').value.trim();
  if (!respuesta) return alert("La respuesta no puede estar vacía.");

  await window.electronAPI.responderContacto(contactoSeleccionado.id, respuesta);
  alert("Respuesta enviada.");
  cancelar();
  cargarContactos();
}
