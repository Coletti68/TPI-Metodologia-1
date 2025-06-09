window.addEventListener('DOMContentLoaded', async () => {
  try {
    const usuario = await window.electronAPI.getUsuario();
    const rol = usuario.nombreRol.toLowerCase();

    // 👉 Agregamos la clase del rol al body dinámicamente
    document.body.classList.add(rol); // Esto será 'admin', 'secretaria', etc.

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
          <td>${p.estado === 1 ? 'Activo' : 'Inactivo'}</td>
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
          <button onclick="eliminarPaciente(${p.id_paciente})" style="background-color:rgb(167, 37, 33); color: white; border: none; padding: 5px 10px; border-radius: 4px; padding: 8px 10px;
          font-size: 15px;">Eliminar</button>
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

