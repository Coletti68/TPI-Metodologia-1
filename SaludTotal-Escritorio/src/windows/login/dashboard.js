function abrirVentana(modulo) {
  window.electronAPI.abrirModulo(modulo);
}

function logout() {
  window.location = 'login.html';
}

window.addEventListener('DOMContentLoaded', async () => {
  const usuario = await window.electronAPI.getUsuario();

  if (!usuario) {
    alert('Sesión no válida. Redirigiendo al login.');
    window.location = 'login.html';
    return;
  }

  const rol = usuario.nombreRol;
  const nombre = usuario.nombre_completo;

// Supongamos que tenés la variable 'nombre' con el nombre del usuario:
document.getElementById('bienvenida').innerText = `Bienvenido/a  ${nombre}`;


  if (rol === 'Secretaria/o') {
    // Ocultar botones que no corresponden
    const ocultarIds = [
      'btnConfiguracion',
      'btnProfesionales',
      'btnReportes',
      'horarios',
      'informes',
      'contacto'
    ];
    
    ocultarIds.forEach(id => {
      const elemento = document.getElementById(id);
      if (elemento) elemento.style.display = 'none';
    });
  }
});
